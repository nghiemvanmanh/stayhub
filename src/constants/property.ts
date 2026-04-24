export const PROPERTY_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  HIDDEN: "HIDDEN",
  BANNED: "BANNED",
  REJECTED: "REJECTED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type PropertyStatus =
  (typeof PROPERTY_STATUS)[keyof typeof PROPERTY_STATUS];

export const PROPERTY_STATUS_MAP: Record<
  string,
  { label: string; isActive: boolean; color: string }
> = {
  [PROPERTY_STATUS.DRAFT]: {
    label: "Bản nháp",
    isActive: false,
    color: "default",
  },
  [PROPERTY_STATUS.PENDING_REVIEW]: {
    label: "Chờ duyệt",
    isActive: false,
    color: "orange",
  },
  [PROPERTY_STATUS.ACTIVE]: {
    label: "Đang hoạt động",
    isActive: true,
    color: "success",
  },
  [PROPERTY_STATUS.INACTIVE]: {
    label: "Không hoạt động",
    isActive: false,
    color: "default",
  },
  [PROPERTY_STATUS.HIDDEN]: {
    label: "Tạm dừng",
    isActive: false,
    color: "warning",
  },
  [PROPERTY_STATUS.BANNED]: {
    label: "Bị khóa",
    isActive: false,
    color: "error",
  },
  [PROPERTY_STATUS.REJECTED]: {
    label: "Đã từ chối",
    isActive: false,
    color: "error",
  },
};

export const ALL_ADMIN_PROPERTY_STATUSES: {
  value: string;
  label: string;
  color: string;
}[] = [
  { value: "ACTIVE", label: "Duyệt bài đăng", color: "#52c41a" },
  { value: "PENDING_REVIEW", label: "Đổi sang chờ duyệt", color: "#fa8c16" },
  { value: "HIDDEN", label: "Ẩn bài đăng", color: "#d48806" },
  { value: "REJECTED", label: "Từ chối bài đăng", color: "#ff4d4f" },
  { value: "BANNED", label: "Cấm vĩnh viễn", color: "#cf1322" },
  { value: "DRAFT", label: "Chuyển về Nháp", color: "#8c8c8c" },
];

export const ADMIN_PROPERTY_TAB_FILTERS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ duyệt", value: "PENDING_REVIEW" },
  { label: "Đã đăng", value: "ACTIVE" },
  { label: "Đang ẩn", value: "HIDDEN" },
  { label: "Bị cấm", value: "BANNED" },
];
