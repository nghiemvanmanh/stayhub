"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Button,
  Space,
  Avatar,
  Tooltip,
  message,
  Row,
  Col,
  Checkbox,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  DollarOutlined,
  BankOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ArrowUpOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { PageContainer, ProTable, StatisticCard } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import type { AdminPayoutItem, PaginatedResponse } from "@/interfaces/admin";
import dayjs from "dayjs";
import { ADMIN_PAYOUT_STATUS_MAP, ADMIN_PAYOUT_TAB_FILTERS } from "@/constants/payment";
import { PayoutDetailDrawer } from "@/components/admin/payouts/PayoutDetailDrawer";

const { Statistic: ProStatistic } = StatisticCard;

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
    },
  });

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
    if (!bankRef.trim()) return messageApi.warning("Vui lòng nhập Mã giao dịch ngân hàng!");
    updatePayout({
      id: selectedPayout.id,
      data: { isApproved: true, bankTransactionRef: bankRef, proofImageUrl: proofImage, adminNote },
    });
  };

  const handleReject = ({ bankRef, proofImage, adminNote }: { bankRef: string; proofImage: string; adminNote: string }) => {
    if (!selectedPayout) return;
    if (!adminNote.trim()) return messageApi.warning("Vui lòng nhập Lý do từ chối vào Ghi chú nội bộ!");
    updatePayout({
      id: selectedPayout.id,
      data: { isApproved: false, bankTransactionRef: bankRef, proofImageUrl: proofImage, adminNote },
    });
  };

  const filteredItems = useMemo(() => {
    return (data?.items || []).filter((item) => {
      if (!searchText) return true;
      const s = searchText.toLowerCase();
      return (
        item.hostName?.toLowerCase().includes(s) ||
        item.hostEmail?.toLowerCase().includes(s) ||
        item.accountNumber?.includes(s) ||
        item.bankTransactionRef?.toLowerCase().includes(s)
      );
    });
  }, [data?.items, searchText]);

  const allItems = data?.items || [];
  const totalPending = allItems.filter((i) => i.status === "REQUESTED").reduce((sum, i) => sum + (i.amount || 0), 0);
  const pendingCount = allItems.filter((i) => i.status === "REQUESTED" || i.status === "PROCESSING").length;
  const totalCompleted = allItems.filter((i) => i.status === "COMPLETED").reduce((sum, i) => sum + (i.amount || 0), 0);
  const rejectedCount = allItems.filter((i) => i.status === "REJECTED").length;

  const columns: ProColumns<AdminPayoutItem>[] = [
    {
      title: "Mã ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (_: any, record: AdminPayoutItem) => (
        <span style={{ fontSize: 13, fontFamily: "monospace", color: "#475569" }}>
          WR-{String(record.id).padStart(4, "0")}
        </span>
      ),
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
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {record.hostName || "--"}
              </div>
            </Tooltip>
            <Tooltip title={record.hostEmail || "--"}>
              <div style={{ fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
      render: (_: any, record: AdminPayoutItem) => (
        <span style={{ fontWeight: 700, fontSize: 14, color: "#2DD4A8" }}>
          {record.amount != null ? `${record.amount.toLocaleString("vi-VN")} VNĐ` : "--"}
        </span>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      sorter: true,
      render: (date: any) => (
        <span style={{ fontSize: 13, color: "#475569" }}>
          {date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "--"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: any) => {
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

  const tabItems = (ADMIN_PAYOUT_TAB_FILTERS as any[]).map((f: any) => ({
    key: typeof f === "string" ? f : f.value,
    label: typeof f === "string" ? f : f.label,
  }));

  return (
    <PageContainer
      header={{
        title: "Yêu cầu Rút tiền",
        subTitle: "Quản lý và phê duyệt các khoản thanh toán cho đối tác (Hosts).",
      }}
    >
      {contextHolder}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tổng tiền chờ duyệt",
              value: totalPending,
              suffix: "đ",
              description: (
                <div style={{ fontSize: 12, color: "#2DD4A8", fontWeight: 500 }}>
                  <ArrowUpOutlined style={{ fontSize: 10, marginRight: 4 }} />
                  12% so với tháng trước
                </div>
              ),
              icon: <BankOutlined style={{ fontSize: 20, color: "#1677ff" }} />,
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Yêu cầu đang đợi",
              value: pendingCount,
              icon: <ClockCircleOutlined style={{ fontSize: 20, color: "#faad14" }} />,
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Đã chi trả (Tháng này)",
              value: totalCompleted,
              suffix: "đ",
              description: (
                <div style={{ fontSize: 12, color: "#2DD4A8", fontWeight: 500 }}>
                  <ArrowUpOutlined style={{ fontSize: 10, marginRight: 4 }} />
                  8.5% so với tháng trước
                </div>
              ),
              icon: <CheckCircleOutlined style={{ fontSize: 20, color: "#52c41a" }} />,
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Yêu cầu bị từ chối",
              value: String(rejectedCount).padStart(2, "0"),
              icon: <CloseCircleOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />,
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
      </Row>

      {/* ProTable */}
      <ProTable<AdminPayoutItem>
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={isLoading || isFetching}
        search={false}
        scroll={{ x: 'max-content' }}
        cardBordered
        headerTitle="Danh sách yêu cầu rút tiền"
        options={{
          reload: () => refetch(),
          density: true,
          setting: true,
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeTab,
            items: tabItems,
            onChange: (key) => {
              setActiveTab(key as string);
              setPageNo(1);
            },
          },
          search: {
            placeholder: "Tìm theo tên Host hoặc mã ID...",
            onSearch: (value: string) => setSearchText(value),
            allowClear: true,
          },
        }}
        toolBarRender={() => [
          <Button key="export" icon={<DownloadOutlined />}>
            Xuất CSV
          </Button>,
        ]}
        pagination={{
          current: pageNo,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `Hiển thị ${range[0]} - ${range[1]} của ${total} yêu cầu`,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (page, size) => {
            setPageNo(page);
            setPageSize(size);
          },
        }}
      />

      <PayoutDetailDrawer
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPayout(null);
        }}
        payout={selectedPayout}
        isUpdating={isUpdating}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </PageContainer>
  );
}
