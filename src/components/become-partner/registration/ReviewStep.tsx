"use client";

import { useState, useMemo } from "react";
import { Button, Checkbox } from "antd";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import type { RegistrationFormData } from "./registrationData";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewStepProps {
  formData: RegistrationFormData;
  onSubmit: () => void;
  onGoToStep: (step: number) => void;
  submitting?: boolean;
}

export default function ReviewStep({ formData, onSubmit, onGoToStep, submitting }: ReviewStepProps) {
  const { user } = useAuth();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const { personal, verification } = formData;

  const frontUrl = useMemo(() => (verification.frontCCCD ? URL.createObjectURL(verification.frontCCCD) : null), [verification.frontCCCD]);
  const backUrl = useMemo(() => (verification.backCCCD ? URL.createObjectURL(verification.backCCCD) : null), [verification.backCCCD]);
  const licenseUrl = useMemo(() => (verification.businessLicense ? URL.createObjectURL(verification.businessLicense) : null), [verification.businessLicense]);

  const EditBtn = ({ step }: { step: number }) => (
    <button
      className="bg-transparent border-none text-[#1890ff] text-[13px] font-medium cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-blue-50"
      onClick={() => onGoToStep(step)}
    >
      <EditOutlined /> Chỉnh sửa
    </button>
  );

  const InfoItem = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-2">
      {icon && <span className="text-gray-400 mt-0.5">{icon}</span>}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm text-gray-900 font-medium">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* Left Column */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kiểm tra lại hồ sơ</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vui lòng xem lại tất cả thông tin trước khi gửi hồ sơ đăng ký đối tác.
          </p>
        </div>

        {/* Account Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-lg text-[#1890ff]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">Tài khoản đăng nhập</h3>
            </div>
          </div>
          <InfoItem label="Email đăng nhập" value={user?.email || "—"} icon={<MailOutlined />} />
        </div>

        {/* Contact Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MailOutlined className="text-lg text-[#1890ff]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">Thông tin liên hệ & Định danh</h3>
            </div>
            <EditBtn step={0} />
          </div>
          <div className="flex flex-col divide-y divide-gray-50">
            <InfoItem label="Email CSKH" value={personal.supportEmail} icon={<MailOutlined />} />
            <InfoItem label="Số điện thoại kinh doanh" value={personal.businessPhone} icon={<PhoneOutlined />} />
            <InfoItem label="Số CCCD / CMND" value={personal.identityCardNumber} icon={<IdcardOutlined />} />
          </div>
        </div>

        {/* KYC & Business License */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <SafetyCertificateOutlined className="text-lg text-[#1890ff]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">Xác minh & Giấy phép</h3>
            </div>
            <EditBtn step={1} />
          </div>

          {/* Business License Number */}
          <InfoItem label="Số giấy phép kinh doanh" value={verification.businessLicenseNumber} icon={<FileProtectOutlined />} />

          {/* File Previews */}
          <div className="flex gap-4 flex-wrap mt-4">
            {[
              { url: frontUrl, label: "Mặt trước CCCD", icon: <IdcardOutlined /> },
              { url: backUrl, label: "Mặt sau CCCD", icon: <IdcardOutlined /> },
              { url: licenseUrl, label: "Giấy phép KD", icon: <FileProtectOutlined /> },
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
              disabled={!agreeTerms || !agreePrivacy || submitting}
              onClick={onSubmit}
              loading={submitting}
            >
              {submitting ? "Đang gửi hồ sơ..." : "Gửi hồ sơ để duyệt"}
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
