import React from "react";
import { Modal, Button, Space, Avatar, Tag, Typography, Image } from "antd";
import { UserOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { AdminDisputeItem } from "@/interfaces/admin";
import { ADMIN_DISPUTE_STATUS_MAP } from "@/constants/dispute";

const { Text } = Typography;

interface DisputeDetailModalProps {
  open: boolean;
  onClose: () => void;
  dispute: AdminDisputeItem | null;
}

export const DisputeDetailModal: React.FC<DisputeDetailModalProps> = ({
  open,
  onClose,
  dispute,
}) => {
  const selectedEvidenceUrls = React.useMemo(() => {
    console.log(dispute)
    if (!dispute?.evidenceImageUrls) return [];
    try {
      if (dispute.evidenceImageUrls.startsWith("[")) {
        return JSON.parse(dispute.evidenceImageUrls);
      }
      return dispute.evidenceImageUrls.split(",").map((s) => s.trim()).filter(Boolean);
    } catch (e) {
      return [dispute.evidenceImageUrls];
    }
  }, [dispute]);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text>Chi tiết khiếu nại Booking</Text>
          {dispute && (
            <Tag color="processing" style={{ borderRadius: 6, margin: 0 }}>
              #{dispute.bookingCode}
            </Tag>
          )}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} style={{ borderRadius: 8 }}>
          Đóng
        </Button>,
        <Button
          key="resolve"
          type="primary"
          icon={<CheckCircleOutlined />}
          style={{ borderRadius: 8, backgroundColor: "#10b981" }}
        >
          Đánh dấu Đã xử lý
        </Button>,
      ]}
      width={600}
      styles={{ body: { padding: "16px 0" } }}
    >
      {dispute && (
        <div style={{ padding: "0 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Space>
              <Avatar size={48} icon={<UserOutlined />} />
              <div>
                <Text strong style={{ fontSize: 16, display: "block" }}>
                  {dispute.creatorName || dispute.creatorEmail}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Vai trò: {dispute.creatorRole || "USER"}
                </Text>
              </div>
            </Space>
            <Tag
              color={ADMIN_DISPUTE_STATUS_MAP[dispute.status]?.color || "default"}
              style={{ padding: "4px 12px", borderRadius: 16, fontSize: 13 }}
            >
              {ADMIN_DISPUTE_STATUS_MAP[dispute.status]?.label || dispute.status}
            </Tag>
          </div>

          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8, marginBottom: 20, border: "1px solid #e2e8f0" }}>
            <Text
              type="secondary"
              style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 8 }}
            >
              Nội dung khiếu nại
            </Text>
            <Text style={{ fontSize: 14 }}>{dispute.reason || "Không có nội dung."}</Text>
          </div>

          {selectedEvidenceUrls.length > 0 && (
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 12 }}
              >
                Tài liệu đính kèm ({selectedEvidenceUrls.length})
              </Text>
              <Image.PreviewGroup>
                <Space wrap>
                  {selectedEvidenceUrls.map((url: string, index: number) => (
                    <Image
                      key={index}
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #f0f0f0" }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Ngày tạo: {dayjs(dispute.createdAt).format("HH:mm - DD/MM/YYYY")}
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
};
