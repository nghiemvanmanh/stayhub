"use client";

import React, { useState } from "react";
import {
  Avatar,
  Input,
  Button,
  Switch,
  Select,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  SafetyOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import {
  Shield,
  Bell,
  Globe,
  KeyRound,
  Smartphone,
  Mail,
  User,
  Camera,
} from "lucide-react";
import { PageContainer, ProCard } from "@ant-design/pro-components";
import { useAuth } from "@/contexts/AuthContext";

export default function HostSettings() {
  const { user } = useAuth();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  return (
    <PageContainer
      header={{
        title: "Cài đặt tài khoản",
        subTitle: "Quản lý thông tin hồ sơ, bảo mật và tuỳ chọn cá nhân của bạn.",
      }}
    >
      <div style={{ maxWidth: 900 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Profile Card */}
          <ProCard bordered style={{ borderRadius: 16, overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(to right, rgba(45,212,168,0.1), rgba(34,184,146,0.05))", padding: "20px 24px" }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative" }}>
                  <Avatar size={80} src={user?.avatarUrl} icon={<UserOutlined />} style={{ border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                  <button style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: "#2DD4A8", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>{user?.fullName || "Chủ nhà"}</h2>
                  <p style={{ fontSize: 14, color: "#64748b", marginTop: 2, marginBottom: 0 }}>{user?.email || "email@example.com"}</p>
                  <div style={{ marginTop: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#E6FAF5", color: "#2DD4A8", fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>
                      <CheckCircleFilled /> Host đã xác minh
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ProCard>

          {/* Personal Info */}
          <ProCard
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, background: "#eff6ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User className="w-4 h-4 text-blue-500" />
                </div>
                <span style={{ fontWeight: 700 }}>Thông tin cá nhân</span>
              </div>
            }
            bordered
            headerBordered
            style={{ borderRadius: 16 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Họ và tên</label>
                <Input prefix={<UserOutlined style={{ color: "#94a3b8" }} />} value={user?.fullName || ""} readOnly style={{ borderRadius: 8, background: "#f8fafc" }} size="large" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Email</label>
                <Input prefix={<MailOutlined style={{ color: "#94a3b8" }} />} value={user?.email || ""} readOnly style={{ borderRadius: 8, background: "#f8fafc" }} size="large" />
              </div>
            </div>
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 12, marginBottom: 0 }}>
              Để thay đổi thông tin cá nhân, vui lòng liên hệ bộ phận hỗ trợ.
            </p>
          </ProCard>

          {/* Security */}
          <ProCard
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, background: "#fef2f2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield className="w-4 h-4 text-red-500" />
                </div>
                <span style={{ fontWeight: 700 }}>Bảo mật</span>
              </div>
            }
            bordered
            headerBordered
            style={{ borderRadius: 16 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "#f8fafc", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                    <KeyRound className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", margin: 0 }}>Mật khẩu</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Đổi mật khẩu đăng nhập của bạn</p>
                  </div>
                </div>
                <Button style={{ borderRadius: 8 }} onClick={() => message.info("Tính năng đang phát triển")}>Đổi mật khẩu</Button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "#f8fafc", borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                    <Smartphone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", margin: 0 }}>Xác thực 2 lớp</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>Bảo vệ tài khoản bằng mã OTP qua điện thoại</p>
                  </div>
                </div>
                <Switch className="!bg-gray-300" onChange={() => message.info("Tính năng đang phát triển")} />
              </div>
            </div>
          </ProCard>

          {/* Notifications */}
          <ProCard
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, background: "#fffbeb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bell className="w-4 h-4 text-amber-500" />
                </div>
                <span style={{ fontWeight: 700 }}>Thông báo</span>
              </div>
            }
            bordered
            headerBordered
            style={{ borderRadius: 16 }}
          >
            {[
              { icon: <Mail className="w-4 h-4 text-gray-400" />, title: "Thông báo qua Email", desc: "Nhận thông báo đặt phòng, thanh toán qua email", checked: notifEmail, onChange: setNotifEmail },
              { icon: <Smartphone className="w-4 h-4 text-gray-400" />, title: "Thông báo qua SMS", desc: "Nhận tin nhắn SMS cho đặt phòng mới", checked: notifSms, onChange: setNotifSms },
              { icon: <Bell className="w-4 h-4 text-gray-400" />, title: "Cập nhật đặt phòng", desc: "Thông báo check-in, check-out, hủy phòng", checked: notifBooking, onChange: setNotifBooking },
              { icon: <Mail className="w-4 h-4 text-gray-400" />, title: "Khuyến mãi & Tin tức", desc: "Nhận thông tin ưu đãi và cập nhật từ StayHub", checked: notifPromo, onChange: setNotifPromo },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 3 ? "1px solid #f8fafc" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {item.icon}
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#1a1a2e", margin: 0 }}>{item.title}</p>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
                <Switch checked={item.checked} onChange={item.onChange} className={item.checked ? "!bg-[#2DD4A8]" : "!bg-gray-300"} />
              </div>
            ))}
          </ProCard>

          {/* Language & Timezone */}
          <ProCard
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, background: "#faf5ff", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Globe className="w-4 h-4 text-purple-500" />
                </div>
                <span style={{ fontWeight: 700 }}>Ngôn ngữ & Múi giờ</span>
              </div>
            }
            bordered
            headerBordered
            style={{ borderRadius: 16 }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Ngôn ngữ</label>
                <Select defaultValue="vi" className="w-full" size="large" options={[{ value: "vi", label: "🇻🇳 Tiếng Việt" }, { value: "en", label: "🇺🇸 English" }]} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Múi giờ</label>
                <Select defaultValue="asia-hcm" className="w-full" size="large" options={[{ value: "asia-hcm", label: "🕐 UTC+7 (Hồ Chí Minh)" }, { value: "asia-hn", label: "🕐 UTC+7 (Hà Nội)" }]} />
              </div>
            </div>
          </ProCard>

          {/* Danger Zone */}
          <ProCard
            title={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 32, height: 32, background: "#fef2f2", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SafetyOutlined style={{ color: "#ef4444" }} />
                </div>
                <span style={{ fontWeight: 700, color: "#dc2626" }}>Vùng nguy hiểm</span>
              </div>
            }
            bordered
            headerBordered
            style={{ borderRadius: 16, borderColor: "#fecaca" }}
          >
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 16, marginTop: 0 }}>
              Các hành động dưới đây có thể ảnh hưởng đến tài khoản và dữ liệu của bạn.
            </p>
            <Button danger style={{ borderRadius: 8 }} onClick={() => message.info("Vui lòng liên hệ CSKH để vô hiệu hoá tài khoản.")}>
              Vô hiệu hoá tài khoản
            </Button>
          </ProCard>
        </div>
      </div>
    </PageContainer>
  );
}
