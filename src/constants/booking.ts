export const upcomingStatuses = [
  "PENDING",
  "AWAITING_PAYMENT",
  "PARTIALLY_PAID",
  "CONFIRMED",
  "CHECKED_IN",
];

export const historyStatuses = [
  "CHECKED_OUT",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
  "DISPUTED",
];

export const BOOKING_STATUS_MAP: Record<
  string,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    color: "orange",
    bgColor: "bg-orange-50",
    textColor: "text-orange-600",
  },
  AWAITING_PAYMENT: {
    label: "Chờ thanh toán",
    color: "gold",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-600",
  },
  PARTIALLY_PAID: {
    label: "Thanh toán 1 phần",
    color: "lime",
    bgColor: "bg-lime-50",
    textColor: "text-lime-700",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    color: "blue",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  },
  CHECKED_IN: {
    label: "Đã nhận phòng",
    color: "cyan",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
  },
  CHECKED_OUT: {
    label: "Đã trả phòng",
    color: "geekblue",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  COMPLETED: {
    label: "Hoàn tất",
    color: "green",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
  },
  CANCELLED: {
    label: "Đã hủy",
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-500",
  },
  REJECTED: {
    label: "Từ chối",
    color: "red",
    bgColor: "bg-red-50",
    textColor: "text-red-500",
  },
  EXPIRED: {
    label: "Hết hạn",
    color: "default",
    bgColor: "bg-gray-50",
    textColor: "text-gray-500",
  },
  DISPUTED: {
    label: "Khiếu nại",
    color: "volcano",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
  },
};

export const BOOKING_FILTER_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "PENDING", label: "Chờ xác nhận" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "CHECKED_IN", label: "Đã nhận phòng" },
  { key: "COMPLETED", label: "Hoàn tất" },
  { key: "CANCELLED", label: "Đã hủy" },
];