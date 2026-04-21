export const ADMIN_DISPUTE_STATUS_MAP: Record<
  string,
  { color: string; label: string }
> = {
  OPEN: { color: "blue", label: "Mới" },
  IN_PROGRESS: { color: "warning", label: "Đang xử lý" },
  RESOLVED: { color: "success", label: "Đã giải quyết" },
  CLOSED: { color: "default", label: "Đã đóng" },
};

export const ADMIN_DISPUTE_TAB_FILTERS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Mới", value: "OPEN" },
  { label: "Đang xử lý", value: "IN_PROGRESS" },
  { label: "Đã giải quyết", value: "RESOLVED" },
  { label: "Đã đóng", value: "CLOSED" },
];
