"use client";

import { Input } from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  BulbOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import type { PersonalInfoData } from "./registrationData";

interface PersonalInfoStepProps {
  data: PersonalInfoData;
  onChange: (data: Partial<PersonalInfoData>) => void;
}

export default function PersonalInfoStep({
  data,
  onChange,
}: PersonalInfoStepProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* Left Column */}
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin liên hệ</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vui lòng cung cấp thông tin liên hệ chính xác để chúng tôi có thể xác minh
            và hỗ trợ bạn trong quá trình vận hành homestay.
          </p>
        </div>

        {/* Contact Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <MailOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Thông tin liên hệ</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                Email CSKH <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="Ví dụ: cskh@homestay.vn"
                prefix={<MailOutlined className="text-gray-300" />}
                value={data.supportEmail}
                onChange={(e) => onChange({ supportEmail: e.target.value })}
              />
              <span className="text-xs text-gray-400 mt-0.5">
                Email này sẽ được dùng để liên hệ hỗ trợ khách hàng và nhận thông báo đặt phòng.
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                Số điện thoại kinh doanh <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="090 123 4567"
                prefix={<PhoneOutlined className="text-gray-300" />}
                value={data.businessPhone}
                onChange={(e) => onChange({ businessPhone: e.target.value })}
              />
              <span className="text-xs text-gray-400 mt-0.5">
                Số điện thoại này để khách hàng và đội ngũ hỗ trợ liên hệ khi cần.
              </span>
            </div>
          </div>
        </div>

        {/* Identity Card Number */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <IdcardOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Thông tin định danh</h3>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">
              Số CCCD / CMND <span className="text-red-500">*</span>
            </label>
            <Input
              size="large"
              placeholder="Nhập số CCCD (12 chữ số)"
              prefix={<IdcardOutlined className="text-gray-300" />}
              value={data.identityCardNumber}
              onChange={(e) => onChange({ identityCardNumber: e.target.value })}
              maxLength={12}
            />
            <span className="text-xs text-gray-400 mt-0.5">
              Số CCCD dùng để xác minh danh tính khi đối chiếu với ảnh CCCD ở bước sau.
            </span>
          </div>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="flex flex-col gap-5 sticky top-[100px] max-lg:static">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <BulbOutlined className="text-lg text-amber-400" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Mẹo hoàn thiện hồ sơ</h4>
          </div>
          <ul className="list-none p-0 m-0">
            {[
              'Email CSKH nên là email chuyên dụng cho homestay, không dùng email cá nhân.',
              'Số điện thoại kinh doanh sẽ hiển thị cho khách hàng khi cần liên hệ.',
              'Số CCCD phải trùng khớp với ảnh CCCD bạn tải lên ở bước xác minh.',
              'Đảm bảo CCCD còn hạn sử dụng ít nhất 3 tháng kể từ ngày đăng ký.',
            ].map((tip, i) => (
              <li
                key={i}
                className="text-[13px] text-gray-600 leading-relaxed py-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#2DD4A8] before:font-bold"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <SafetyCertificateOutlined className="text-lg text-[#2DD4A8]" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Tại sao phải xác minh?</h4>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed m-0">
            HomestayBooking cam kết tạo ra một cộng đồng an toàn. Thông tin của
            bạn được bảo mật tuyệt đối và chỉ dùng cho mục đích xác thực danh
            tính.
          </p>
        </div>
      </div>
    </div>
  );
}
