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
  Drawer,
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
import { PayoutDetailDrawer } from "@/components/admin/payouts/PayoutDetailDrawer";

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

  const statusParam = activeTab === "ALL" ? undefined : activeTab;

  const { data, isLoading, isFetching, refetch } = useQuery({
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
    setDetailModalOpen(true);
  };

  const handleApprove = ({ bankRef, proofImage, adminNote }: { bankRef: string; proofImage: string; adminNote: string }) => {
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

  const handleReject = ({ bankRef, proofImage, adminNote }: { bankRef: string; proofImage: string; adminNote: string }) => {
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
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} style={{ borderRadius: 8, height: 38 }} />
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

      <PayoutDetailDrawer
        open={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedPayout(null); }}
        payout={selectedPayout}
        isUpdating={isUpdating}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
