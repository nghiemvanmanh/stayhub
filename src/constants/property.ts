export const PROPERTY_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  HIDDEN: "HIDDEN",
  BANNED: "BANNED",
} as const;

export type PropertyStatus = typeof PROPERTY_STATUS[keyof typeof PROPERTY_STATUS];

export const PROPERTY_STATUS_MAP: Record<string, { label: string; isActive: boolean }> = {
  [PROPERTY_STATUS.DRAFT]: { label: "Bản nháp", isActive: false },
  [PROPERTY_STATUS.PENDING_REVIEW]: { label: "Chờ duyệt", isActive: false },
  [PROPERTY_STATUS.PUBLISHED]: { label: "Đang hoạt động", isActive: true },
  [PROPERTY_STATUS.HIDDEN]: { label: "Tạm dừng", isActive: false },
  [PROPERTY_STATUS.BANNED]: { label: "Bị khóa", isActive: false },
};
