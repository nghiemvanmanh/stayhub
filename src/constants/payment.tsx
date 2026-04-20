import React from "react";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";

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
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: { label: "Đang xử lý", color: "orange", icon: <ClockCircleOutlined /> },
  SUCCESS: { label: "Thành công", color: "green", icon: <CheckCircleOutlined /> },
  FAILED: { label: "Thất bại", color: "red", icon: <CloseCircleOutlined /> },
  CANCELLED: { label: "Đã hủy", color: "default", icon: <CloseCircleOutlined /> },
};

export const ADMIN_PAYOUT_STATUS_MAP: Record<
  string,
  { color: string; label: string; icon: React.ReactNode }
> = {
  REQUESTED: { color: "orange", label: "Chờ duyệt", icon: <ClockCircleOutlined /> },
  PROCESSING: { color: "processing", label: "Đang xử lý", icon: <SyncOutlined spin /> },
  COMPLETED: { color: "success", label: "Hoàn thành", icon: <CheckCircleOutlined /> },
  REJECTED: { color: "error", label: "Từ chối", icon: <CloseCircleOutlined /> },
};

export const ADMIN_PAYOUT_TAB_FILTERS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Chờ duyệt", value: "REQUESTED" },
  { label: "Hoàn thành", value: "COMPLETED" },
];
