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
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  StarOutlined,
  ArrowUpOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { PageContainer, ProTable, StatisticCard } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import type {
  HostApplicationItem,
  HostApplicationDetail,
  PaginatedResponse,
} from "@/interfaces/admin";
import dayjs from "dayjs";
import {
  HOST_APPLICATION_STATUS_MAP,
  ALL_HOST_STATUSES,
  HOST_APPLICATION_TAB_FILTERS,
} from "@/constants/host-application";
import { ApplicationDetailDrawer } from "@/components/admin/host-applications/ApplicationDetailDrawer";
import { ApplicationApprovalModal } from "@/components/admin/host-applications/ApplicationApprovalModal";

export default function AdminHostApplicationsPage() {
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  // Detail drawer
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedHostCode, setSelectedHostCode] = useState<string | null>(null);

  // Approval modal
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<string>("APPROVED");
  const [approvalHostCode, setApprovalHostCode] = useState("");

  const statusParam = activeTab === "ALL" ? undefined : activeTab;

  // Fetch list
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-host-applications", pageNo, pageSize, statusParam],
    queryFn: async () => {
      const params: Record<string, unknown> = { pageNo, pageSize };
      if (statusParam) params.status = statusParam;
      const res = await fetcher.get("/auth/admin/host-applications", { params });
      return res.data?.data as PaginatedResponse<HostApplicationItem>;
    },
  });

  // Fetch detail
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-host-detail", selectedHostCode],
    queryFn: async () => {
      if (!selectedHostCode) return null;
      const res = await fetcher.get(
        `/auth/admin/host-applications/${selectedHostCode}`
      );
      return res.data?.data as HostApplicationDetail;
    },
    enabled: !!selectedHostCode,
  });

  // Approval mutation
  const approvalMutation = useMutation({
    mutationFn: async (d: {
      hostCode: string;
      status: string;
      reviewNote: string;
    }) => {
      return fetcher.put(
        `/auth/admin/approval-host?hostCode=${d.hostCode}`,
        { status: d.status, reviewNote: d.reviewNote }
      );
    },
    onSuccess: () => {
      const label =
        ALL_HOST_STATUSES.find((s) => s.value === approvalAction)?.label ??
        HOST_APPLICATION_STATUS_MAP[approvalAction]?.label ??
        approvalAction;
      messageApi.success(`Đã cập nhật trạng thái Host: ${label}`);
      setApprovalModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-host-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-host-detail"] });
    },
    onError: (error: any) => {
      messageApi.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi thẩm định hồ sơ"
      );
    },
  });

  const handleViewDetail = (hostCode: string) => {
    setSelectedHostCode(hostCode);
    setDetailDrawerOpen(true);
  };

  const handleOpenApproval = (hostCode: string, targetStatus: string) => {
    setApprovalHostCode(hostCode);
    setApprovalAction(targetStatus);
    setApprovalModalOpen(true);
  };

  const handleSubmitApproval = (note: string) => {
    approvalMutation.mutate({
      hostCode: approvalHostCode,
      status: approvalAction,
      reviewNote: note.trim(),
    });
  };

  // Client-side search
  const filteredItems = useMemo(() => {
    return (data?.items || []).filter((item) => {
      if (!searchText) return true;
      const s = searchText.toLowerCase();
      return (
        item.fullName?.toLowerCase().includes(s) ||
        item.email?.toLowerCase().includes(s) ||
        item.hostCode?.toLowerCase().includes(s)
      );
    });
  }, [data?.items, searchText]);

  // Stats
  const totalHosts = data?.totalElements || 0;
  const pendingKYC = (data?.items || []).filter(
    (i) =>
      i.onboardingStatus === "PENDING_REVIEW" ||
      i.onboardingStatus === "UNVERIFIED"
  ).length;

  const columns: ProColumns<HostApplicationItem>[] = [
    {
      title: "Họ tên & Liên hệ",
      key: "host",
      width: 280,
      render: (_: unknown, record: HostApplicationItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar
            src={record.hostAvatarUrl}
            icon={<UserOutlined />}
            size={40}
          />
          <div style={{ minWidth: 0 }}>
            <Tooltip title={record.fullName}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#1a1a2e",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {record.fullName}
              </div>
            </Tooltip>
            <Tooltip title={record.email}>
              <div
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {record.email}
              </div>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "onboardingStatus",
      key: "onboardingStatus",
      width: 150,
      render: (status: any) => {
        const s = HOST_APPLICATION_STATUS_MAP[status] || {
          color: "default",
          label: status,
        };
        return (
          <Tag
            color={s.color}
            style={{ borderRadius: 6, fontWeight: 500, padding: "2px 12px" }}
          >
            {s.label}
          </Tag>
        );
      },
    },
    {
      title: "SĐT kinh doanh",
      dataIndex: "businessPhone",
      key: "businessPhone",
      width: 150,
      render: (phone: any) => (
        <span style={{ fontSize: 13, color: "#475569" }}>{phone || "--"}</span>
      ),
    },
    {
      title: "CMND/CCCD",
      dataIndex: "identityCardNumber",
      key: "identityCardNumber",
      width: 150,
      render: (val: any) => (
        <span style={{ fontSize: 13, color: "#475569" }}>{val || "--"}</span>
      ),
    },
    {
      title: "Ngày gia nhập",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: any) => (
        <span style={{ fontSize: 13, color: "#475569" }}>
          {date ? dayjs(date).format("DD/MM/YYYY") : "--"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      fixed: "right",
      render: (_: unknown, record: HostApplicationItem) => {
        const statusMenuItems = ALL_HOST_STATUSES.filter(
          (s) => s.value !== record.onboardingStatus
        ).map((s) => ({
          key: `status-${s.value}`,
          label: <span style={{ color: s.color }}>{s.label}</span>,
          onClick: () => handleOpenApproval(record.hostCode, s.value),
        }));

        return (
          <Space size={4}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record.hostCode)}
                style={{ color: "#2DD4A8" }}
              />
            </Tooltip>
            <Dropdown
              menu={{ items: statusMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                style={{ color: "#94a3b8" }}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  // Tab items for ProTable toolbar
  const tabItems = HOST_APPLICATION_TAB_FILTERS.map((f: any) => ({
    key: typeof f === "string" ? f : f.value,
    label: typeof f === "string" ? f : f.label,
  }));

  return (
    <PageContainer
      header={{
        title: "Quản lý Hồ sơ Chủ nhà",
        subTitle:
          "Theo dõi, xác minh và quản lý các đối tác cung cấp dịch vụ homestay.",
      }}
      extra={[
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: ["admin-host-applications"],
            })
          }
        >
          Xuất báo cáo
        </Button>,
      ]}
    >
      {contextHolder}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Tổng số chủ nhà",
            value: totalHosts,
            icon: <TeamOutlined />,
            iconBg: "#e8f8f3",
            iconColor: "#2DD4A8",
            sub: "+12 trong tuần này",
            change: "+5.2% so với tháng trước",
            changeColor: "#2DD4A8",
          },
          {
            title: "Chờ xác minh KYC",
            value: pendingKYC,
            icon: <SafetyCertificateOutlined />,
            iconBg: "#fff8e6",
            iconColor: "#faad14",
            sub: "Cần xử lý ngay",
            change: null,
            changeColor: null,
          },
          {
            title: "Tổng thu nhập Host",
            value: "--",
            icon: <DollarOutlined />,
            iconBg: "#e6f4ff",
            iconColor: "#1677ff",
            sub: "30 ngày qua",
            change: "+8.4% so với tháng trước",
            changeColor: "#2DD4A8",
          },
          {
            title: "Tỷ lệ hài lòng",
            value: "--",
            icon: <StarOutlined />,
            iconBg: "#fff1f0",
            iconColor: "#ff4d4f",
            sub: "Dựa trên đánh giá",
            change: null,
            changeColor: null,
          },
        ].map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <StatisticCard
              statistic={{
                title: stat.title,
                value: stat.value,
                description: (
                  <div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      {stat.sub}
                    </div>
                    {stat.change && (
                      <div
                        style={{
                          fontSize: 12,
                          color: stat.changeColor || "#94a3b8",
                          marginTop: 2,
                          fontWeight: 500,
                        }}
                      >
                        <ArrowUpOutlined
                          style={{ fontSize: 10, marginRight: 4 }}
                        />
                        {stat.change}
                      </div>
                    )}
                  </div>
                ),
                icon: (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: stat.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      color: stat.iconColor,
                    }}
                  >
                    {stat.icon}
                  </div>
                ),
              }}
              style={{ borderRadius: 12, height: "100%" }}
            />
          </Col>
        ))}
      </Row>

      {/* ProTable */}
      <ProTable<HostApplicationItem>
        columns={columns}
        dataSource={filteredItems}
        rowKey="hostId"
        loading={isLoading || isFetching}
        search={false}
        scroll={{ x: 1000 }}
        cardBordered
        headerTitle="Danh sách chủ nhà"
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
            placeholder: "Tìm kiếm theo tên, email hoặc mã host...",
            onSearch: (value: string) => setSearchText(value),
            allowClear: true,
          },
        }}
        pagination={{
          current: pageNo,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `Hiển thị ${range[0]}-${range[1]} trên ${total} chủ nhà`,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (page, size) => {
            setPageNo(page);
            setPageSize(size);
          },
        }}
      />

      {/* Bottom Info Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} md={12}>
          <StatisticCard
            style={{ borderRadius: 12 }}
            statistic={{
              title: "Chính sách xác minh",
              value: " ",
              description: (
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Tất cả chủ nhà mới phải hoàn thành KYC trong vòng 7 ngày kể
                  từ khi đăng ký để giữ tài khoản hoạt động. Hồ sơ doanh nghiệp
                  yêu cầu thêm giấy phép kinh doanh hợp lệ.
                </div>
              ),
              icon: (
                <SafetyCertificateOutlined
                  style={{ fontSize: 20, color: "#2DD4A8" }}
                />
              ),
            }}
          />
        </Col>
        <Col xs={24} md={12}>
          <StatisticCard
            style={{ borderRadius: 12 }}
            statistic={{
              title: "Tăng trưởng đối tác",
              value: " ",
              description: (
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Tỷ lệ chủ nhà hoàn thành xác minh tăng 15% so với tháng trước
                  nhờ quy trình nhắc nhở tự động. Hãy tiếp tục hỗ trợ các chủ
                  nhà đang trong trạng thái Đang chờ.
                </div>
              ),
              icon: (
                <ArrowUpOutlined
                  style={{ fontSize: 20, color: "#2DD4A8" }}
                />
              ),
            }}
          />
        </Col>
      </Row>

      <ApplicationDetailDrawer
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedHostCode(null);
        }}
        detailLoading={detailLoading}
        detailData={detailData || null}
        onOpenApproval={handleOpenApproval}
      />

      <ApplicationApprovalModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onSubmit={handleSubmitApproval}
        confirmLoading={approvalMutation.isPending}
        approvalAction={approvalAction}
        approvalHostCode={approvalHostCode}
      />
    </PageContainer>
  );
}
