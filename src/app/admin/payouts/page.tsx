"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Space,
  Typography,
  Avatar,
  Tooltip,
  message,
  Segmented,
  Row,
  Col,
  Modal,
  Divider,
  Checkbox,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  DollarOutlined,
  BankOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ArrowUpOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import type { ColumnsType } from "antd/es/table";
import type { AdminPayoutItem, PaginatedResponse } from "@/interfaces/admin";
import dayjs from "dayjs";
import { ADMIN_PAYOUT_STATUS_MAP, ADMIN_PAYOUT_TAB_FILTERS } from "@/constants/payment";

const { Title, Text } = Typography;
const { TextArea } = Input;


export default function AdminPayoutsPage() {
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const { mutate: updatePayout, isPending: isUpdating } = useMutation({
    mutationFn: async (payload: { id: number; data: any }) => {
      const res = await fetcher.put(`/payments/admin/payouts/${payload.id}`, payload.data);
      return res.data;
    },
    onSuccess: (resData) => {
      messageApi.success(typeof resData === "string" ? resData : "Cập nhật yêu cầu thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      setDetailModalOpen(false);
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật!");
    }
  });

  // Detail modal (matching the reference design)
  const [selectedPayout, setSelectedPayout] = useState<AdminPayoutItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [proofImage, setProofImage] = useState("");

  const statusParam = activeTab === "ALL" ? undefined : activeTab;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-payouts", pageNo, pageSize, statusParam],
    queryFn: async () => {
      const params: Record<string, unknown> = { pageNo, pageSize };
      if (statusParam) params.status = statusParam;
      const res = await fetcher.get("/payments/admin/payouts", { params });
      return res.data?.data as PaginatedResponse<AdminPayoutItem>;
    },
  });

  const handleViewDetail = (record: AdminPayoutItem) => {
    setSelectedPayout(record);
    setAdminNote(record.adminNote || "");
    setBankRef(record.bankTransactionRef || "");
    // Proof image isn't currently in AdminPayoutItem interface, but if returned by API we set it
    setProofImage((record as any).proofImageUrl || "");
    setDetailModalOpen(true);
  };

  const handleApprove = () => {
    if (!selectedPayout) return;
    if (!bankRef.trim()) {
      return messageApi.warning("Vui lòng nhập Mã giao dịch ngân hàng!");
    }
    updatePayout({
      id: selectedPayout.id,
      data: {
        isApproved: true,
        bankTransactionRef: bankRef,
        proofImageUrl: proofImage,
        adminNote: adminNote,
      }
    });
  };

  const handleReject = () => {
    if (!selectedPayout) return;
    if (!adminNote.trim()) {
      return messageApi.warning("Vui lòng nhập Lý do từ chối vào Ghi chú nội bộ!");
    }
    updatePayout({
      id: selectedPayout.id,
      data: {
        isApproved: false,
        bankTransactionRef: bankRef,
        proofImageUrl: proofImage,
        adminNote: adminNote,
      }
    });
  };

  const filteredItems = useMemo(() => {
    return (data?.items || []).filter((item) => {
      if (!searchText) return true;
      const s = searchText.toLowerCase();
      return item.hostName?.toLowerCase().includes(s) || item.hostEmail?.toLowerCase().includes(s) || item.accountNumber?.includes(s) || item.bankTransactionRef?.toLowerCase().includes(s);
    });
  }, [data?.items, searchText]);

  // Stats
  const allItems = data?.items || [];
  const totalPending = allItems.filter((i) => i.status === "REQUESTED").reduce((sum, i) => sum + (i.amount || 0), 0);
  const pendingCount = allItems.filter((i) => i.status === "REQUESTED" || i.status === "PROCESSING").length;
  const totalCompleted = allItems.filter((i) => i.status === "COMPLETED").reduce((sum, i) => sum + (i.amount || 0), 0);
  const rejectedCount = allItems.filter((i) => i.status === "REJECTED").length;

  const columns: ColumnsType<AdminPayoutItem> = [
    {
      title: "",
      key: "checkbox",
      width: 40,
      render: () => <Checkbox />,
    },
    {
      title: "Mã ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: number) => <Text style={{ fontSize: 13, fontFamily: "monospace", color: "#475569" }}>WR-{String(id).padStart(4, "0")}</Text>,
    },
    {
      title: "Đơn vị lưu trú / Host",
      key: "host",
      width: 260,
      render: (_: unknown, record: AdminPayoutItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar src={record.hostAvatarUrl} icon={<UserOutlined />} size={38} />
          <div style={{ minWidth: 0 }}>
            <Tooltip title={record.hostName || "--"}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {record.hostName || "--"}
              </div>
            </Tooltip>
            <Tooltip title={record.hostEmail || "--"}>
              <div style={{ fontSize: 12, color: "#94a3b8",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {record.hostEmail || "--"}
              </div>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 160,
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
      render: (amount: number) => (
        <Text strong style={{ fontSize: 14, color: "#2DD4A8" }}>
          {amount != null ? `${amount.toLocaleString("vi-VN")} VNĐ` : "--"}
        </Text>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      sorter: true,
      render: (date: string) => <Text style={{ fontSize: 13, color: "#475569" }}>{date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "--"}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => {
        const s = ADMIN_PAYOUT_STATUS_MAP[status] || { color: "default", label: status, icon: null };
        return <Tag color={s.color} style={{ borderRadius: 6, fontWeight: 500 }}>{s.label}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_: unknown, record: AdminPayoutItem) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} style={{ color: "#2DD4A8" }} />
          </Tooltip>
          {record.status === "REQUESTED" && (
            <Tooltip title="Từ chối">
              <Button type="text" size="small" icon={<CloseCircleOutlined />} style={{ color: "#ff4d4f" }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#1a1a2e" }}>Yêu cầu Rút tiền</Title>
          <Text style={{ color: "#94a3b8", fontSize: 14 }}>Quản lý và phê duyệt các khoản thanh toán cho đối tác (Hosts).</Text>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, height: "100%" }} styles={{ body: { padding: "20px" } }}>
            <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Tổng tiền chờ duyệt</Text>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1677ff", lineHeight: 1.2, marginTop: 4 }}>
              {totalPending.toLocaleString("vi-VN")}đ
              <span style={{ fontSize: 18, marginLeft: 4 }}>
                <BankOutlined style={{ fontSize: 16, color: "#1677ff" }} />
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#2DD4A8", marginTop: 4, fontWeight: 500 }}>
              <ArrowUpOutlined style={{ fontSize: 10, marginRight: 4 }} />12% so với tháng trước
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, height: "100%" }} styles={{ body: { padding: "20px" } }}>
            <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Yêu cầu đang đợi</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2, marginTop: 4 }}>{pendingCount}</div>
              <ClockCircleOutlined style={{ fontSize: 20, color: "#faad14" }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, height: "100%" }} styles={{ body: { padding: "20px" } }}>
            <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Đã chi trả (Tháng này)</Text>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#52c41a", lineHeight: 1.2, marginTop: 4 }}>
              {totalCompleted.toLocaleString("vi-VN")}đ
              <span style={{ fontSize: 18, marginLeft: 4 }}>
                <CheckCircleOutlined style={{ fontSize: 16, color: "#52c41a" }} />
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#2DD4A8", marginTop: 4, fontWeight: 500 }}>
              <ArrowUpOutlined style={{ fontSize: 10, marginRight: 4 }} />8.5% so với tháng trước
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, height: "100%" }} styles={{ body: { padding: "20px" } }}>
            <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Yêu cầu bị từ chối</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2, marginTop: 4 }}>
                {String(rejectedCount).padStart(2, "0")}
              </div>
              <CloseCircleOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Table Card */}
      <Card bordered={false} style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flex: "1 1 200px", flexWrap: "wrap" }}>
            <Input
              placeholder="Tìm theo tên Host hoặc mã ID..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1, minWidth: 200, maxWidth: 300, borderRadius: 8, height: 38 }}
              allowClear
            />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", maxWidth: "100%" }}>
            <div style={{ maxWidth: "100%", overflowX: "auto" }}>
              <Segmented
                options={ADMIN_PAYOUT_TAB_FILTERS}
                value={activeTab}
                onChange={(val) => { setActiveTab(val as string); setPageNo(1); }}
                style={{ borderRadius: 8 }}
              />
            </div>
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 8, height: 38 }}>Xuất CSV</Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          loading={isLoading || isFetching}
          scroll={{ x: 1000 }}
          pagination={{
            current: pageNo,
            pageSize,
            total: data?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `Hiển thị ${range[0]} - ${range[1]} của ${total} yêu cầu`,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (page, size) => { setPageNo(page); setPageSize(size); },
            style: { padding: "0 20px" },
          }}
        />
      </Card>

      {/* ============ DETAIL MODAL (matching reference design) ============ */}
      <Modal
        open={detailModalOpen}
        onCancel={() => { setDetailModalOpen(false); setSelectedPayout(null); }}
        footer={null}
        width={520}
        styles={{ body: { padding: 0 } }}
        closable
      >
        {selectedPayout && (
          <div>
            {/* Blue Top Bar */}
            <div style={{ height: 5, background: "linear-gradient(90deg, #2DD4A8, #22b892)", borderRadius: "8px 8px 0 0" }} />

            <div style={{ padding: "24px 28px" }}>
              {/* ID & Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Tag color="processing" style={{ borderRadius: 12, padding: "2px 14px", fontWeight: 600, fontSize: 13 }}>
                  WR-{String(selectedPayout.id).padStart(4, "0")}
                </Tag>
                <Tag style={{ borderRadius: 6, padding: "4px 14px", fontWeight: 500, fontSize: 13 }}>
                  {ADMIN_PAYOUT_STATUS_MAP[selectedPayout.status]?.label || selectedPayout.status}
                </Tag>
              </div>

              {/* Title */}
              <Title level={4} style={{ margin: 0, color: "#1a1a2e", fontWeight: 800 }}>
                Chi tiết yêu cầu rút tiền
              </Title>
              <Text style={{ color: "#94a3b8", fontSize: 13 }}>
                Xem xét thông tin thanh toán trước khi phê duyệt giao dịch.
              </Text>

              {/* Host Info Card */}
              <div style={{ background: "#f8f9fb", borderRadius: 12, padding: "16px 20px", marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar src={selectedPayout.hostAvatarUrl} icon={<UserOutlined />} size={56} />
                <div>
                  <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>{selectedPayout.hostName || "--"}</Text>
                  <div style={{ fontSize: 13, color: "#94a3b8" }}>
                    <MailOutlined style={{ marginRight: 4 }} />
                    {selectedPayout.hostEmail || "--"}
                  </div>
                </div>
              </div>

              {/* Amount & Date */}
              <Row gutter={16} style={{ marginTop: 16 }}>
                <Col span={12}>
                  <div style={{ background: "#f0fdf8", borderRadius: 10, padding: "14px 16px", border: "1px solid #d1fae5" }}>
                    <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Số tiền yêu cầu</Text>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#2DD4A8", marginTop: 4 }}>
                      {selectedPayout.amount != null ? `${selectedPayout.amount.toLocaleString("vi-VN")} VNĐ` : "--"}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
                    <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Ngày yêu cầu</Text>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginTop: 4 }}>
                      {selectedPayout.createdAt ? dayjs(selectedPayout.createdAt).format("YYYY-MM-DD HH:mm") : "--"}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Bank Info */}
              <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "14px 16px", marginTop: 16, border: "1px solid #f0f0f0" }}>
                <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Thông tin tài khoản ngân hàng</Text>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <BankOutlined style={{ fontSize: 18, color: "#475569" }} />
                  <Text strong style={{ fontSize: 15, color: "#1a1a2e" }}>
                    {selectedPayout.bankCode || "--"} - **** {selectedPayout.accountNumber?.slice(-4) || "----"}
                  </Text>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                  Chủ TK: {selectedPayout.accountHolderName || "--"}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>
                  * Vui lòng đối chiếu mã định danh trước khi xác nhận chuyển khoản thủ công.
                </div>
                {selectedPayout.bankTransactionRef && selectedPayout.status !== "REQUESTED" && (
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>
                    Mã GD: <Text code>{selectedPayout.bankTransactionRef}</Text>
                  </div>
                )}
                {(selectedPayout as any).proofImageUrl && selectedPayout.status !== "REQUESTED" && (
                  <div style={{ marginTop: 8 }}>
                    <a href={(selectedPayout as any).proofImageUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#1677ff", textDecoration: "underline" }}>
                      Xem biên lai chuyển khoản đính kèm
                    </a>
                  </div>
                )}
              </div>

              {/* Approval Info Inputs */}
              {(selectedPayout.status === "REQUESTED" || selectedPayout.status === "PROCESSING") && (
                <div style={{ marginTop: 20 }}>
                  <Text strong style={{ fontSize: 14 }}>Thông tin chuyển khoản (Dành cho Admin)</Text>
                  <div style={{ marginTop: 8, display: "flex", gap: 12, flexDirection: "column" }}>
                    <Input
                      placeholder="Nhập Mã giao dịch ngân hàng (Bắt buộc khi duyệt)"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      style={{ borderRadius: 8 }}
                      prefix={<BankOutlined style={{ color: "#bfbfbf" }} />}
                    />
                    <Input
                      placeholder="Đường dẫn ảnh chụp UNC / Biên lai (Không bắt buộc)"
                      value={proofImage}
                      onChange={(e) => setProofImage(e.target.value)}
                      style={{ borderRadius: 8 }}
                      prefix={<LinkOutlined style={{ color: "#bfbfbf" }} />}
                    />
                  </div>
                </div>
              )}

              {/* Admin Note */}
              <div style={{ marginTop: 20 }}>
                <Text strong style={{ fontSize: 14 }}>Ghi chú nội bộ / Lý do từ chối</Text>
                <TextArea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Nhập ghi chú hoặc lý do nếu từ chối yêu cầu này..."
                  style={{ marginTop: 8, borderRadius: 8 }}
                />
              </div>

              {/* Actions */}
              {(selectedPayout.status === "REQUESTED" || selectedPayout.status === "PROCESSING") ? (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                  <Button onClick={() => setDetailModalOpen(false)} style={{ borderRadius: 8, height: 40 }} disabled={isUpdating}>
                    Để sau
                  </Button>
                  <Button danger style={{ borderRadius: 8, height: 40, minWidth: 100 }} onClick={handleReject} loading={isUpdating}>
                    Từ chối
                  </Button>
                  <Button type="primary" style={{ borderRadius: 8, height: 40, minWidth: 100, background: "#2DD4A8", borderColor: "#2DD4A8" }} onClick={handleApprove} loading={isUpdating}>
                    Duyệt chi
                  </Button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                  <Button onClick={() => setDetailModalOpen(false)} style={{ borderRadius: 8, height: 40 }}>
                    Đóng
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
