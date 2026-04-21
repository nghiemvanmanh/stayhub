import React, { useState, useEffect } from "react";
import { Drawer, Button, Space, Avatar, Tag, Typography, Row, Col, Input } from "antd";
import { UserOutlined, MailOutlined, BankOutlined, LinkOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { AdminPayoutItem } from "@/interfaces/admin";
import { ADMIN_PAYOUT_STATUS_MAP } from "@/constants/payment";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface PayoutDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  payout: AdminPayoutItem | null;
  isUpdating: boolean;
  onApprove: (data: { bankRef: string; proofImage: string; adminNote: string }) => void;
  onReject: (data: { bankRef: string; proofImage: string; adminNote: string }) => void;
}

export const PayoutDetailDrawer: React.FC<PayoutDetailDrawerProps> = ({
  open,
  onClose,
  payout,
  isUpdating,
  onApprove,
  onReject,
}) => {
  const [adminNote, setAdminNote] = useState("");
  const [bankRef, setBankRef] = useState("");
  const [proofImage, setProofImage] = useState("");

  useEffect(() => {
    if (payout) {
      setAdminNote(payout.adminNote || "");
      setBankRef(payout.bankTransactionRef || "");
      setProofImage((payout as any).proofImageUrl || "");
    } else {
      setAdminNote("");
      setBankRef("");
      setProofImage("");
    }
  }, [payout]);

  const handleApprove = () => onApprove({ bankRef, proofImage, adminNote });
  const handleReject = () => onReject({ bankRef, proofImage, adminNote });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={540}
      styles={{ body: { padding: 0 } }}
      closable
    >
      {payout && (
        <div>
          <div style={{ height: 5, background: "linear-gradient(90deg, #2DD4A8, #22b892)", borderRadius: "0" }} />

          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Tag color="processing" style={{ borderRadius: 12, padding: "2px 14px", fontWeight: 600, fontSize: 13 }}>
                WR-{String(payout.id).padStart(4, "0")}
              </Tag>
              <Tag style={{ borderRadius: 6, padding: "4px 14px", fontWeight: 500, fontSize: 13 }}>
                {ADMIN_PAYOUT_STATUS_MAP[payout.status]?.label || payout.status}
              </Tag>
            </div>

            <Title level={4} style={{ margin: 0, color: "#1a1a2e", fontWeight: 800 }}>
              Chi tiết yêu cầu rút tiền
            </Title>
            <Text style={{ color: "#94a3b8", fontSize: 13 }}>
              Xem xét thông tin thanh toán trước khi phê duyệt giao dịch.
            </Text>

            <div style={{ background: "#f8f9fb", borderRadius: 12, padding: "16px 20px", marginTop: 20, display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar src={payout.hostAvatarUrl} icon={<UserOutlined />} size={56} />
              <div>
                <Text strong style={{ fontSize: 16, color: "#1a1a2e" }}>{payout.hostName || "--"}</Text>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>
                  <MailOutlined style={{ marginRight: 4 }} />
                  {payout.hostEmail || "--"}
                </div>
              </div>
            </div>

            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <div style={{ background: "#f0fdf8", borderRadius: 10, padding: "14px 16px", border: "1px solid #d1fae5" }}>
                  <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Số tiền yêu cầu</Text>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#2DD4A8", marginTop: 4 }}>
                    {payout.amount != null ? `${payout.amount.toLocaleString("vi-VN")} VNĐ` : "--"}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "14px 16px", border: "1px solid #f0f0f0" }}>
                  <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Ngày yêu cầu</Text>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginTop: 4 }}>
                    {payout.createdAt ? dayjs(payout.createdAt).format("YYYY-MM-DD HH:mm") : "--"}
                  </div>
                </div>
              </Col>
            </Row>

            <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "14px 16px", marginTop: 16, border: "1px solid #f0f0f0" }}>
              <Text style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Thông tin tài khoản ngân hàng</Text>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <BankOutlined style={{ fontSize: 18, color: "#475569" }} />
                <Text strong style={{ fontSize: 15, color: "#1a1a2e" }}>
                  {payout.bankCode || "--"} - **** {payout.accountNumber?.slice(-4) || "----"}
                </Text>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                Chủ TK: {payout.accountHolderName || "--"}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>
                * Vui lòng đối chiếu mã định danh trước khi xác nhận chuyển khoản thủ công.
              </div>
              {payout.bankTransactionRef && payout.status !== "REQUESTED" && (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>
                  Mã GD: <Text code>{payout.bankTransactionRef}</Text>
                </div>
              )}
              {(payout as any).proofImageUrl && payout.status !== "REQUESTED" && (
                <div style={{ marginTop: 8 }}>
                  <a href={(payout as any).proofImageUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#1677ff", textDecoration: "underline" }}>
                    Xem biên lai chuyển khoản đính kèm
                  </a>
                </div>
              )}
            </div>

            {(payout.status === "REQUESTED" || payout.status === "PROCESSING") && (
              <div style={{ marginTop: 20 }}>
                <Text strong style={{ fontSize: 14 }}>Thông tin chuyển khoản (Dành cho Admin)</Text>
                <div style={{ marginTop: 8, display: "flex", gap: 12, flexDirection: "column" }}>
                  <Input
                    placeholder="Nhập Mã giao dịch ngân hàng (Bắt buộc khi duyệt)"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    style={{ borderRadius: 8 }}
                    prefix={<BankOutlined style={{ color: "#bfbfbf" }} />}
                  />
                  <Input
                    placeholder="Đường dẫn ảnh chụp UNC / Biên lai (Không bắt buộc)"
                    value={proofImage}
                    onChange={(e) => setProofImage(e.target.value)}
                    style={{ borderRadius: 8 }}
                    prefix={<LinkOutlined style={{ color: "#bfbfbf" }} />}
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <Text strong style={{ fontSize: 14 }}>Ghi chú nội bộ / Lý do từ chối</Text>
              <TextArea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Nhập ghi chú hoặc lý do nếu từ chối yêu cầu này..."
                style={{ marginTop: 8, borderRadius: 8 }}
              />
            </div>

            {(payout.status === "REQUESTED" || payout.status === "PROCESSING") ? (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                <Button onClick={onClose} style={{ borderRadius: 8, height: 40 }} disabled={isUpdating}>
                  Để sau
                </Button>
                <Button danger style={{ borderRadius: 8, height: 40, minWidth: 100 }} onClick={handleReject} loading={isUpdating}>
                  Từ chối
                </Button>
                <Button type="primary" style={{ borderRadius: 8, height: 40, minWidth: 100, background: "#2DD4A8", borderColor: "#2DD4A8" }} onClick={handleApprove} loading={isUpdating}>
                  Duyệt chi
                </Button>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f0f0f0" }}>
                <Button onClick={onClose} style={{ borderRadius: 8, height: 40 }}>
                  Đóng
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};
