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
  Divider,
  Row,
  Col,
  Segmented,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  FileProtectOutlined,
  CalendarOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  DollarOutlined,
  StarOutlined,
  ArrowUpOutlined,
  MoreOutlined,
  FilterOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import type { ColumnsType } from "antd/es/table";
import type {
  HostApplicationItem,
  HostApplicationDetail,
  PaginatedResponse,
} from "@/interfaces/admin";
import dayjs from "dayjs";
import { 
  HOST_APPLICATION_STATUS_MAP, 
  ALL_HOST_STATUSES, 
  HOST_APPLICATION_TAB_FILTERS 
} from "@/constants/host-application";
import { ApplicationDetailDrawer } from "@/components/admin/host-applications/ApplicationDetailDrawer";
import { ApplicationApprovalModal } from "@/components/admin/host-applications/ApplicationApprovalModal";

const { Title, Text } = Typography;
const { TextArea } = Input;



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
  const { data, isLoading, isFetching } = useQuery({
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
      const res = await fetcher.get(`/auth/admin/host-applications/${selectedHostCode}`);
      return res.data?.data as HostApplicationDetail;
    },
    enabled: !!selectedHostCode,
  });

  // Approval mutation
  const approvalMutation = useMutation({
    mutationFn: async (d: { hostCode: string; status: string; reviewNote: string }) => {
      return fetcher.put(`/auth/admin/approval-host?hostCode=${d.hostCode}`, {
        status: d.status,
        reviewNote: d.reviewNote,
      });
    },
    onSuccess: () => {
      const label = ALL_HOST_STATUSES.find(s => s.value === approvalAction)?.label
        ?? HOST_APPLICATION_STATUS_MAP[approvalAction]?.label
        ?? approvalAction;
      messageApi.success(`Đã cập nhật trạng thái Host: ${label}`);
      setApprovalModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-host-applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin-host-detail"] });
    },
    onError: (error: any) => {
      messageApi.error(error?.response?.data?.message || "Có lỗi xảy ra khi thẩm định hồ sơ");
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
    approvalMutation.mutate({ hostCode: approvalHostCode, status: approvalAction, reviewNote: note.trim() });
  };

  // Client-side search
  const filteredItems = useMemo(() => {
    return (data?.items || []).filter((item) => {
      if (!searchText) return true;
      const s = searchText.toLowerCase();
      return item.fullName?.toLowerCase().includes(s) || item.email?.toLowerCase().includes(s) || item.hostCode?.toLowerCase().includes(s);
    });
  }, [data?.items, searchText]);

  // Stats
  const totalHosts = data?.totalElements || 0;
  const pendingKYC = (data?.items || []).filter((i) => i.onboardingStatus === "PENDING_REVIEW" || i.onboardingStatus === "UNVERIFIED").length;

  const columns: ColumnsType<HostApplicationItem> = [
    {
      title: "Họ tên & Liên hệ",
      key: "host",
      width: 280,
      render: (_: unknown, record: HostApplicationItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar src={record.hostAvatarUrl} icon={<UserOutlined />} size={40} />
          <div style={{ minWidth: 0 }}>
            <Tooltip title={record.fullName}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {record.fullName}
              </div>
            </Tooltip>
            <Tooltip title={record.email}>
              <div style={{ fontSize: 12, color: "#94a3b8",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
      render: (status: string) => {
        const s = HOST_APPLICATION_STATUS_MAP[status] || { color: "default", label: status };
        return (
          <Tag color={s.color} style={{ borderRadius: 6, fontWeight: 500, padding: "2px 12px" }}>
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
      render: (phone: string) => <Text style={{ fontSize: 13, color: "#475569" }}>{phone || "--"}</Text>,
    },
    {
      title: "CMND/CCCD",
      dataIndex: "identityCardNumber",
      key: "identityCardNumber",
      width: 150,
      render: (val: string) => <Text style={{ fontSize: 13, color: "#475569" }}>{val || "--"}</Text>,
    },
    {
      title: "Ngày gia nhập",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: string) => (
        <Text style={{ fontSize: 13, color: "#475569" }}>
          {date ? dayjs(date).format("DD/MM/YYYY") : "--"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      fixed: "right",
      render: (_: unknown, record: HostApplicationItem) => {
        const statusMenuItems = ALL_HOST_STATUSES
          .filter(s => s.value !== record.onboardingStatus)
          .map(s => ({
            key: `status-${s.value}`,
            label: <span style={{ color: s.color }}>{s.label}</span>,
            onClick: () => handleOpenApproval(record.hostCode, s.value),
          }));

        const menuItems = [
          ...statusMenuItems,
        ];

        return (
          <Space size={4}>
            <Tooltip title="Xem chi tiết">
              <Button type="text" size="small" icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record.hostCode)} style={{ color: "#2DD4A8" }} />
            </Tooltip>
            <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
              <Button type="text" size="small" icon={<MoreOutlined />} style={{ color: "#94a3b8" }} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      {contextHolder}

      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#1a1a2e" }}>
            Quản lý Hồ sơ Chủ nhà
          </Title>
          <Text style={{ color: "#94a3b8", fontSize: 14 }}>
            Theo dõi, xác minh và quản lý các đối tác cung cấp dịch vụ homestay.
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-host-applications"] })}>
            Xuất báo cáo
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: "Tổng số chủ nhà", value: totalHosts, icon: <TeamOutlined />, iconBg: "#e8f8f3", iconColor: "#2DD4A8", sub: "+12 trong tuần này", change: "+5.2% so với tháng trước", changeColor: "#2DD4A8" },
          { title: "Chờ xác minh KYC", value: pendingKYC, icon: <SafetyCertificateOutlined />, iconBg: "#fff8e6", iconColor: "#faad14", sub: "Cần xử lý ngay", change: null, changeColor: null },
          { title: "Tổng thu nhập Host", value: "--", icon: <DollarOutlined />, iconBg: "#e6f4ff", iconColor: "#1677ff", sub: "30 ngày qua", change: "+8.4% so với tháng trước", changeColor: "#2DD4A8" },
          { title: "Tỷ lệ hài lòng", value: "--", icon: <StarOutlined />, iconBg: "#fff1f0", iconColor: "#ff4d4f", sub: "Dựa trên đánh giá", change: null, changeColor: null },
        ].map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card bordered={false} style={{ borderRadius: 12, height: "100%" }} styles={{ body: { padding: "20px" } }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{stat.title}</Text>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2, marginTop: 4 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{stat.sub}</div>
                  {stat.change && (
                    <div style={{ fontSize: 12, color: stat.changeColor || "#94a3b8", marginTop: 4, fontWeight: 500 }}>
                      <ArrowUpOutlined style={{ fontSize: 10, marginRight: 4 }} />
                      {stat.change}
                    </div>
                  )}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: stat.iconColor }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table Card */}
      <Card bordered={false} style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        {/* Toolbar */}
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flex: "1 1 300px", flexWrap: "wrap" }}>
            <Input
              placeholder="Tìm kiếm theo tên, email hoặc mã host..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1, minWidth: 200, maxWidth: 340, borderRadius: 8, height: 38 }}
              allowClear
            />
            <Button icon={<FilterOutlined />} style={{ borderRadius: 8, height: 38 }}>Lọc</Button>
          </div>
          <div style={{ maxWidth: "100%", overflowX: "auto" }}>
            <Segmented
              options={HOST_APPLICATION_TAB_FILTERS}
              value={activeTab}
              onChange={(val) => { setActiveTab(val as string); setPageNo(1); }}
              style={{ borderRadius: 8 }}
            />
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="hostId"
          loading={isLoading || isFetching}
          scroll={{ x: 1000 }}
          pagination={{
            current: pageNo,
            pageSize,
            total: data?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} trên ${total} chủ nhà`,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (page, size) => { setPageNo(page); setPageSize(size); },
            style: { padding: "0 20px" },
          }}
        />
      </Card>

      {/* Bottom Info Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 12 }} styles={{ body: { padding: "16px 20px" } }}>
            <div style={{ display: "flex", gap: 12 }}>
              <SafetyCertificateOutlined style={{ fontSize: 20, color: "#2DD4A8", marginTop: 2 }} />
              <div>
                <Text strong style={{ fontSize: 14 }}>Chính sách xác minh</Text>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Tất cả chủ nhà mới phải hoàn thành KYC trong vòng 7 ngày kể từ khi đăng ký để giữ tài khoản hoạt động. Hồ sơ doanh nghiệp yêu cầu thêm giấy phép kinh doanh hợp lệ.
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card bordered={false} style={{ borderRadius: 12 }} styles={{ body: { padding: "16px 20px" } }}>
            <div style={{ display: "flex", gap: 12 }}>
              <ArrowUpOutlined style={{ fontSize: 20, color: "#2DD4A8", marginTop: 2 }} />
              <div>
                <Text strong style={{ fontSize: 14 }}>Tăng trưởng đối tác</Text>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Tỷ lệ chủ nhà hoàn thành xác minh tăng 15% so với tháng trước nhờ quy trình nhắc nhở tự động. Hãy tiếp tục hỗ trợ các chủ nhà đang trong trạng thái Đang chờ.
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <ApplicationDetailDrawer
        open={detailDrawerOpen}
        onClose={() => { setDetailDrawerOpen(false); setSelectedHostCode(null); }}
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
    </div>
  );
}
