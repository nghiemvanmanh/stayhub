import React, { useState, useEffect } from "react";
import { Modal, Space, Typography, Input } from "antd";
import {
  ALL_HOST_STATUSES,
  HOST_APPLICATION_STATUS_MAP,
} from "@/constants/host-application";

const { Text } = Typography;
const { TextArea } = Input;

interface ApplicationApprovalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  confirmLoading: boolean;
  approvalAction: string;
  approvalHostCode: string;
}

export const ApplicationApprovalModal: React.FC<ApplicationApprovalModalProps> = ({
  open,
  onClose,
  onSubmit,
  confirmLoading,
  approvalAction,
  approvalHostCode,
}) => {
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    if (open) {
      setReviewNote("");
    }
  }, [open]);

  return (
    <Modal
      title={
        <Space>
          <span>
            {ALL_HOST_STATUSES.find((s) => s.value === approvalAction)?.label ??
              `Chuyển trạng thái: ${approvalAction}`}
          </span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={() => onSubmit(reviewNote)}
      confirmLoading={confirmLoading}
      okText="Xác nhận"
      okButtonProps={{
        danger: approvalAction === "REJECTED",
        style:
          approvalAction === "APPROVED"
            ? { background: "#2DD4A8", borderColor: "#2DD4A8" }
            : {},
      }}
      cancelText="Hủy"
      styles={{ body: { paddingTop: 16 } }}
    >
      <div>
        <p style={{ marginBottom: 12, color: "#475569" }}>
          Host: <Text strong>{approvalHostCode}</Text>
          {" · "}
          Chuyển sang:{" "}
          <Text
            strong
            style={{
              color: ALL_HOST_STATUSES.find((s) => s.value === approvalAction)?.color,
            }}
          >
            {HOST_APPLICATION_STATUS_MAP[approvalAction]?.label ?? approvalAction}
          </Text>
        </p>
        <Text style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          Ghi chú
        </Text>
        <TextArea
          rows={4}
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder="Nhập ghi chú cho thao tác này (không bắt buộc)..."
          style={{ borderRadius: 8 }}
        />
      </div>
    </Modal>
  );
};
