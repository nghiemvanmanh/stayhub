"use client";

import React, { useState } from "react";
import {
  Avatar,
  Input,
  Button,
  Switch,
  Select,
  Divider,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  SafetyOutlined,
  EditOutlined,
  CheckCircleFilled,
  PhoneOutlined,
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
import { useAuth } from "@/contexts/AuthContext";

export default function HostSettings() {
  const { user } = useAuth();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSms, setNotifSms] = useState(false);
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  return (
    <div className="max-w-[900px]">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 m-0">
          Cài đặt tài khoản
        </h1>
        <p className="text-sm text-gray-500 mt-1 m-0">
          Quản lý thông tin hồ sơ, bảo mật và tuỳ chọn cá nhân của bạn.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── Profile Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2DD4A8]/10 to-[#22b892]/5 px-6 py-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative">
                <Avatar
                  size={80}
                  src={user?.avatarUrl}
                  icon={<UserOutlined />}
                  className="border-4 border-white shadow-md"
                />
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#2DD4A8] text-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer shadow-sm">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-900 m-0">
                  {user?.fullName || "Chủ nhà"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5 m-0">
                  {user?.email || "email@example.com"}
                </p>
                <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-1 bg-[#E6FAF5] text-[#2DD4A8] text-xs font-semibold px-2.5 py-1 rounded-full">
                    <CheckCircleFilled /> Host đã xác minh
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Personal Info ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 m-0">
              Thông tin cá nhân
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Họ và tên
              </label>
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                value={user?.fullName || ""}
                readOnly
                className="!rounded-lg !bg-gray-50"
                size="large"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                value={user?.email || ""}
                readOnly
                className="!rounded-lg !bg-gray-50"
                size="large"
              />
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-3 m-0">
            Để thay đổi thông tin cá nhân, vui lòng liên hệ bộ phận hỗ trợ.
          </p>
        </div>

        {/* ── Security ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 m-0">
              Bảo mật
            </h3>
          </div>

          <div className="space-y-4">
            {/* Change password */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                  <KeyRound className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 m-0">
                    Mật khẩu
                  </p>
                  <p className="text-xs text-gray-400 m-0">
                    Đổi mật khẩu đăng nhập của bạn
                  </p>
                </div>
              </div>
              <Button
                className="!rounded-lg !h-9 !px-4 !text-sm !font-medium !border-gray-200"
                onClick={() => message.info("Tính năng đang phát triển")}
              >
                Đổi mật khẩu
              </Button>
            </div>

            {/* Two-factor auth */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                  <Smartphone className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 m-0">
                    Xác thực 2 lớp
                  </p>
                  <p className="text-xs text-gray-400 m-0">
                    Bảo vệ tài khoản bằng mã OTP qua điện thoại
                  </p>
                </div>
              </div>
              <Switch
                className="!bg-gray-300"
                onChange={() => message.info("Tính năng đang phát triển")}
              />
            </div>
          </div>
        </div>

        {/* ── Notifications ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 m-0">
              Thông báo
            </h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 m-0">
                    Thông báo qua Email
                  </p>
                  <p className="text-xs text-gray-400 m-0">
                    Nhận thông báo đặt phòng, thanh toán qua email
                  </p>
                </div>
              </div>
              <Switch
                checked={notifEmail}
                onChange={setNotifEmail}
                className={notifEmail ? "!bg-[#2DD4A8]" : "!bg-gray-300"}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 m-0">
                    Thông báo qua SMS
                  </p>
                  <p className="text-xs text-gray-400 m-0">
                    Nhận tin nhắn SMS cho đặt phòng mới
                  </p>
                </div>
              </div>
              <Switch
                checked={notifSms}
                onChange={setNotifSms}
                className={notifSms ? "!bg-[#2DD4A8]" : "!bg-gray-300"}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 m-0">
                    Cập nhật đặt phòng
                  </p>
                  <p className="text-xs text-gray-400 m-0">
                    Thông báo check-in, check-out, hủy phòng
                  </p>
                </div>
              </div>
              <Switch
                checked={notifBooking}
                onChange={setNotifBooking}
                className={notifBooking ? "!bg-[#2DD4A8]" : "!bg-gray-300"}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 m-0">
                    Khuyến mãi & Tin tức
                  </p>
                  <p className="text-xs text-gray-400 m-0">
                    Nhận thông tin ưu đãi và cập nhật từ StayHub
                  </p>
                </div>
              </div>
              <Switch
                checked={notifPromo}
                onChange={setNotifPromo}
                className={notifPromo ? "!bg-[#2DD4A8]" : "!bg-gray-300"}
              />
            </div>
          </div>
        </div>

        {/* ── Language & Timezone ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-purple-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 m-0">
              Ngôn ngữ & Múi giờ
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Ngôn ngữ
              </label>
              <Select
                defaultValue="vi"
                className="w-full !rounded-lg"
                size="large"
                options={[
                  { value: "vi", label: "🇻🇳 Tiếng Việt" },
                  { value: "en", label: "🇺🇸 English" },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Múi giờ
              </label>
              <Select
                defaultValue="asia-hcm"
                className="w-full !rounded-lg"
                size="large"
                options={[
                  { value: "asia-hcm", label: "🕐 UTC+7 (Hồ Chí Minh)" },
                  { value: "asia-hn", label: "🕐 UTC+7 (Hà Nội)" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* ── Danger Zone ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-red-100 p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <SafetyOutlined className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-red-600 m-0">
              Vùng nguy hiểm
            </h3>
          </div>
          <p className="text-sm text-gray-500 mb-4 m-0">
            Các hành động dưới đây có thể ảnh hưởng đến tài khoản và dữ liệu của bạn.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              danger
              className="!rounded-lg !h-9 !px-4 !text-sm !font-medium"
              onClick={() => message.info("Vui lòng liên hệ CSKH để vô hiệu hoá tài khoản.")}
            >
              Vô hiệu hoá tài khoản
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
