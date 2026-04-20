export const HOST_APPLICATION_STATUS_MAP: Record<string, { color: string; label: string }> = {
  PENDING_REVIEW:  { color: "orange",  label: "Chờ xét duyệt" },
  DRAFT:           { color: "default", label: "Nháp" },
  APPROVED:        { color: "success", label: "Đã phê duyệt" },
  REJECTED:        { color: "error",   label: "Đã từ chối" },
  REQUEST_CHANGES: { color: "warning", label: "Yêu cầu bổ sung" },
};

export const ALL_HOST_STATUSES: { value: string; label: string; color: string }[] = [
  { value: "APPROVED",        label: "Phê duyệt hồ sơ",       color: "#52c41a" },
  { value: "PENDING_REVIEW",  label: "Chuyển về chờ xét duyệt", color: "#fa8c16" },
  { value: "REQUEST_CHANGES", label: "Yêu cầu bổ sung hồ sơ", color: "#d48806" },
  { value: "REJECTED",        label: "Từ chối hồ sơ",          color: "#ff4d4f" },
  { value: "DRAFT",           label: "Chuyển về Nháp",         color: "#8c8c8c" },
];

export const HOST_APPLICATION_TAB_FILTERS = [
  { label: "Tất cả",          value: "ALL" },
  { label: "Chờ xét duyệt",   value: "PENDING_REVIEW" },
  { label: "Đã phê duyệt",    value: "APPROVED" },
  { label: "Yêu cầu bổ sung", value: "REQUEST_CHANGES" },
  { label: "Từ chối",         value: "REJECTED" },
];
