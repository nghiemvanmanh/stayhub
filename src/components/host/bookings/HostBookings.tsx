"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Button,
  Input,
  Pagination,
  Spin,
  Tooltip,
  Dropdown,
  Modal,
  message,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleOutlined,
  MessageOutlined,
  MoreOutlined,
  LoginOutlined,
  LogoutOutlined,
  StopOutlined,
  CheckOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { formatCurrency } from "@/utils/format";
import { BOOKING_STATUS_MAP, BOOKING_FILTER_TABS } from "@/constants/booking";
import DisputeModal from "@/components/shared/DisputeModal";

dayjs.locale("vi");

// ── Types ────────────────────────────────────────────────────────────
interface HostBookingItem {
  bookingCode: string;
  guestName: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  finalAmount: number;
  amountPaid: number;
  isFullyPaid: boolean;
  status: string;
  createdAt: string;
}

interface HostBookingsResponse {
  data: {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElements: number;
    items: HostBookingItem[];
  };
}

const PAGE_SIZE = 10;

// ── Helpers ──────────────────────────────────────────────────────────

const getStatusTag = (status: string) => {
  const config = BOOKING_STATUS_MAP[status] || {
    label: status,
    color: "default",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
  };
  return (
    <Tag
      color={config.color}
      className="!rounded-full !px-2.5 !py-0.5 !text-xs !font-medium !border-0"
    >
      {config.label}
    </Tag>
  );
};

// ── Component ────────────────────────────────────────────────────────
export default function HostBookings() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [disputeBookingCode, setDisputeBookingCode] = useState<string | null>(null);

  // ── Fetch bookings ─────────────────────────────────────────────────
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["host-bookings", currentPage],
    queryFn: async () => {
      const res = await fetcher.get<HostBookingsResponse>("/bookings/host", {
        params: { page: currentPage, size: PAGE_SIZE },
      });
      return res.data?.data ?? res.data;
    },
  });

  const allBookings: HostBookingItem[] = apiResponse?.items || [];
  const totalElements = apiResponse?.totalElements || 0;

  // ── Client-side filtering (status & search) ────────────────────────
  const filteredBookings = useMemo(() => {
    let results = [...allBookings];

    if (activeFilter !== "all") {
      results = results.filter((b) => b.status === activeFilter);
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      results = results.filter(
        (b) =>
          b.bookingCode.toLowerCase().includes(q) ||
          b.guestName.toLowerCase().includes(q) ||
          b.propertyName.toLowerCase().includes(q)
      );
    }

    return results;
  }, [allBookings, activeFilter, searchText]);

  // ── Stat cards (computed from current page data) ───────────────────
  const stats = useMemo(() => {
    const total = totalElements;
    const pending = allBookings.filter((b) => b.status === "PENDING").length;
    const revenue = allBookings.reduce((s, b) => s + b.amountPaid, 0);
    const occupancy =
      allBookings.length > 0
        ? Math.round(
            (allBookings.filter(
              (b) =>
                b.status === "CHECKED_IN" ||
                b.status === "CONFIRMED" ||
                b.status === "COMPLETED"
            ).length /
              allBookings.length) *
              100
          )
        : 0;
    return { total, pending, revenue, occupancy };
  }, [allBookings, totalElements]);

  // ── Mutations ──────────────────────────────────────────────────────
  const checkInMutation = useMutation({
    mutationFn: (bookingCode: string) =>
      fetcher.put(`/bookings/${bookingCode}/check-in`),
    onSuccess: () => {
      message.success("Check-in thành công!");
      queryClient.invalidateQueries({ queryKey: ["host-bookings"] });
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.data ||
          "Check-in thất bại"
      );
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (bookingCode: string) =>
      fetcher.put(`/bookings/${bookingCode}/check-out`),
    onSuccess: () => {
      message.success("Check-out thành công!");
      queryClient.invalidateQueries({ queryKey: ["host-bookings"] });
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.data ||
          "Check-out thất bại"
      );
    },
  });

  const completeMutation = useMutation({
    mutationFn: (bookingCode: string) =>
      fetcher.put(`/bookings/${bookingCode}/complete`),
    onSuccess: () => {
      message.success("Đã xác nhận hoàn thành chuyến đi!");
      queryClient.invalidateQueries({ queryKey: ["host-bookings"] });
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.data ||
          "Xác nhận hoàn thành thất bại"
      );
    },
  });

  // ── Action handlers with confirm ──────────────────────────────────
  const handleCheckIn = (bookingCode: string) => {
    Modal.confirm({
      title: "Xác nhận Check-in",
      icon: <LoginOutlined className="text-cyan-500" />,
      content: `Xác nhận khách hàng đã nhận phòng cho booking ${bookingCode}?`,
      okText: "Check-in",
      cancelText: "Hủy",
      okButtonProps: {
        className: "!bg-cyan-500 !border-cyan-500 hover:!bg-cyan-600",
      },
      onOk: () => checkInMutation.mutateAsync(bookingCode),
    });
  };

  const handleCheckOut = (bookingCode: string) => {
    Modal.confirm({
      title: "Xác nhận Check-out",
      icon: <LogoutOutlined className="text-blue-500" />,
      content: `Xác nhận khách hàng đã trả phòng cho booking ${bookingCode}?`,
      okText: "Check-out",
      cancelText: "Hủy",
      okButtonProps: {
        className: "!bg-blue-500 !border-blue-500 hover:!bg-blue-600",
      },
      onOk: () => checkOutMutation.mutateAsync(bookingCode),
    });
  };

  const handleComplete = (bookingCode: string) => {
    Modal.confirm({
      title: "Xác nhận hoàn thành",
      icon: <CheckCircleFilled className="text-green-500" />,
      content: `Xác nhận hoàn thành chuyến đi cho booking ${bookingCode}? Thao tác này không thể hoàn tác.`,
      okText: "Hoàn thành",
      cancelText: "Hủy",
      okButtonProps: {
        className: "!bg-green-500 !border-green-500 hover:!bg-green-600",
      },
      onOk: () => completeMutation.mutateAsync(bookingCode),
    });
  };

  const handleCancel = (bookingCode: string) => {
    Modal.confirm({
      title: "Xác nhận hủy đặt phòng",
      icon: <ExclamationCircleOutlined className="text-red-500" />,
      content: `Bạn có chắc chắn muốn hủy booking ${bookingCode}? Thao tác này không thể hoàn tác.`,
      okText: "Hủy booking",
      cancelText: "Giữ lại",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await fetcher.put(`/bookings/${bookingCode}/cancel`);
          message.success("Đã hủy đặt phòng thành công!");
          queryClient.invalidateQueries({ queryKey: ["host-bookings"] });
        } catch (err: any) {
          message.error(
            err?.response?.data?.message ||
              err?.response?.data?.data ||
              "Hủy đặt phòng thất bại"
          );
        }
      },
    });
  };

  // ── Render action buttons for each row ─────────────────────────────
  const renderActions = (booking: HostBookingItem) => {
    const status = (booking.status || "").toUpperCase();

    const actionButtons: React.ReactNode[] = [];

    // Check-in: only for CONFIRMED
    if (status === "CONFIRMED" || status === "PARTIALLY_PAID") {
      actionButtons.push(
        <Tooltip title="Check-in" key="checkin">
          <button
            onClick={() => handleCheckIn(booking.bookingCode)}
            className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <LoginOutlined className="text-sm" />
          </button>
        </Tooltip>
      );
    }

    // Check-out: only for CHECKED_IN
    if (status === "CHECKED_IN") {
      actionButtons.push(
        <Tooltip title="Check-out" key="checkout">
          <button
            onClick={() => handleCheckOut(booking.bookingCode)}
            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <LogoutOutlined className="text-sm" />
          </button>
        </Tooltip>
      );
    }

    // Complete: only for CHECKED_OUT
    if (status === "CHECKED_OUT") {
      actionButtons.push(
        <Tooltip title="Xác nhận hoàn thành" key="complete">
          <button
            onClick={() => handleComplete(booking.bookingCode)}
            className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <CheckOutlined className="text-sm" />
          </button>
        </Tooltip>
      );
    }

    // Cancel: for PENDING, CONFIRMED, AWAITING_PAYMENT
    if (["PENDING", "CONFIRMED", "AWAITING_PAYMENT"].includes(status)) {
      actionButtons.push(
        <Tooltip title="Hủy" key="cancel">
          <button
            onClick={() => handleCancel(booking.bookingCode)}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <StopOutlined className="text-sm" />
          </button>
        </Tooltip>
      );
    }

    // Dispute: for CHECKED_IN, CHECKED_OUT, COMPLETED
    if (["CHECKED_IN", "CHECKED_OUT", "COMPLETED"].includes(status)) {
      actionButtons.push(
        <Tooltip title="Khiếu nại" key="dispute">
          <button
            onClick={() => setDisputeBookingCode(booking.bookingCode)}
            className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 flex items-center justify-center border-none cursor-pointer transition-colors"
          >
            <ExclamationCircleOutlined className="text-sm" />
          </button>
        </Tooltip>
      );
    }

    // Message: always
    actionButtons.push(
      <Tooltip title="Hỗ trợ" key="support">
        <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center border-none cursor-pointer transition-colors">
          <MessageOutlined className="text-sm" />
        </button>
      </Tooltip>
    );

    return (
      <div className="flex items-center gap-1.5 justify-center">
        {actionButtons}
      </div>
    );
  };

  // ── Ant Design Table Columns ─────────────────────────────────────────
  const columns = [
    {
      title: "Mã Booking",
      dataIndex: "bookingCode",
      key: "bookingCode",
      render: (text: string) => <span className="text-[#2DD4A8] font-bold text-sm">{text}</span>,
    },
    {
      title: "Khách hàng",
      key: "guest",
      render: (_: any, record: HostBookingItem) => (
        <div className="flex items-center gap-2.5">
          <Avatar size={32} className="bg-gray-200 flex-shrink-0">
            {record.guestName?.charAt(0)?.toUpperCase()}
          </Avatar>
          <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
            {record.guestName}
          </span>
        </div>
      ),
    },
    {
      title: "Chỗ ở / Homestay",
      dataIndex: "propertyName",
      key: "propertyName",
      render: (text: string) => (
        <span className="text-sm text-gray-700 truncate block max-w-[200px]">{text}</span>
      ),
    },
    {
      title: "Ngày lưu trú",
      key: "dates",
      render: (_: any, record: HostBookingItem) => (
        <div>
          <div className="text-sm text-gray-900 font-medium">
            {dayjs(record.checkInDate).format("DD/MM/YYYY")}
          </div>
          <div className="text-xs text-gray-400">
            đến {dayjs(record.checkOutDate).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Khách",
      dataIndex: "totalGuests",
      key: "totalGuests",
      align: "center" as const,
      render: (text: number) => <span className="text-sm font-medium text-gray-900">{text}</span>,
    },
    {
      title: "Thanh toán",
      key: "payment",
      align: "right" as const,
      render: (_: any, record: HostBookingItem) => (
        <div>
          <div className="text-sm font-bold text-gray-900">
            {formatCurrency(record.finalAmount)}
          </div>
          {!record.isFullyPaid && (
            <div className="text-[10px] text-orange-500 font-medium">
              Đã trả: {formatCurrency(record.amountPaid)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center" as const,
      render: (_: any, record: HostBookingItem) => renderActions(record),
    },
  ];

  return (
    <div>
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Quản lý đặt phòng
          </h1>
          <p className="text-sm text-gray-500 mt-1 m-0">
            Theo dõi và quản lý các yêu cầu đặt phòng từ khách hàng của bạn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            icon={<ExportOutlined />}
            className="!rounded-xl !h-10 !px-5 !font-medium !border-gray-200 !text-gray-700"
          >
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </Button>
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            className="!rounded-xl !h-10 !px-5 !font-semibold !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
          >
            <span className="hidden sm:inline">Xem lịch trống</span>
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Tổng lượt đặt</span>
            <div className="w-8 h-8 rounded-lg bg-[#E6FAF5] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#2DD4A8]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 m-0">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1 m-0">Tháng này</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Đang chờ xác nhận</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 m-0">
            {String(stats.pending).padStart(2, "0")}
          </p>
          <p className="text-xs text-orange-500 mt-1 m-0">Cần xử lý ngay</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Doanh thu dự kiến</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 m-0 truncate">
            {formatCurrency(stats.revenue)}
          </p>
          <p className="text-xs text-gray-400 mt-1 m-0">Đã thanh toán</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Tỷ lệ lấp đầy</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 m-0">{stats.occupancy}%</p>
          <p className="text-xs text-gray-400 mt-1 m-0">Trung bình toàn bộ</p>
        </div>
      </div>

      {/* ── Filter Tabs & Search ─────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-gray-100">
          {/* Status tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none w-full sm:w-auto">
            {BOOKING_FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveFilter(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer border-none ${
                  activeFilter === tab.key
                    ? "bg-[#2DD4A8] text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & filter button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Tìm khách hàng, mã..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="!rounded-lg sm:!w-[200px]"
              size="middle"
              allowClear
            />
            <button className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:border-gray-300 transition-colors cursor-pointer flex-shrink-0">
              <FilterOutlined className="text-sm" />
            </button>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarOutlined className="text-2xl text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              Không có đơn đặt phòng nào
            </h3>
            <p className="text-sm text-gray-400">
              {activeFilter !== "all"
                ? "Không tìm thấy đơn đặt phòng với trạng thái này."
                : "Chưa có khách hàng nào đặt phòng."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table (Ant Design) */}
            <div className="hidden lg:block">
              <Table
                columns={columns}
                dataSource={filteredBookings}
                rowKey="bookingCode"
                pagination={false}
                className="[&_.ant-table-thead>tr>th]:!bg-white [&_.ant-table-thead>tr>th]:!text-gray-500 [&_.ant-table-thead>tr>th]:!font-semibold [&_.ant-table-thead>tr>th]:!text-xs [&_.ant-table-thead>tr>th]:!uppercase [&_.ant-table-thead>tr>th]:!border-b [&_.ant-table-thead>tr>th]:!border-gray-100 [&_.ant-table-tbody>tr>td]:!border-b [&_.ant-table-tbody>tr>td]:!border-gray-50 [&_.ant-table-tbody>tr:hover>td]:!bg-gray-50/50"
              />
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <div key={booking.bookingCode} className="p-4 space-y-3">
                  {/* Top row: code + status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#2DD4A8] font-bold text-sm">
                      {booking.bookingCode}
                    </span>
                    {getStatusTag(booking.status)}
                  </div>

                  {/* Guest + Property */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Avatar size={24} className="bg-gray-200 flex-shrink-0">
                        {booking.guestName?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <span className="text-sm font-semibold text-gray-900">
                        {booking.guestName}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 m-0 pl-8">
                      {booking.propertyName}
                    </p>
                  </div>

                  {/* Dates + Guests + Amount */}
                  <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <span className="font-medium">
                        {dayjs(booking.checkInDate).format("DD/MM")} –{" "}
                        {dayjs(booking.checkOutDate).format("DD/MM/YY")}
                      </span>
                      <span className="text-gray-400 ml-2">
                        · {booking.totalGuests} khách
                      </span>
                    </div>
                    <div className="font-bold text-gray-900 text-sm">
                      {formatCurrency(booking.finalAmount)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 pt-1">
                    {renderActions(booking)}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 m-0">
                Hiển thị{" "}
                {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalElements)} –{" "}
                {Math.min(currentPage * PAGE_SIZE, totalElements)} trong tổng số{" "}
                {totalElements} kết quả
              </p>
              <Pagination
                current={currentPage}
                total={totalElements}
                pageSize={PAGE_SIZE}
                onChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                showSizeChanger={false}
                size="small"
              />
            </div>
          </>
        )}
      </div>

      {/* ── Dispute Modal ────────────────────────────────────────── */}
      <DisputeModal
        open={!!disputeBookingCode}
        onClose={() => setDisputeBookingCode(null)}
        bookingCode={disputeBookingCode || ""}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["host-bookings"] })
        }
      />
    </div>
  );
}
