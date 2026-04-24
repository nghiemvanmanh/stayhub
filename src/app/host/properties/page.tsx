"use client";

import { useState, useEffect } from "react";
import { Button, Tag, Empty, message, Switch, Tooltip, Row, Col } from "antd";
import {
  PlusOutlined,
  HomeOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { PageContainer, ProTable, StatisticCard } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { useSearchParams } from "next/navigation";
import CreatePropertyDrawer from "@/components/host/properties/CreatePropertyDrawer";
import EditPropertyDrawer from "@/components/host/properties/EditPropertyDrawer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import { PROPERTY_STATUS, PROPERTY_STATUS_MAP } from "@/constants/property";
import { timeAgo, formatCurrency } from "@/utils/format";

export default function HostPropertiesPage() {
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingPropertySlug, setEditingPropertySlug] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [togglingPropertyId, setTogglingPropertyId] = useState<number | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setCreateDrawerOpen(true);
    }
  }, [searchParams]);

  const { data: fetchResult, isLoading, refetch } = useQuery({
    queryKey: ["host-properties", filter, searchText, pageNo, pageSize],
    queryFn: async () => {
      const res = await fetcher.get(`/properties/host?pageNo=${pageNo}&pageSize=${pageSize}`);
      return res.data?.data ?? res.data;
    },
  });

  const listings = fetchResult?.items || [];
  const totalElements = fetchResult?.totalElements || 0;

  const handleCreateSuccess = () => {
    setCreateDrawerOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setEditDrawerOpen(false);
    setEditingPropertySlug(null);
    refetch();
  };

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ propertyId, isActive }: { propertyId: number; isActive: boolean }) => {
      const res = await fetcher.put(
        `/properties/host/${propertyId}/toggle-status`,
        null,
        { params: { isActive } }
      );
      return res.data;
    },
    onSuccess: (resData) => {
      const successMsg = resData?.data || resData?.message || "Cập nhật trạng thái bài đăng thành công";
      messageApi.success(successMsg);
      refetch();
    },
    onError: (err: any) => {
      messageApi.error(
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Không thể cập nhật trạng thái bài đăng"
      );
    },
    onSettled: () => {
      setTogglingPropertyId(null);
    },
  });

  const columns: ProColumns<any>[] = [
    {
      title: "Cơ sở lưu trú",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-[80px] h-[60px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {record.thumbnailUrl ? (
              <img src={record.thumbnailUrl} alt={record.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <HomeOutlined className="text-xl" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Tooltip title={record.name} placement="topLeft">
              <p className="font-semibold text-gray-900 m-0 text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                {record.name}
              </p>
            </Tooltip>
            <Tooltip title={record.addressDetail ? `${record.addressDetail}, ${record.province}` : record.province} placement="topLeft">
              <p className="text-xs text-gray-500 m-0 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                📍 {record.addressDetail ? `${record.addressDetail}, ` : ""}{record.province}
              </p>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 250,
      render: (_: any, record: any) => {
        const statusData = PROPERTY_STATUS_MAP[record.status] || { label: record.status, isActive: false };
        const isSwitchedOn = statusData.isActive || record.status === PROPERTY_STATUS.ACTIVE;
        const canToggle =
          record.status === PROPERTY_STATUS.ACTIVE ||
          record.status === PROPERTY_STATUS.INACTIVE;
        return (
          <div className="flex items-center gap-3">
            <Switch
              size="default"
              checked={isSwitchedOn}
              loading={togglingPropertyId === record.id}
              disabled={!canToggle}
              onChange={(checked) => {
                if (!canToggle) {
                  const statusLabel = PROPERTY_STATUS_MAP[record.status]?.label || record.status;
                  messageApi.warning(`Không thể đổi trạng thái ở mục ${statusLabel}`);
                  return;
                }
                setTogglingPropertyId(record.id);
                toggleStatusMutation.mutate({
                  propertyId: record.id,
                  isActive: checked,
                });
              }}
              className={isSwitchedOn ? "!bg-[#2DD4A8]" : "bg-gray-300"}
            />
            <div className="border border-gray-200 rounded-full px-3 py-1 text-[13px] text-gray-500 font-medium bg-transparent whitespace-nowrap">
              {statusData.label}
            </div>
          </div>
        );
      },
    },
    {
      title: "Giá / Đêm",
      dataIndex: "startingPrice",
      key: "startingPrice",
      width: 120,
      render: (price: any) => (
        <span className="font-medium whitespace-nowrap">{formatCurrency(price)}</span>
      ),
    },
    {
      title: "Hiệu suất",
      key: "performance",
      width: 120,
      render: (_: any, record: any) => (
        <div className="whitespace-nowrap">
          <span className="text-[#2DD4A8] font-semibold text-xs">{record.reviewCount || 0} đặt phòng</span>
          <p className="text-xs text-gray-500 m-0">★ {record.ratingAvg || 0} đánh giá</p>
        </div>
      ),
    },
    {
      title: "Cập nhật",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      render: (date: any) => <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(date)}</span>,
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      width: 100,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              if (record.status === PROPERTY_STATUS.ACTIVE) {
                window.open(`/homestay/${record.slug}`, "_blank");
              } else {
                const statusLabel = PROPERTY_STATUS_MAP[record.status]?.label || record.status;
                messageApi.warning(`Chỉ có thể xem chi tiết khi bài đăng ở trạng thái "Đang hoạt động". Trạng thái hiện tại: ${statusLabel}`);
              }
            }}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingPropertySlug(record.slug);
              setEditDrawerOpen(true);
            }}
          />
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: "all", label: "Tất cả" },
    { key: PROPERTY_STATUS.ACTIVE, label: "Hoạt động" },
    { key: PROPERTY_STATUS.DRAFT, label: "Nháp" },
    { key: PROPERTY_STATUS.PENDING_REVIEW, label: "Chờ duyệt" },
    { key: PROPERTY_STATUS.HIDDEN, label: "Tạm dừng" },
    { key: PROPERTY_STATUS.BANNED, label: "Bị khóa" },
  ];

  return (
    <PageContainer
      header={{
        title: "Bất động sản của bạn",
        subTitle: "Quản lý và theo dõi hiệu suất các bài đăng homestay của bạn.",
      }}
      extra={[
        <Button
          key="create"
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateDrawerOpen(true)}
          style={{
            background: "#2DD4A8",
            borderColor: "#2DD4A8",
            borderRadius: 12,
            fontWeight: 600,
            height: 44,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          Thêm bài đăng mới
        </Button>,
      ]}
    >
      {contextHolder}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: "TỔNG BÀI ĐĂNG", value: totalElements, highlight: false },
          {
            title: "ĐANG HOẠT ĐỘNG",
            value: listings.filter((l: any) => l.status === PROPERTY_STATUS.ACTIVE || l.status === "ACTIVE").length,
            highlight: false,
          },
          {
            title: "BẢN NHÁP",
            value: listings.filter((l: any) => l.status === PROPERTY_STATUS.DRAFT).length,
            highlight: false,
          },
          { title: "THU NHẬP THÁNG", value: "0đ", highlight: true },
        ].map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <StatisticCard
              statistic={{
                title: stat.title,
                value: stat.value,
                valueStyle: stat.highlight ? { color: "#2DD4A8" } : undefined,
              }}
              style={{ borderRadius: 12, height: "100%" }}
            />
          </Col>
        ))}
      </Row>

      {/* ProTable */}
      <ProTable
        columns={columns}
        dataSource={listings}
        rowKey="id"
        loading={isLoading}
        search={false}
        scroll={{ x: 'max-content' }}
        cardBordered
        headerTitle="Danh sách bài đăng"
        options={{
          reload: () => refetch(),
          density: true,
          setting: true,
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: filter,
            items: tabItems,
            onChange: (key) => setFilter(key as string),
          },
          search: {
            placeholder: "Tìm kiếm tên, địa điểm...",
            onSearch: (value: string) => setSearchText(value),
            allowClear: true,
          },
        }}
        pagination={{
          current: pageNo,
          pageSize,
          total: totalElements,
          onChange: (page, size) => {
            setPageNo(page);
            setPageSize(size);
          },
          showTotal: (total) => `Hiển thị ${listings.length} trên tổng số ${total} bài đăng`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: "48px 0", textAlign: "center" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 500, color: "#475569", margin: 0 }}>
                      Chưa có bài đăng nào
                    </p>
                    <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
                      Bắt đầu tạo bài đăng đầu tiên của bạn ngay!
                    </p>
                  </div>
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateDrawerOpen(true)}
                  style={{ background: "#2DD4A8", borderColor: "#2DD4A8", borderRadius: 8, marginTop: 8 }}
                >
                  Tạo bài đăng mới
                </Button>
              </Empty>
            </div>
          ),
        }}
      />

      <CreatePropertyDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditPropertyDrawer
        open={editDrawerOpen}
        slug={editingPropertySlug}
        onClose={() => {
          setEditDrawerOpen(false);
          setTimeout(() => setEditingPropertySlug(null), 300);
        }}
        onSuccess={handleEditSuccess}
      />
    </PageContainer>
  );
}
