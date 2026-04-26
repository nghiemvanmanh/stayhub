"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Badge, Modal, Tag, Card, Avatar, Empty, Spin } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/format";
import { BOOKING_STATUS_MAP } from "@/constants/booking";

interface BookingItem {
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

const STATUS_BADGE: Record<string, "success" | "processing" | "error" | "default" | "warning"> = {
  CONFIRMED: "processing",
  CHECKED_IN: "success",
  CHECKED_OUT: "success",
  COMPLETED: "success",
  PENDING: "warning",
  AWAITING_PAYMENT: "warning",
  PARTIALLY_PAID: "warning",
  CANCELLED: "error",
  REJECTED: "error",
  EXPIRED: "default",
  DISPUTED: "error",
};

export default function BookingCalendar() {
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  // Fetch all bookings (up to 200 for calendar display)
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ["host-bookings-calendar"],
    queryFn: async () => {
      const res = await fetcher.get("/bookings/host", { params: { page: 1, size: 200 } });
      return res.data?.data ?? res.data;
    },
  });

  const allBookings: BookingItem[] = bookingsData?.items || [];

  // Group bookings by check-in date
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, BookingItem[]>();
    allBookings.forEach((b) => {
      const dateStr = dayjs(b.checkInDate).format("YYYY-MM-DD");
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr)!.push(b);
    });
    return map;
  }, [allBookings]);

  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format("YYYY-MM-DD");
    const bookings = bookingsByDate.get(dateStr) || [];
    if (bookings.length === 0) return null;

    return (
      <ul className="list-none m-0 p-0 space-y-0.5">
        {bookings.slice(0, 3).map((b) => {
          const badgeStatus = STATUS_BADGE[b.status] || "default";
          return (
            <li
              key={b.bookingCode}
              className="cursor-pointer hover:opacity-75 transition-opacity"
              onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
            >
              <Badge
                status={badgeStatus}
                text={
                  <span className="text-[11px] leading-tight text-gray-600 truncate block max-w-full">
                    {b.guestName}
                  </span>
                }
              />
            </li>
          );
        })}
        {bookings.length > 3 && (
          <li className="text-[10px] text-gray-400 pl-3.5">
            +{bookings.length - 3} khác
          </li>
        )}
      </ul>
    );
  };

  const getStatusTag = (status: string) => {
    const config = BOOKING_STATUS_MAP[status] || { label: status, color: "default" };
    return (
      <Tag color={config.color} style={{ borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 500, border: 0 }}>
        {config.label}
      </Tag>
    );
  };

  return (
    <>
      <Card
        className="rounded-2xl border-gray-100 shadow-sm"
        styles={{ body: { padding: "16px 20px" } }}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#E6FAF5] rounded-lg flex items-center justify-center">
              <CalendarOutlined className="text-[#2DD4A8]" />
            </div>
            <div>
              <div className="text-base font-bold text-gray-900">Lịch đặt phòng</div>
              <div className="text-xs text-gray-400 font-normal">Nhấn vào booking để xem chi tiết</div>
            </div>
          </div>
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-16"><Spin size="large" /></div>
        ) : (
          <div className="[&_.ant-picker-calendar-date-content]:!h-[60px] [&_.ant-picker-calendar-date-content]:!overflow-y-auto [&_.ant-picker-cell]:!py-[2px] [&_.ant-picker-cell]:!px-0 [&_.ant-picker-calendar-date-value]:!font-bold [&_.ant-picker-cell-today_.ant-picker-calendar-date]:!border-[#2DD4A8] [&_.ant-picker-cell-selected_.ant-picker-calendar-date]:!bg-[#E6FAF5] [&_.ant-picker-cell-selected_.ant-picker-calendar-date_.ant-picker-calendar-date-value]:!text-[#2DD4A8]">
            <Calendar
              cellRender={(date, info) => {
                if (info.type === "date") return dateCellRender(date as Dayjs);
                return info.originNode;
              }}
            />
          </div>
        )}
      </Card>

      {/* Booking Detail Modal */}
      <Modal
        open={!!selectedBooking}
        onCancel={() => setSelectedBooking(null)}
        footer={null}
        width={440}
        centered
        destroyOnHidden
      >
        {selectedBooking && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <Avatar size={44} className="bg-[#2DD4A8] flex-shrink-0 text-lg font-bold">
                {selectedBooking.guestName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 m-0">{selectedBooking.guestName}</h3>
                <p className="text-xs text-gray-400 m-0 truncate">{selectedBooking.propertyName}</p>
              </div>
              {getStatusTag(selectedBooking.status)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 m-0 mb-1">Mã Booking</p>
                <p className="text-sm font-bold text-[#2DD4A8] m-0">{selectedBooking.bookingCode}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 m-0 mb-1">Số khách</p>
                <p className="text-sm font-bold text-gray-900 m-0">{selectedBooking.totalGuests} khách</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 m-0 mb-1">Check-in</p>
                <p className="text-sm font-bold text-gray-900 m-0">{dayjs(selectedBooking.checkInDate).format("DD/MM/YYYY")}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 m-0 mb-1">Check-out</p>
                <p className="text-sm font-bold text-gray-900 m-0">{dayjs(selectedBooking.checkOutDate).format("DD/MM/YYYY")}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#E6FAF5] to-emerald-50 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-[11px] text-gray-400 m-0 mb-1">Tổng thanh toán</p>
                <p className="text-xl font-bold text-gray-900 m-0">{formatCurrency(selectedBooking.finalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-400 m-0 mb-1">Đã trả</p>
                <p className={`text-sm font-bold m-0 ${selectedBooking.isFullyPaid ? 'text-green-600' : 'text-orange-500'}`}>
                  {formatCurrency(selectedBooking.amountPaid)}
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-400 text-center">
              Đặt lúc {dayjs(selectedBooking.createdAt).format("HH:mm DD/MM/YYYY")}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
