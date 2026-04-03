"use client";

import { useState, useEffect } from "react";
import { Button, Table, Tag, Input, Segmented, Empty, message, Switch, Tooltip } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  HomeOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "next/navigation";
import CreatePropertyDrawer from "@/components/host/properties/CreatePropertyDrawer";
import EditPropertyDrawer from "@/components/host/properties/EditPropertyDrawer";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "../../../../../utils/fetcher";
import { PROPERTY_STATUS, PROPERTY_STATUS_MAP } from "@/constants/property";

function timeAgo(dateStr: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return `Hôm qua`;
  if (diffInDays < 7) return `${diffInDays} ngày trước`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
  return `${Math.floor(diffInDays / 365)} năm trước`;
}

export default function HostPropertiesPage() {
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingPropertySlug, setEditingPropertySlug] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(5);
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
      // NOTE: Here we should pass query params but we just use basic pagination for now
      const res = await fetcher.get(`/properties/host?pageNo=${pageNo}&pageSize=${pageSize}`);
      return res.data?.data ?? res.data;
    },
  });

  const listings = fetchResult?.items || [];
  const totalElements = fetchResult?.totalElements || 0;

  const stats = [
    { label: "TỔNG BÀI ĐĂNG", value: totalElements },
    { label: "ĐANG HOẠT ĐỘNG", value: listings.filter((l: any) => l.status === PROPERTY_STATUS.PUBLISHED || l.status === "ACTIVE").length },
    { label: "BẢN NHÁP", value: listings.filter((l: any) => l.status === PROPERTY_STATUS.DRAFT).length },
    { label: "THU NHẬP THÁNG", value: "0đ", isHighlight: true },
  ];

  const columns = [
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
      render: (status: string) => {
        const statusData = PROPERTY_STATUS_MAP[status] || { label: status, isActive: false };
        const isSwitchedOn = statusData.isActive || status === "ACTIVE" || status === "PUBLISHED";
        return (
          <div className="flex items-center gap-3">
            <Switch
              size="default"
              checked={isSwitchedOn}
              onChange={(checked) => {
                 message.info(`Sẽ cập nhật trạng thái thành ${checked ? 'Hoạt động' : 'Tạm dừng'} sau.`);
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
      render: (price: number) => (
        <span className="font-medium whitespace-nowrap">{price?.toLocaleString()}đ</span>
      ),
    },
    {
      title: "Hiệu suất",
      dataIndex: "performance",
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
      render: (date: string) => <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo(date)}</span>,
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right" as const,
      width: 100,
      render: (_: any, record: any) => (
        <div className="flex items-center gap-1">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => {
            if (record.status === PROPERTY_STATUS.PUBLISHED) {
              window.open(`/homestay/${record.slug}`, '_blank');
            } else {
              const statusLabel = PROPERTY_STATUS_MAP[record.status]?.label || record.status;
              messageApi.warning(`Chỉ có thể xem chi tiết khi bài đăng ở trạng thái "Đang hoạt động". Trạng thái hiện tại: ${statusLabel}`);
            }
          }} />
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => {
            setEditingPropertySlug(record.slug);
            setEditDrawerOpen(true);
          }} />
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </div>
      ),
    },
  ];

  const handleCreateSuccess = () => {
    setCreateDrawerOpen(false);
    refetch(); // Refetch listings after creation
  };

  const handleEditSuccess = () => {
    setEditDrawerOpen(false);
    setEditingPropertySlug(null);
    refetch(); // Refetch listings after update
  };

  return (
    <>
      {contextHolder}
      {/* Page Header (Hidden on mobile as Top Bar handles it) */}
      <div className="hidden md:flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Bất động sản của bạn</h1>
          <p className="text-sm text-gray-500 mt-1 m-0">
            Quản lý và theo dõi hiệu suất các bài đăng homestay của bạn.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setCreateDrawerOpen(true)}
          className="!bg-[#2DD4A8] !border-[#2DD4A8] !rounded-xl !font-semibold !h-[44px] !px-6 hover:!bg-[#22b892]"
        >
          Thêm bài đăng mới
        </Button>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-[10px] md:text-[11px] font-semibold text-gray-400 tracking-wider m-0 uppercase truncate">
              {stat.label}
            </p>
            <p
              className={`text-xl md:text-2xl font-bold m-0 mt-1.5 md:mt-2 truncate ${
                stat.isHighlight ? "text-[#2DD4A8]" : "text-gray-900"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters - Responsive Flex */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between mb-5 gap-4">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm tên, địa điểm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="!w-full lg:!w-[360px] !rounded-lg"
          size="large"
        />
        <div className="overflow-x-auto pb-1 -mx-1 px-1">
          <Segmented
            value={filter}
            onChange={(v) => setFilter(v as string)}
            options={[
              { label: "Tất cả", value: "all" },
              { label: "Hoạt động", value: PROPERTY_STATUS.PUBLISHED },
              { label: "Nháp", value: PROPERTY_STATUS.DRAFT },
              { label: "Chờ duyệt", value: PROPERTY_STATUS.PENDING_REVIEW },
              { label: "Tạm dừng", value: PROPERTY_STATUS.HIDDEN },
              { label: "Bị khóa", value: PROPERTY_STATUS.BANNED },
            ]}
          />
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {listings.length === 0 ? (
          <div className="py-12 md:py-16 flex flex-col items-center justify-center px-4">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="text-center">
                  <p className="text-base font-medium text-gray-700 m-0">Chưa có bài đăng nào</p>
                  <p className="text-sm text-gray-400 mt-1 m-0">
                    Bắt đầu tạo bài đăng đầu tiên của bạn ngay!
                  </p>
                </div>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateDrawerOpen(true)}
                className="!bg-[#2DD4A8] !border-[#2DD4A8] !rounded-lg !mt-4"
              >
                Tạo bài đăng mới
              </Button>
            </Empty>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={listings}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 800 }} // Enable horizontal scroll on mobile
            pagination={{
              current: pageNo,
              pageSize: pageSize,
              total: totalElements,
              onChange: (page, pageSize) => {
                setPageNo(page);
                setPageSize(pageSize);
              },
              showTotal: (total) => `Hiển thị ${listings.length} trên tổng số ${total} bài đăng`,
            }}
          />
        )}
      </div>

      {/* Create Property Drawer */}
      <CreatePropertyDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Property Drawer */}
      <EditPropertyDrawer
        open={editDrawerOpen}
        slug={editingPropertySlug}
        onClose={() => {
          setEditDrawerOpen(false);
          // Wait for drawer animation to close before clearing ID to avoid UI flicker
          setTimeout(() => setEditingPropertySlug(null), 300);

        }}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
