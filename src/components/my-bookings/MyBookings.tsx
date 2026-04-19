"use client";

import React, { useState } from "react";
import { Tabs, Button, Spin, Tag, Breadcrumb, Dropdown, Modal, message } from "antd";
import { 
  Clock, 
  MapPin, 
  MessageSquare, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle,
  ChevronRight
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { BookingsResponse } from "@/interfaces";
import { historyStatuses, upcomingStatuses } from "@/constants/booking";

dayjs.locale("vi");

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const queryClient = useQueryClient();

  const CANCELLABLE_STATUSES = ["PENDING", "AWAITING_PAYMENT", "CONFIRMED", "PARTIALLY_PAID"];

  const handleCancelBooking = (bookingCode: string) => {
    Modal.confirm({
      title: "Xác nhận hủy đặt phòng",
      content: (
        <div className="space-y-2">
          <p>Bạn có chắc chắn muốn hủy booking <strong>{bookingCode}</strong>?</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            ⚠️ Lưu ý: Việc hủy phòng có thể chịu phí theo chính sách hủy của chỗ ở. Khoản hoàn tiền (nếu có) sẽ được xử lý trong 5-7 ngày làm việc.
          </div>
        </div>
      ),
      okText: "Hủy đặt phòng",
      cancelText: "Giữ lại",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await fetcher.put(`/bookings/cancel/${bookingCode}`);
          message.success("Đã hủy đặt phòng thành công!");
          queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        } catch (err: any) {
          message.error(
            err?.response?.data?.message ||
            err?.response?.data?.data ||
            "Hủy đặt phòng thất bại. Vui lòng thử lại."
          );
        }
      },
    });
  };

  const { data : bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", activeTab],
    queryFn: async () => {
      const res = await fetcher.get<BookingsResponse>("/bookings");
      return res.data?.data?.items || [];
    },
  });

  const upcomingBookings = bookings?.filter((b) => upcomingStatuses.includes(b.status)) || [];
  const historyBookings = bookings?.filter((b) => historyStatuses.includes(b.status)) || [];

  const displayBookings = activeTab === "upcoming" ? upcomingBookings : historyBookings;

  const TabTitle = ({ title, count }: { title: string; count: number }) => (
    <div className="flex items-center gap-2 text-base font-semibold px-2 py-1">
      {title} <span className="text-gray-500 font-normal">({count})</span>
    </div>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Tag color="orange" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><Clock className="w-4 h-4 inline mr-1" /> Chờ xác nhận</Tag>;
      case "CONFIRMED":
      case "PAID":
        return <Tag color="green" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><CheckCircle2 className="w-4 h-4 inline mr-1" /> Đã xác nhận</Tag>;
      case "CANCELLED":
      case "REJECTED":
        return <Tag color="red" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><XCircle className="w-4 h-4 inline mr-1" /> Đã hủy</Tag>;
      case "COMPLETED":
        return <Tag color="cyan" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><CheckCircle2 className="w-4 h-4 inline mr-1" /> Hoàn thành</Tag>;
      case "EXPIRED":
        return <Tag color="gray" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><Clock className="w-4 h-4 inline mr-1" /> Hết hạn</Tag>;
      default:
        return <Tag color="default" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0">{status}</Tag>;
    }
  };
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Chuyến đi</h1>
        <div className="mt-2 flex justify-between items-end">
          <div className="hidden md:block">
            <p>Quản lý các đặt phòng và hành trình của bạn.</p>
          </div>
          <Link 
            href="/search" 
            className="text-[#2DD4A8] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            Tìm điểm đến mới <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="space-y-6">
        {/* Tabs Control Area */}
        <div className="relative">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="custom-bookings-tabs"
            tabBarExtraContent={{
              right: (
                <div className="hidden sm:flex items-center gap-2 mb-2 text-[13px] text-gray-500 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Múi giờ địa phương: UTC+7 (GMT+7)
                </div>
              )
            }}
            items={[
              {
                key: "upcoming",
              label: <TabTitle title="Sắp tới" count={upcomingBookings.length} />,
              },
              {
                key: "history",
              label: <TabTitle title="Lịch sử" count={historyBookings.length} />,
              },
            ]}
          />
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-xl font-medium text-gray-900">Bạn chưa có chuyến đi nào.</p>
            <p className="text-gray-500 mt-2">Hãy khám phá các điểm đến mới cho hành trình tiếp theo của bạn.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayBookings.map((booking) => (
              <div 
                key={booking.bookingCode} 
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row p-6 gap-8 group hover:shadow-md transition-shadow"
              >
                {/* Image Section */}
                <div className="relative w-full md:w-[320px] h-[220px] rounded-2xl overflow-hidden shrink-0 shadow-inner">
                  <Image
                    src={booking.thumbnailUrl || "/images/placeholder.jpg"}
                    alt={booking.propertyName}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    {getStatusTag(booking.status)}
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-6">
                    {/* Title & Price */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5 flex-1">
                        <h3 className="text-[22px] font-bold text-gray-900 leading-tight">
                          {booking.propertyName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.propertyAddress}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng cộng</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(booking.totalAmount)}</p>
                      </div>
                    </div>

                    {/* Dates Grid */}
                    <div className="grid grid-cols-2 max-w-[400px]">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">NHẬN PHÒNG</p>
                        <p className="text-[16px] font-bold text-gray-900">
                          {dayjs(booking.checkInDate).format("DD [Th]MM, YYYY")}
                        </p>
                      </div>
                      <div className="space-y-1 border-l border-gray-100 pl-8">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">TRẢ PHÒNG</p>
                        <p className="text-[16px] font-bold text-gray-900">
                          {dayjs(booking.checkOutDate).format("DD [Th]MM, YYYY")}
                        </p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="pt-5 border-t border-dashed border-gray-200 flex flex-wrap items-center gap-y-2 gap-x-8 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Mã xác nhận:</span>
                        <span className="font-bold text-gray-900 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded leading-tight">
                          {booking.bookingCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Chủ nhà:</span>
                        <span className="font-bold text-gray-900">{booking.hostName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    <div className="flex items-center gap-3">
                      <Button className="h-10 px-6 rounded-xl border-gray-200 text-gray-700 font-bold text-sm bg-white hover:bg-gray-50">
                        Xem chi tiết
                      </Button>
                      <Button 
                        icon={<MessageSquare className="w-4 h-4" />}
                        className="h-10 px-4 rounded-xl text-gray-600 font-bold text-sm flex items-center gap-2 hover:bg-gray-50"
                      >
                        Liên hệ chủ nhà
                      </Button>
                      {CANCELLABLE_STATUSES.includes(booking.status) && (
                        <Button
                          danger
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => handleCancelBooking(booking.bookingCode)}
                          className="h-10 px-4 rounded-xl font-bold text-sm flex items-center gap-2"
                        >
                          Hủy đặt phòng
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button className="w-10 h-10 flex items-center justify-center rounded-xl border-gray-200 p-0 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                      <Button className="h-10 px-8 rounded-xl border-[#2DD4A8] text-[#2DD4A8] font-bold text-sm hover:bg-[#2DD4A8]/5 transition-colors">
                        Quản lý
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="bg-[#E6F7F5] rounded-xl p-5 flex gap-4 items-start border border-[#BFF0E8]">
        <div className="bg-white p-2 rounded-full text-[#2DD4A8] shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[#0E7A6B] font-bold text-base mb-1">Thông tin nhận phòng</h4>
          <p className="text-[#159684] text-sm">
            Bạn có thể nhận phòng bất kỳ lúc nào sau 14:00 vào ngày bắt đầu chuyến đi. Đừng quên liên hệ với chủ nhà trước 24 giờ để thỏa thuận về việc bàn giao chìa khóa.
          </p>
        </div>
      </div>

      {/* Helpful Resources */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tài nguyên hữu ích</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition bg-white cursor-pointer">
            <h4 className="font-bold text-gray-900 mb-2">Chính sách hủy phòng</h4>
            <p className="text-sm text-gray-500">Tìm hiểu thêm về cách thức hoàn tiền và thay đổi ngày.</p>
            </div>
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition bg-white cursor-pointer">
            <h4 className="font-bold text-gray-900 mb-2">Hướng dẫn an toàn</h4>
            <p className="text-sm text-gray-500">Các mẹo để có một chuyến đi an toàn và trọn vẹn nhất.</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition bg-white cursor-pointer">
            <h4 className="font-bold text-gray-900 mb-2">Trung tâm trợ giúp</h4>
            <p className="text-sm text-gray-500">Cần hỗ trợ? Đội ngũ của chúng tôi luôn sẵn sàng 24/7.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
