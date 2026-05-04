"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Button,
  Tooltip,
  Modal,
  message,
  Avatar,
  Row,
  Col,
} from "antd";
import {
  CalendarOutlined,
  ExclamationCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  StopOutlined,
  MessageOutlined,
  ExportOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { PageContainer, ProTable, StatisticCard } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import {
  Users,
  Clock,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { formatCurrency } from "@/utils/format";
import { BOOKING_STATUS_MAP, BOOKING_FILTER_TABS } from "@/constants/booking";
import DisputeModal from "@/components/shared/DisputeModal";
import RoomCalendarModal from "@/components/host/bookings/RoomCalendarModal";

dayjs.locale("vi");

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

const PAGE_SIZE = 10;

const getStatusTag = (status: string) => {
  const config = BOOKING_STATUS_MAP[status] || { label: status, color: "default" };
  return (
    <Tag color={config.color} style={{ borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 500, border: 0 }}>
      {config.label}
    </Tag>
  );
};

export default function HostBookings() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [disputeBookingCode, setDisputeBookingCode] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ["host-bookings", currentPage],
    queryFn: async () => {
      const res = await fetcher.get("/bookings/host", {
        params: { page: currentPage, size: 1000000 },
      });
      return res.data?.data ?? res.data;
    },
  });

  const allBookings: HostBookingItem[] = apiResponse?.items || [];
  const totalElements = apiResponse?.totalElements || 0;

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

  const stats = useMemo(() => {
    const total = totalElements;
    const pending = allBookings.filter((b) => b.status === "PENDING").length;
    const revenue = allBookings.reduce((s, b) => s + b.amountPaid, 0);
    const occupancy =
      allBookings.length > 0
        ? Math.round(
            (allBookings.filter(
              (b) => b.status === "CHECKED_IN" || b.status === "CONFIRMED" || b.status === "COMPLETED"
            ).length / allBookings.length) * 100
          )
        : 0;
    return { total, pending, revenue, occupancy };
  }, [allBookings, totalElements]);

  // Mutations
  const checkInMutation = useMutation({
    mutationFn: (bookingCode: string) => fetcher.put(`/bookings/${bookingCode}/check-in`),
    onSuccess: () => { message.success("Check-in thành công!"); queryClient.invalidateQueries({ queryKey: ["host-bookings"] }); },
    onError: (err: any) => { message.error(err?.response?.data?.message || err?.response?.data?.data || "Check-in thất bại"); },
  });

  const checkOutMutation = useMutation({
    mutationFn: (bookingCode: string) => fetcher.put(`/bookings/${bookingCode}/check-out`),
    onSuccess: () => { message.success("Check-out thành công!"); queryClient.invalidateQueries({ queryKey: ["host-bookings"] }); },
    onError: (err: any) => { message.error(err?.response?.data?.message || err?.response?.data?.data || "Check-out thất bại"); },
  });

  const handleCheckIn = (bookingCode: string) => {
    Modal.confirm({
      title: "Xác nhận Check-in",
      icon: <LoginOutlined className="text-cyan-500" />,
      content: `Xác nhận khách hàng đã nhận phòng cho booking ${bookingCode}?`,
      okText: "Check-in",
      cancelText: "Hủy",
      okButtonProps: { style: { background: "#06b6d4", borderColor: "#06b6d4" } },
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
      okButtonProps: { style: { background: "#3b82f6", borderColor: "#3b82f6" } },
      onOk: () => checkOutMutation.mutateAsync(bookingCode),
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
          message.error(err?.response?.data?.message || err?.response?.data?.data || "Hủy đặt phòng thất bại");
        }
      },
    });
  };

  const renderActions = (booking: HostBookingItem) => {
    const status = (booking.status || "").toUpperCase();
    const actionButtons: React.ReactNode[] = [];

    if (status === "CONFIRMED" || status === "PARTIALLY_PAID") {
      actionButtons.push(
        <Tooltip title="Check-in" key="checkin">
          <button onClick={() => handleCheckIn(booking.bookingCode)} className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 flex items-center justify-center border-none cursor-pointer transition-colors">
            <LoginOutlined className="text-sm" />
          </button>
        </Tooltip>
      );
    }
    if (status === "CHECKED_IN") {
      actionButtons.push(
        <Tooltip title="Check-out" key="checkout">
          <button onClick={() => handleCheckOut(booking.bookingCode)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center border-none cursor-pointer transition-colors">
            <LogoutOutlined className="text-sm" />
          </button>
        </Tooltip>
      );
    }
    if (["PENDING", "CONFIRMED", "AWAITING_PAYMENT", "PARTIALLY_PAID"].includes(status)) {
      actionButtons.push(
        <Tooltip title="Hủy" key="cancel">
          <button onClick={() => handleCancel(booking.bookingCode)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center border-none cursor-pointer transition-colors">
            <StopOutlined className="text-sm" />
          </button>
        </Tooltip>
      );
    }
    if (["CHECKED_IN", "CHECKED_OUT", "COMPLETED","PARTIALLY_PAID", "CONFIRMED"].includes(status)) {
      actionButtons.push(
        <Tooltip title="Khiếu nại" key="dispute">
          <button onClick={() => setDisputeBookingCode(booking.bookingCode)} className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-100 flex items-center justify-center border-none cursor-pointer transition-colors">
            <ExclamationCircleOutlined className="text-sm" />
          </button>
        </Tooltip>
      );
    }
    actionButtons.push(
      <Tooltip title="Hỗ trợ" key="support">
        <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 flex items-center justify-center border-none cursor-pointer transition-colors">
          <MessageOutlined className="text-sm" />
        </button>
      </Tooltip>
    );
    return <div className="flex items-center gap-1.5 justify-center">{actionButtons}</div>;
  };

  const columns: ProColumns<HostBookingItem>[] = [
    {
      title: "Mã Booking",
      dataIndex: "bookingCode",
      key: "bookingCode",
      render: (_: any, record: HostBookingItem) => <span className="text-[#2DD4A8] font-bold text-sm">{record.bookingCode}</span>,
    },
    {
      title: "Khách hàng",
      key: "guest",
      render: (_: any, record: HostBookingItem) => (
        <div className="flex items-center gap-2.5">
          <Avatar size={32} className="bg-gray-200 flex-shrink-0">{record.guestName?.charAt(0)?.toUpperCase()}</Avatar>
          <Tooltip title={record.guestName}>
            <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">{record.guestName}</span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Chỗ ở / Homestay",
      dataIndex: "propertyName",
      key: "propertyName",
      ellipsis: true,
      render: (_: any, record: HostBookingItem) => (
        <Tooltip title={record.propertyName}>
          <span className="text-sm text-gray-700 truncate block max-w-[200px]">{record.propertyName}</span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày lưu trú",
      key: "dates",
      render: (_: any, record: HostBookingItem) => (
        <div>
          <div className="text-sm text-gray-900 font-medium">{dayjs(record.checkInDate).format("DD/MM/YYYY")}</div>
          <div className="text-xs text-gray-400">đến {dayjs(record.checkOutDate).format("DD/MM/YYYY")}</div>
        </div>
      ),
    },
    {
      title: "Khách",
      dataIndex: "totalGuests",
      key: "totalGuests",
      align: "center",
      width: 70,
      render: (text: any) => <span className="text-sm font-medium text-gray-900">{text}</span>,
    },
    {
      title: "Thanh toán",
      key: "payment",
      align: "right",
      render: (_: any, record: HostBookingItem) => (
        <div>
          <div className="text-sm font-bold text-gray-900">{formatCurrency(record.finalAmount)}</div>
          {!record.isFullyPaid && (
            <div className="text-[10px] text-orange-500 font-medium">Đã trả: {formatCurrency(record.amountPaid)}</div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: any) => getStatusTag(status),
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_: any, record: HostBookingItem) => renderActions(record),
    },
  ];

  const tabItems = (BOOKING_FILTER_TABS as any[]).map((tab: any) => ({
    key: tab.key || tab.value || tab,
    label: tab.label || tab,
  }));

  return (
    <PageContainer
      header={{
        title: "Quản lý đặt phòng",
        subTitle: "Theo dõi và quản lý các yêu cầu đặt phòng từ khách hàng của bạn.",
      }}
      extra={[
        <Button key="export" icon={<ExportOutlined />} style={{ borderRadius: 12, height: 40 }}>
          Xuất báo cáo
        </Button>,
        <Button
          key="calendar"
          type="primary"
          icon={<CalendarOutlined />}
          onClick={() => setShowCalendar(true)}
          style={{ borderRadius: 12, height: 40, background: "#2DD4A8", borderColor: "#2DD4A8", fontWeight: 600 }}
        >
          Xem lịch trống
        </Button>,
      ]}
    >
      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tổng lượt đặt",
              value: stats.total,
              description: <span style={{ fontSize: 12, color: "#94a3b8" }}>Tháng này</span>,
              icon: <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E6FAF5", display: "flex", alignItems: "center", justifyContent: "center" }}><Users className="w-4 h-4 text-[#2DD4A8]" /></div>,
            }}
            style={{ borderRadius: 16 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Đang chờ xác nhận",
              value: String(stats.pending).padStart(2, "0"),
              description: <span style={{ fontSize: 12, color: "#f97316" }}>Cần xử lý ngay</span>,
              icon: <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}><Clock className="w-4 h-4 text-orange-500" /></div>,
            }}
            style={{ borderRadius: 16 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Doanh thu dự kiến",
              value: formatCurrency(stats.revenue),
              description: <span style={{ fontSize: 12, color: "#94a3b8" }}>Đã thanh toán</span>,
              icon: <div style={{ width: 32, height: 32, borderRadius: 8, background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center" }}><DollarSign className="w-4 h-4 text-purple-500" /></div>,
            }}
            style={{ borderRadius: 16 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tỷ lệ lấp đầy",
              value: stats.occupancy,
              suffix: "%",
              description: <span style={{ fontSize: 12, color: "#94a3b8" }}>Trung bình toàn bộ</span>,
              icon: <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}><BarChart3 className="w-4 h-4 text-green-500" /></div>,
            }}
            style={{ borderRadius: 16 }}
          />
        </Col>
      </Row>

      {/* ProTable */}
      <ProTable<HostBookingItem>
        columns={columns}
        dataSource={filteredBookings}
        rowKey="bookingCode"
        loading={isLoading}
        search={false}
        cardBordered
        headerTitle="Danh sách đặt phòng"
        options={{
          reload: () => refetch(),
          density: true,
          setting: true,
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeFilter,
            items: tabItems,
            onChange: (key) => {
              setActiveFilter(key as string);
              setCurrentPage(1);
            },
          },
          search: {
            placeholder: "Tìm khách hàng, mã...",
            onSearch: (value: string) => setSearchText(value),
            allowClear: true,
          },
        }}
        pagination={{
          current: currentPage,
          total: totalElements,
          pageSize: PAGE_SIZE,
          onChange: (page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          },
          showSizeChanger: false,
          showTotal: (total, range) =>
            `Hiển thị ${range[0]} – ${range[1]} trong tổng số ${total} kết quả`,
        }}
        scroll={{ x: 'max-content' }}
      />

      <DisputeModal
        open={!!disputeBookingCode}
        onClose={() => setDisputeBookingCode(null)}
        bookingCode={disputeBookingCode || ""}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["host-bookings"] })}
      />

      <RoomCalendarModal
        open={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
    </PageContainer>
  );
}
