"use client";

import { useState, useEffect } from "react";
import { Button, Table, Tag, Input, Segmented, Empty, message } from "antd";
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

// TODO: Gọi API GET /properties/{id_host} để lấy danh sách bài đăng
// const { data: listings } = useQuery({
//   queryKey: ["my-listings", user?.id],
//   queryFn: async () => {
//     const res = await fetcher.get(`/properties/${user?.id}`);
//     return res.data?.data ?? res.data;
//   },
//   enabled: !!user?.id,
// });

export default function HostPropertiesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const searchParams = useSearchParams();

  // Open drawer if navigated with ?action=create (from sidebar)
  useEffect(() => {
    if (searchParams.get("action") === "create") {
      setDrawerOpen(true);
    }
  }, [searchParams]);

  // Empty listings for now — will be populated from API
  const listings: any[] = [];

  const stats = [
    { label: "TỔNG BÀI ĐĂNG", value: listings.length },
    { label: "ĐANG HOẠT ĐỘNG", value: listings.filter((l: any) => l.status === "active").length },
    { label: "BẢN NHÁP", value: listings.filter((l: any) => l.status === "draft").length },
    { label: "THU NHẬP THÁNG NÀY", value: "0đ", isHighlight: true },
  ];

  const columns = [
    {
      title: "Bất động sản",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => (
        <div className="flex items-center gap-3">
          <div className="w-[80px] h-[60px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {record.imageUrl ? (
              <img src={record.imageUrl} alt={record.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <HomeOutlined className="text-xl" />
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 m-0 text-sm">{record.name}</p>
            <p className="text-xs text-gray-500 m-0 mt-0.5">📍 {record.location}</p>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          active: { color: "green", text: "Đang hoạt động" },
          draft: { color: "default", text: "Bản nháp" },
          paused: { color: "orange", text: "Tạm dừng" },
        };
        const s = map[status] || { color: "default", text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: "Giá / Đêm",
      dataIndex: "pricePerNight",
      key: "pricePerNight",
      render: (price: number) => (
        <span className="font-medium">{price?.toLocaleString()}đ</span>
      ),
    },
    {
      title: "Hiệu suất",
      dataIndex: "performance",
      key: "performance",
      render: (_: any, record: any) => (
        <div>
          <span className="text-[#2DD4A8] font-semibold text-xs">{record.bookings || 0} đặt phòng</span>
          {record.rating && (
            <p className="text-xs text-gray-500 m-0">★ {record.rating} đánh giá</p>
          )}
        </div>
      ),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => <span className="text-xs text-gray-500">{date || "—"}</span>,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: () => (
        <div className="flex items-center gap-2">
          <Button type="text" size="small" icon={<EyeOutlined />} />
          <Button type="text" size="small" icon={<EditOutlined />} />
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </div>
      ),
    },
  ];

  const handleCreateSuccess = () => {
    setDrawerOpen(false);
    messageApi.success("Tạo bài đăng thành công!");
    // TODO: Refetch listings after creation
  };

  return (
    <>
      {contextHolder}
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
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
          onClick={() => setDrawerOpen(true)}
          className="!bg-[#2DD4A8] !border-[#2DD4A8] !rounded-xl !font-semibold !h-[44px] !px-6 hover:!bg-[#22b892]"
        >
          Thêm bài đăng mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-[11px] font-semibold text-gray-400 tracking-wider m-0 uppercase">
              {stat.label}
            </p>
            <p
              className={`text-2xl font-bold m-0 mt-2 ${
                stat.isHighlight ? "text-[#2DD4A8]" : "text-gray-900"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex items-center justify-between mb-5">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm theo tên hoặc địa điểm..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="!w-[360px] !rounded-lg"
          size="large"
        />
        <Segmented
          value={filter}
          onChange={(v) => setFilter(v as string)}
          options={[
            { label: "Tất cả", value: "all" },
            { label: "Hoạt động", value: "active" },
            { label: "Nháp", value: "draft" },
            { label: "Tạm dừng", value: "paused" },
          ]}
        />
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {listings.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center">
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
                onClick={() => setDrawerOpen(true)}
                className="!bg-[#2DD4A8] !border-[#2DD4A8] !rounded-lg !mt-2"
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
            pagination={{
              pageSize: 5,
              showTotal: (total) => `Hiển thị ${Math.min(5, total)} trên tổng số ${total} bài đăng`,
            }}
          />
        )}
      </div>

      {/* Create Property Drawer */}
      <CreatePropertyDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
