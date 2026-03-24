"use client";

import { useMemo } from "react";
import { Input, Select, Button } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  BulbOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { provinceData, type PersonalInfoData } from "./registrationData";

interface PersonalInfoStepProps {
  data: PersonalInfoData;
  onChange: (data: Partial<PersonalInfoData>) => void;
}

export default function PersonalInfoStep({
  data,
  onChange,
}: PersonalInfoStepProps) {
  const provinceOptions = useMemo(
    () => Object.keys(provinceData).map((p) => ({ value: p, label: p })),
    []
  );

  const districtOptions = useMemo(() => {
    if (!data.province) return [];
    return (provinceData[data.province] || []).map((d) => ({ value: d, label: d }));
  }, [data.province]);

  const handleProvinceChange = (value: string) => {
    onChange({ province: value, district: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* Left Column */}
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vui lòng cung cấp thông tin chính xác theo giấy tờ tùy thân để
            chúng tôi có thể xác minh tài khoản của bạn nhanh nhất.
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <UserOutlined className="text-lg text-[#1890ff]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Thông tin cơ bản</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                Họ và tên (như trên CCCD) <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="Ví dụ: Nguyễn Văn A"
                prefix={<UserOutlined className="text-gray-300" />}
                value={data.fullName}
                onChange={(e) => onChange({ fullName: e.target.value })}
              />
              <span className="text-xs text-gray-400 mt-0.5">
                Sử dụng tên thật để thuận tiện cho việc đối soát thanh toán sau này.
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <Input
                  size="large"
                  placeholder="090 123 4567"
                  prefix={<PhoneOutlined className="text-gray-300" />}
                  value={data.phone}
                  onChange={(e) => onChange({ phone: e.target.value })}
                  className="flex-1"
                />
                <Button
                  type="primary"
                  className="min-w-[120px] h-10 font-semibold !rounded-lg !bg-[#1890ff] !border-[#1890ff]"
                >
                  Gửi mã OTP
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Account Type */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <HomeOutlined className="text-lg text-[#1890ff]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Loại tài khoản</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                data.accountType === "personal"
                  ? "border-[#1890ff] bg-blue-50 shadow-[0_2px_12px_rgba(24,144,255,0.15)]"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
              }`}
              onClick={() => onChange({ accountType: "personal" })}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-xl ${
                  data.accountType === "personal" ? "bg-[#1890ff] text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                <TeamOutlined />
              </div>
              <h4 className="text-[15px] font-semibold text-gray-900 mb-1">Cá nhân</h4>
              <p className="text-xs text-gray-400 m-0 leading-relaxed">
                Dành cho chủ nhà tự quản lý homestay của mình.
              </p>
            </div>
            <div
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                data.accountType === "business"
                  ? "border-[#1890ff] bg-blue-50 shadow-[0_2px_12px_rgba(24,144,255,0.15)]"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
              }`}
              onClick={() => onChange({ accountType: "business" })}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-xl ${
                  data.accountType === "business" ? "bg-[#1890ff] text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                <BankOutlined />
              </div>
              <h4 className="text-[15px] font-semibold text-gray-900 mb-1">Doanh nghiệp</h4>
              <p className="text-xs text-gray-400 m-0 leading-relaxed">
                Dành cho công ty, hộ kinh doanh có pháp nhân.
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <EnvironmentOutlined className="text-lg text-[#1890ff]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Địa chỉ thường trú</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Tỉnh / Thành phố <span className="text-red-500">*</span>
                </label>
                <Select
                  size="large"
                  placeholder="Chọn tỉnh/thành phố"
                  options={provinceOptions}
                  value={data.province || undefined}
                  onChange={handleProvinceChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Quận / Huyện <span className="text-red-500">*</span>
                </label>
                <Select
                  size="large"
                  placeholder="Chọn quận/huyện"
                  options={districtOptions}
                  value={data.district || undefined}
                  onChange={(v) => onChange({ district: v })}
                  disabled={!data.province}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                Địa chỉ chi tiết <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="Số nhà, tên đường, phường/xã"
                value={data.addressDetail}
                onChange={(e) => onChange({ addressDetail: e.target.value })}
              />
            </div>
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
              'Dùng tên thật trùng khớp trên CCCD/Hộ chiếu để việc xác minh danh tính ở bước sau diễn ra suôn sẻ.',
              'Số điện thoại này sẽ được dùng để nhận mã xác thực (OTP) và các thông báo quan trọng về đặt phòng.',
              'Nếu bạn đại diện cho một công ty hoặc chuỗi homestay, hãy chọn "Doanh nghiệp" để nhận hóa đơn VAT.',
              'Thông tin địa chỉ giúp chúng tôi xác định khu vực hoạt động của bạn và hỗ trợ pháp lý tốt hơn.',
              'Hãy đảm bảo mã OTP được nhập chính xác ngay sau khi nhận được tin nhắn.',
            ].map((tip, i) => (
              <li
                key={i}
                className="text-[13px] text-gray-600 leading-relaxed py-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#1890ff] before:font-bold"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <SafetyCertificateOutlined className="text-lg text-[#1890ff]" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Tại sao phải xác minh?</h4>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed m-0">
            HomestayBooking cam kết tạo ra một cộng đồng an toàn. Thông tin của
            bạn được bảo mật tuyệt đối và chỉ dùng cho mục đích xác thực danh
            tính vật lý.
          </p>
        </div>
      </div>
    </div>
  );
}
