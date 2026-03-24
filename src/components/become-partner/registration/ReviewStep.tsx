"use client";

import { useState, useMemo } from "react";
import { Button, Checkbox, Tag } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CreditCardOutlined,
  EditOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { bankOptions, type RegistrationFormData } from "./registrationData";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewStepProps {
  formData: RegistrationFormData;
  onSubmit: () => void;
  onGoToStep: (step: number) => void;
}

export default function ReviewStep({ formData, onSubmit, onGoToStep }: ReviewStepProps) {
  const { user } = useAuth();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeNotifications, setAgreeNotifications] = useState(false);

  const { personal, verification, bank } = formData;

  const bankLabel = useMemo(() => {
    const found = bankOptions.find((b) => b.value === bank.bankCode);
    return found?.label || bank.bankCode;
  }, [bank.bankCode]);

  const frontUrl = useMemo(() => (verification.frontCCCD ? URL.createObjectURL(verification.frontCCCD) : null), [verification.frontCCCD]);
  const backUrl = useMemo(() => (verification.backCCCD ? URL.createObjectURL(verification.backCCCD) : null), [verification.backCCCD]);
  const selfieUrl = useMemo(() => (verification.selfie ? URL.createObjectURL(verification.selfie) : null), [verification.selfie]);

  const EditBtn = ({ step }: { step: number }) => (
    <button
      className="bg-transparent border-none text-[#1890ff] text-[13px] font-medium cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-blue-50"
      onClick={() => onGoToStep(step)}
    >
      <EditOutlined /> Chỉnh sửa
    </button>
  );

  const InfoItem = ({ label, value, fullWidth }: { label: string; value: React.ReactNode; fullWidth?: boolean }) => (
    <div className={`flex flex-col gap-1 ${fullWidth ? "col-span-full" : ""}`}>
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* Left Column */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kiểm tra lại hồ sơ</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vui lòng xem lại tất cả thông tin bạn đã cung cấp trước khi gửi hồ sơ để chúng tôi xét duyệt.
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-lg text-[#1890ff]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">Thông tin tài khoản</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Email đăng ký" value={user?.email || "nguyen.van.a@example.com"} />
            <InfoItem label="Mật khẩu" value="••••••••••" />
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-lg text-[#1890ff]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">Thông tin cá nhân & Liên hệ</h3>
            </div>
            <EditBtn step={0} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <InfoItem label="Họ và tên" value={personal.fullName} />
            <InfoItem label="Số điện thoại" value={personal.phone} />
            <InfoItem label="Loại tài khoản" value={<Tag color="blue">{personal.accountType === "personal" ? "Cá nhân" : "Doanh nghiệp"}</Tag>} />
            <InfoItem label="Địa chỉ thường trú" value={`${personal.addressDetail}, ${personal.district}, ${personal.province}`} />
          </div>
        </div>

        {/* KYC */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <SafetyCertificateOutlined className="text-lg text-[#1890ff]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">Xác minh danh tính (KYC)</h3>
            </div>
            <EditBtn step={1} />
          </div>
          <div className="flex gap-4 flex-wrap">
            {[
              { url: frontUrl, label: "Mặt trước CCCD", icon: <SafetyCertificateOutlined /> },
              { url: backUrl, label: "Mặt sau CCCD", icon: <SafetyCertificateOutlined /> },
              { url: selfieUrl, label: "Ảnh chân dung", icon: <UserOutlined /> },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="w-[140px] h-[100px] rounded-[10px] bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center relative overflow-hidden">
                  {item.url ? (
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover rounded-[10px]" />
                  ) : (
                    <span className="text-3xl text-white/60">{item.icon}</span>
                  )}
                  {item.url && (
                    <div className="absolute top-2 right-2 w-[22px] h-[22px] rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                      <CheckCircleOutlined />
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CreditCardOutlined className="text-lg text-[#1890ff]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">Thông tin nhận thanh toán</h3>
            </div>
            <EditBtn step={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <InfoItem label="Chủ tài khoản" value={bank.accountHolder} />
            <InfoItem label="Tên ngân hàng" value={bankLabel} />
            <InfoItem label="Số tài khoản" value={bank.accountNumber} />
            <InfoItem label="Chi nhánh" value={bank.branch || "—"} />
            <InfoItem label="Loại tiền tệ" value={bank.currency} fullWidth />
          </div>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="flex flex-col gap-5 sticky top-[100px] max-lg:static">
        {/* Confirm & Commit */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <CheckCircleOutlined className="text-lg text-[#1890ff]" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Xác nhận & Cam kết</h4>
          </div>
          <div className="flex flex-col gap-3 mb-4">
            <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}>
              <span className="text-[13px] text-gray-700 leading-relaxed">
                Tôi đồng ý với{" "}
                <a href="/" className="text-[#1890ff] font-medium no-underline hover:underline">Điều khoản Dịch vụ</a>{" "}
                cho Chủ nhà của HomestayBooking.
              </span>
            </Checkbox>
            <Checkbox checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)}>
              <span className="text-[13px] text-gray-700 leading-relaxed">
                Tôi đã đọc và hiểu{" "}
                <a href="/" className="text-[#1890ff] font-medium no-underline hover:underline">Chính sách Bảo mật</a>{" "}
                về việc thu thập và xử lý dữ liệu cá nhân.
              </span>
            </Checkbox>
            <Checkbox checked={agreeNotifications} onChange={(e) => setAgreeNotifications(e.target.checked)}>
              <span className="text-[13px] text-gray-700 leading-relaxed">
                Nhận thông báo về trang thái hồ sơ và cập nhật quan trọng từ hệ thống qua Email/SMS.
              </span>
            </Checkbox>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-100 rounded-lg mb-4">
            <ClockCircleOutlined className="text-sm text-[#1890ff] shrink-0" />
            <span className="text-xs text-[#1890ff] font-medium">
              Thời gian xét duyệt dự kiến: 24 - 48 giờ làm việc.
            </span>
          </div>

          <div className="flex flex-col gap-2.5 mb-3">
            <Button
              type="primary"
              block
              size="large"
              className="!rounded-[10px] !font-semibold !h-11 !bg-[#1890ff] !border-[#1890ff]"
              disabled={!agreeTerms || !agreePrivacy}
              onClick={onSubmit}
            >
              Gửi hồ sơ để duyệt
            </Button>
            <Button block size="large" className="!rounded-[10px] !font-medium !h-11 !text-gray-600 !border-gray-300">
              Lưu tạm & Hoàn tất sau
            </Button>
          </div>

          <p className="text-[11px] text-gray-400 text-center m-0 leading-relaxed">
            Bằng cách nhấn &quot;Gửi hồ sơ&quot;, bạn cam kết các thông tin cung cấp là hoàn toàn chính xác và trung thực.
          </p>
        </div>

        {/* Help */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <QuestionCircleOutlined className="text-lg text-amber-400" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Cần hỗ trợ?</h4>
          </div>
          <ul className="list-none p-0 m-0">
            {[
              'Hồ sơ bị từ chối sẽ được gửi kèm lý do chi tiết.',
              'Bạn có thể cập nhật thông tin sau khi hồ sơ được duyệt.',
              'Liên hệ hỗ trợ: 1900 1234 (8:00 - 22:00).',
            ].map((tip, i) => (
              <li key={i} className="text-[13px] text-gray-600 leading-relaxed py-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#1890ff] before:font-bold">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
