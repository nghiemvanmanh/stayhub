"use client";

import React, { useState } from "react";
import { Tabs, Button, Spin, Tag, Modal, message, Drawer, Avatar, Divider } from "antd";
import { 
  Clock, 
  MapPin, 
  MessageSquare, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle,
  ChevronRight,
  AlertTriangle,
  CreditCard,
  Star,
  Phone,
  Mail,
  Eye,
  ExternalLink
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DisputeModal from "@/components/shared/DisputeModal";
import ReviewModal from "@/components/my-bookings/ReviewModal";
import { fetcher } from "@/utils/fetcher";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { BookingsResponse, BookingItem } from "@/interfaces";
import { historyStatuses, upcomingStatuses } from "@/constants/booking";
import { formatCurrency } from "@/utils/format";
import { useAuth } from "@/contexts/AuthContext";

dayjs.locale("en");

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [disputeBookingCode, setDisputeBookingCode] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<{ bookingCode: string; propertyName: string } | null>(null);
  const [detailBooking, setDetailBooking] = useState<BookingItem | null>(null);
  const [contactBooking, setContactBooking] = useState<BookingItem | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  const completeMutation = useMutation({
    mutationFn: (bookingCode: string) =>
      fetcher.put(`/bookings/${bookingCode}/complete`),
    onSuccess: () => {
      message.success("Đã xác nhận hoàn thành chuyến đi!");
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.data ||
          "Xác nhận hoàn thành thất bại"
      );
    },
  });

  const handleCompleteTrip = (bookingCode: string) => {
    Modal.confirm({
      title: "Xác nhận hoàn thành",
      icon: <CheckCircle2 className="text-green-500 w-5 h-5 mr-3 mt-0.5 float-left" />,
      content: `Chuyến đi của bạn tại ${bookingCode} sẽ chuyển sang trạng thái đã hoàn thành. Hệ thống sẽ giữ nguyên trạng thái nếu không có khiếu nại nào sau 24h. Xác nhận hoàn thành?`,
      okText: "Hoàn thành",
      cancelText: "Hủy",
      okButtonProps: {
        className: "!bg-green-500 !border-green-500 hover:!bg-green-600",
      },
      onOk: () => completeMutation.mutateAsync(bookingCode),
    });
  };

  const [isRepaying, setIsRepaying] = useState<string | null>(null);
  const handleRepay = async (bookingCode: string) => {
    try {
      setIsRepaying(bookingCode);
      const returnUrl = `${window.location.origin}/payment-result`;
      const res = await fetcher.get("/payments/vnpay/booking/create-url", {
        params: { bookingCode, returnUrl }
      });
      if (res.data?.data) {
        window.location.href = res.data.data;
      } else {
        message.error("Không lấy được đường dẫn thanh toán");
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi tạo giao dịch thanh toán.");
    } finally {
      setIsRepaying(null);
    }
  };

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [bookingDetail, setBookingDetail] = useState<any>(null);

  const handleOpenDetail = async (booking: BookingItem) => {
    setDetailBooking(booking);
    setLoadingDetail(true);
    try {
      const res = await fetcher.get(`/bookings/${booking.bookingCode}`);
      setBookingDetail(res.data?.data ?? res.data);
    } catch {
      setBookingDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const { data : bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user, activeTab],
    queryFn: async () => {
      const res = await fetcher.get<BookingsResponse>("/bookings");
      return res.data?.data?.items || [];
    },
    enabled: !!user,
  });

  const upcomingBookings = bookings?.filter((b) => upcomingStatuses.includes(b.status)) || [];
  const historyBookings = bookings?.filter((b) => historyStatuses.includes(b.status)) || [];

  const displayBookings = activeTab === "upcoming" ? upcomingBookings : historyBookings;

  const TabTitle = ({ title, count }: { title: string; count: number }) => (
    <div className="flex items-center gap-2 text-base font-semibold px-2 py-1">
      {title} <span className="text-gray-500 font-normal">({count})</span>
    </div>
  );


  const getStatusTag = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Tag color="orange" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><Clock className="w-4 h-4 inline mr-1" /> Chờ xác nhận</Tag>;
      case "CONFIRMED":
        return <Tag color="green" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><CheckCircle2 className="w-4 h-4 inline mr-1" /> Đã xác nhận</Tag>;
      case "CANCELLED":
        return <Tag color="red" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><XCircle className="w-4 h-4 inline mr-1" /> Đã hủy</Tag>;
      case "AWAITING_PAYMENT":
        return <Tag color="volcano" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><Clock className="w-4 h-4 inline mr-1" /> Chờ thanh toán</Tag>;
      case "COMPLETED":
        return <Tag color="cyan" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><CheckCircle2 className="w-4 h-4 inline mr-1" /> Hoàn thành</Tag>;
      case "EXPIRED":
        return <Tag color="gray" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><Clock className="w-4 h-4 inline mr-1" /> Hết hạn</Tag>;
      case "CHECKED_IN":
        return <Tag color="purple" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><Clock className="w-4 h-4 inline mr-1" /> Nhận phòng</Tag>;
      case "CHECKED_OUT":
        return <Tag color="magenta" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><Clock className="w-4 h-4 inline mr-1" /> Trả phòng</Tag>;
      case "DISPUTED":
        return <Tag color="orange" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><Clock className="w-4 h-4 inline mr-1" /> Khiếu nại</Tag>;
      case "PARTIALLY_PAID": 
        return <Tag color="green" className="!flex !items-center rounded-full px-3 py-1 text-sm border-0"><Clock className="w-4 h-4 inline mr-1" />Đã thanh toán 1 phần</Tag>;
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
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                      <Button
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleOpenDetail(booking)}
                        className="h-10 px-5 rounded-xl border-gray-200 text-gray-700 font-bold text-sm bg-white hover:bg-gray-50 flex items-center gap-2"
                      >
                        Xem chi tiết
                      </Button>
                      <Button 
                        icon={<MessageSquare className="w-4 h-4" />}
                        onClick={() => setContactBooking(booking)}
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
                      {booking.status === "AWAITING_PAYMENT" && (
                        <Button
                          icon={<CreditCard className="w-4 h-4" />}
                          onClick={() => handleRepay(booking.bookingCode)}
                          loading={isRepaying === booking.bookingCode}
                          className="h-10 px-4 rounded-xl font-bold text-sm flex items-center gap-2 !bg-[#2DD4A8] !text-white !border-[#2DD4A8] hover:!bg-[#25bc95]"
                        >
                          Hoàn thành thanh toán
                        </Button>
                      )}
                      {booking.status === "CHECKED_OUT" && (
                        <Button
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => handleCompleteTrip(booking.bookingCode)}
                          className="h-10 px-4 rounded-xl font-bold text-sm flex items-center gap-2 !bg-[#2DD4A8] !text-white !border-[#2DD4A8] hover:!bg-[#25bc95]"
                        >
                          Hoàn thành chuyến đi
                        </Button>
                      )}
                      {["CHECKED_IN", "CHECKED_OUT", "PARTIALLY_PAID", "CONFIRMED"].includes(booking.status) && (
                        <Button
                          icon={<AlertTriangle className="w-4 h-4" />}
                          onClick={() => setDisputeBookingCode(booking.bookingCode)}
                          className="h-10 px-4 rounded-xl font-bold text-sm flex items-center gap-2 !text-orange-500 !border-orange-200 hover:!bg-orange-50"
                        >
                          Khiếu nại
                        </Button>
                      )}
                      {booking.status === "COMPLETED" && (
                        <Button
                          icon={<Star className="w-4 h-4" />}
                          onClick={() => setReviewBooking({ bookingCode: booking.bookingCode, propertyName: booking.propertyName })}
                          className="h-10 px-4 rounded-xl font-bold text-sm flex items-center gap-2 !bg-amber-500 !text-white !border-amber-500 hover:!bg-amber-600"
                        >
                          Viết đánh giá
                        </Button>
                      )}
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
      
      <DisputeModal
        open={!!disputeBookingCode}
        onClose={() => setDisputeBookingCode(null)}
        bookingCode={disputeBookingCode || ""}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["my-bookings"] })
        }
      />

      <ReviewModal
        open={!!reviewBooking}
        onClose={() => setReviewBooking(null)}
        bookingCode={reviewBooking?.bookingCode || ""}
        propertyName={reviewBooking?.propertyName || ""}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["my-bookings"] })
        }
      />

      {/* Detail Drawer */}
      <Drawer
        title={<span className="text-xl font-bold">Chi tiết chuyến đi</span>}
        open={!!detailBooking}
        onClose={() => { setDetailBooking(null); setBookingDetail(null); }}
        width={560}
        styles={{ body: { padding: 0 } }}
      >
        {detailBooking && (
          <div>
            <div className="relative w-full h-56">
              <Image src={detailBooking.thumbnailUrl || "/images/placeholder.jpg"} alt={detailBooking.propertyName} fill className="object-cover" />
              <div className="absolute top-4 left-4 scale-110 origin-top-left">{getStatusTag(detailBooking.status)}</div>
            </div>
            <div className="p-8 space-y-7">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 m-0 mb-2">{detailBooking.propertyName}</h3>
                <p className="text-base text-gray-500 m-0 flex items-center gap-2"><MapPin className="w-4 h-4" />{detailBooking.propertyAddress}</p>
              </div>

              {loadingDetail ? (
                <div className="flex justify-center py-12"><Spin size="large" /></div>
              ) : (
                <>
                  <Divider className="!my-0" />
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100"><p className="text-xs uppercase font-bold text-gray-400 mb-1 m-0">Nhận phòng</p><p className="text-base font-bold text-gray-900 m-0">{dayjs(bookingDetail?.checkInDate || detailBooking.checkInDate).format("DD/MM/YYYY")}</p></div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100"><p className="text-xs uppercase font-bold text-gray-400 mb-1 m-0">Trả phòng</p><p className="text-base font-bold text-gray-900 m-0">{dayjs(bookingDetail?.checkOutDate || detailBooking.checkOutDate).format("DD/MM/YYYY")}</p></div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100"><p className="text-xs uppercase font-bold text-gray-400 mb-1 m-0">Số đêm</p><p className="text-base font-bold text-gray-900 m-0">{bookingDetail?.numberOfNights || dayjs(detailBooking.checkOutDate).diff(dayjs(detailBooking.checkInDate), 'day')} đêm</p></div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100"><p className="text-xs uppercase font-bold text-gray-400 mb-1 m-0">Số khách</p><p className="text-base font-bold text-gray-900 m-0">{bookingDetail?.totalGuests || detailBooking.totalGuests || '—'} khách</p></div>
                  </div>

                  {/* Rooms */}
                  {bookingDetail?.rooms && bookingDetail.rooms.length > 0 && (
                    <>
                      <Divider className="!my-0" />
                      <div>
                        <p className="text-sm uppercase font-bold text-gray-900 mb-4 m-0">Phòng đã đặt</p>
                        <div className="space-y-3">
                          {bookingDetail.rooms.map((room: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
                              <div>
                                <p className="text-base font-bold text-gray-800 m-0">{room.roomName || room.name}</p>
                                <p className="text-sm text-gray-500 m-0 mt-1">Số lượng: <span className="font-semibold text-gray-700">{room.quantity || 1}</span></p>
                              </div>
                              <span className="text-base font-bold text-[#2DD4A8]">{formatCurrency(room.pricePerNight || room.price)}<span className="text-xs font-normal text-gray-500">/đêm</span></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Payment */}
                  <Divider className="!my-0" />
                  <div>
                    <p className="text-sm uppercase font-bold text-gray-900 mb-4 m-0">Chi tiết thanh toán</p>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-3">
                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-500 font-medium">Tổng thanh toán</span>
                        <span className="font-bold text-xl text-gray-900">{formatCurrency(bookingDetail?.totalAmount || bookingDetail?.finalAmount || detailBooking.totalAmount)}</span>
                      </div>
                      <Divider className="!my-3 border-gray-200" />
                      <div className="flex justify-between items-center text-base">
                        <span className="text-gray-500">Đã thanh toán</span>
                        <span className="font-bold text-green-600">{formatCurrency(bookingDetail?.amountPaid ?? detailBooking.amountPaid ?? bookingDetail?.totalAmount ?? detailBooking.totalAmount ?? 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Host */}
                  <Divider className="!my-0" />
                  <div>
                    <p className="text-sm uppercase font-bold text-gray-900 mb-4 m-0">Chủ nhà</p>
                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                      <Avatar size={56} src={bookingDetail?.hostAvatarUrl || detailBooking.hostAvatarUrl} className="border-2 border-white shadow-sm text-lg font-bold">{(bookingDetail?.hostName || detailBooking.hostName)?.charAt(0)?.toUpperCase()}</Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg m-0 mb-1">{bookingDetail?.hostName || detailBooking.hostName}</p>
                        <div className="flex flex-col gap-1">
                          {(bookingDetail?.hostPhone || detailBooking.hostPhone) && <p className="text-sm text-gray-600 flex items-center gap-2 m-0"><Phone className="w-3.5 h-3.5 text-gray-400" /> {bookingDetail?.hostPhone || detailBooking.hostPhone}</p>}
                          {(bookingDetail?.hostEmail || detailBooking.hostEmail) && <p className="text-sm text-gray-600 flex items-center gap-2 m-0"><Mail className="w-3.5 h-3.5 text-gray-400" /> {bookingDetail?.hostEmail || detailBooking.hostEmail}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <Divider className="!my-0" />
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 bg-[#F8FAFC] p-5 rounded-2xl border border-slate-100">
                    <div><p className="text-xs uppercase font-bold text-slate-400 mb-1 m-0">Mã xác nhận</p><p className="text-base font-bold text-slate-800 m-0">{detailBooking.bookingCode}</p></div>
                    <div className="text-right"><p className="text-xs uppercase font-bold text-slate-400 mb-1 m-0">Ngày đặt</p><p className="text-base font-medium text-slate-700 m-0">{dayjs(bookingDetail?.createdAt || detailBooking.createdAt).format("DD/MM/YYYY HH:mm")}</p></div>
                    <div><p className="text-xs uppercase font-bold text-slate-400 mb-1 m-0">Trạng thái</p><div className="mt-1">{getStatusTag(bookingDetail?.status || detailBooking.status)}</div></div>
                    {bookingDetail?.cancellationPolicyName && <div className="text-right"><p className="text-xs uppercase font-bold text-slate-400 mb-1 m-0">Chính sách hủy</p><p className="text-base font-medium text-slate-700 m-0">{bookingDetail.cancellationPolicyName}</p></div>}
                  </div>

                  {(bookingDetail?.propertySlug || detailBooking.propertySlug) && (
                    <div className="pt-2">
                      <Link
                        href={`/homestay/${bookingDetail?.propertySlug || detailBooking.propertySlug}`}
                      >
                        <Button type="primary" size="large" block className="h-12 rounded-xl !bg-[#2DD4A8] hover:!bg-[#22b892] !border-none font-bold text-base flex items-center justify-center gap-2">
                          <ExternalLink className="w-5 h-5" /> Mở trang chỗ ở
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Contact Host Modal */}
      <Modal
        open={!!contactBooking}
        onCancel={() => setContactBooking(null)}
        title={null}
        footer={null}
        centered
        width={420}
        styles={{ body: { padding: "8px 0 0" } }}
      >
        {contactBooking && (
          <div className="text-center">
            <Avatar size={64} src={contactBooking.hostAvatarUrl} className="mx-auto mb-3 border-2 border-gray-100">
              {contactBooking.hostName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <h3 className="text-lg font-bold text-gray-900 m-0">{contactBooking.hostName}</h3>
            <p className="text-xs text-gray-400 mt-1 mb-4 m-0">Chủ nhà · {contactBooking.propertyName}</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-4">
              {contactBooking.hostPhone && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0"><Phone className="w-4 h-4 text-green-600" /></div>
                  <div><p className="text-[11px] uppercase font-bold text-gray-400 m-0">Số điện thoại</p><a href={`tel:${contactBooking.hostPhone}`} className="text-sm font-semibold text-gray-900 no-underline hover:text-[#2DD4A8]">{contactBooking.hostPhone}</a></div>
                </div>
              )}
              {contactBooking.hostEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"><Mail className="w-4 h-4 text-blue-600" /></div>
                  <div><p className="text-[11px] uppercase font-bold text-gray-400 m-0">Email</p><a href={`mailto:${contactBooking.hostEmail}`} className="text-sm font-semibold text-gray-900 no-underline hover:text-[#2DD4A8]">{contactBooking.hostEmail}</a></div>
                </div>
              )}
              {!contactBooking.hostPhone && !contactBooking.hostEmail && (
                <p className="text-sm text-gray-400 text-center m-0">Chưa có thông tin liên hệ.</p>
              )}
            </div>
            <p className="text-[11px] text-gray-400 m-0">Mã booking: <span className="font-bold">{contactBooking.bookingCode}</span></p>
          </div>
        )}
      </Modal>
    </div>
  );
}
