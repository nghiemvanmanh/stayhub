export const TRANSACTION_TYPE_MAP: Record<string, { label: string; color: string }> = {
  BOOKING_PAYMENT: { label: "Thanh toán", color: "blue" },
  BOOKING_INCOME: { label: "Thu nhập", color: "green" },
  BOOKING_REFUND: { label: "Hoàn tiền", color: "orange" },
  WITHDRAWAL: { label: "Rút tiền", color: "purple" },
  SYSTEM_FEE: { label: "Phí hệ thống", color: "red" },
  DEBT_PAYMENT: { label: "Trả nợ", color: "volcano" },
};

export const TRANSACTION_STATUS_MAP: Record<
  string,
  { label: string; color: string }
> = {
  PENDING: { label: "Đang xử lý", color: "orange" },
  SUCCESS: { label: "Thành công", color: "green" },
  FAILED: { label: "Thất bại", color: "red" },
  CANCELLED: { label: "Đã hủy", color: "default" },
};

export const ADMIN_PAYOUT_STATUS_MAP: Record<
  string,
  { color: string; label: string }
> = {
  REQUESTED: { color: "orange", label: "Chờ duyệt" },
  PROCESSING: { color: "processing", label: "Đang xử lý" },
  COMPLETED: { color: "success", label: "Hoàn thành" },
  REJECTED: { color: "error", label: "Từ chối" },
};

export const ADMIN_PAYOUT_TAB_FILTERS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ duyệt", value: "REQUESTED" },
  { label: "Hoàn thành", value: "COMPLETED" },
];
