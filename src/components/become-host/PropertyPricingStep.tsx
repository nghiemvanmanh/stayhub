"use client";

import { InputNumber, Select, Switch } from "antd";
import {
  DollarOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import { cancellationPolicyOptions, type PropertyPricingData, type RentalTypeItem } from "./registrationData";

interface PropertyPricingStepProps {
  data: PropertyPricingData;
  onChange: (data: Partial<PropertyPricingData>) => void;
  rentalTypeId: number | null;
  rentalTypes: RentalTypeItem[];
}

export default function PropertyPricingStep({ data, onChange, rentalTypeId, rentalTypes }: PropertyPricingStepProps) {
  const isPrivateRoom = rentalTypes.find(r => r.id === rentalTypeId)?.name.toLowerCase() === "theo phòng riêng" || rentalTypes.find(r => r.id === rentalTypeId)?.slug === "private-room";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Giá & Chính sách</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Thiết lập giá cho thuê và các chính sách thanh toán, hủy phòng phù hợp.
          </p>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Bảng giá</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className={`grid grid-cols-1 ${!isPrivateRoom ? "sm:grid-cols-2" : ""} gap-4`}>
              {!isPrivateRoom && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">
                    Giá mỗi đêm (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    size="large"
                    min={0}
                    step={50000}
                    value={data.pricePerNight}
                    onChange={(v) => onChange({ pricePerNight: v || 0 })}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => Number(value?.replace(/,/g, "") || 0)}
                    className="!w-full"
                    placeholder="500,000"
                  />
                  <span className="text-xs text-gray-400">Giá cơ bản cho ngày thường</span>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Phụ thu cuối tuần (%)
                </label>
                <InputNumber
                  size="large"
                  min={0}
                  max={100}
                  value={data.weekendSurchargePercentage}
                  onChange={(v) => onChange({ weekendSurchargePercentage: v || 0 })}
                  formatter={(value) => `${value}%`}
                  parser={(value) => Number(value?.replace("%", "") || 0)}
                  className="!w-full"
                  placeholder="20"
                />
                <span className="text-xs text-gray-400">Áp dụng thêm cho Thứ 6, 7, CN</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                Phí dọn dẹp (VNĐ)
              </label>
              <InputNumber
                size="large"
                min={0}
                step={50000}
                value={data.cleaningFee}
                onChange={(v) => onChange({ cleaningFee: v || 0 })}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => Number(value?.replace(/,/g, "") || 0)}
                className="!w-full sm:!w-1/2"
                placeholder="200,000"
              />
              <span className="text-xs text-gray-400">Phí dịch vụ dọn dẹp sau khi trả phòng (0 = miễn phí)</span>
            </div>
          </div>
        </div>

        {/* Payment & Deposit */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <PercentageOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Thanh toán & Đặt cọc</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900 m-0">Cho phép thanh toán khi nhận phòng</p>
                <p className="text-xs text-gray-400 m-0 mt-1">Khách có thể trả tiền trực tiếp khi check-in</p>
              </div>
              <Switch
                checked={data.isPayAtCheckinAllowed}
                onChange={(v) => onChange({ isPayAtCheckinAllowed: v })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                Tỉ lệ đặt cọc (%)
              </label>
              <InputNumber
                size="large"
                min={0}
                max={100}
                value={data.depositPercentage}
                onChange={(v) => onChange({ depositPercentage: v || 0 })}
                formatter={(value) => `${value}%`}
                parser={(value) => Number(value?.replace("%", "") || 0)}
                className="!w-full sm:!w-1/2"
              />
              <span className="text-xs text-gray-400">
                Phần trăm tổng giá trị đơn hàng khách cần đặt cọc trước
              </span>
            </div>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <SafetyCertificateOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Chính sách hủy phòng <span className="text-red-500">*</span></h3>
          </div>
          <div className="flex flex-col gap-3">
            {cancellationPolicyOptions.map((policy) => {
              const isSelected = data.cancellationPolicyId === policy.value;
              return (
                <div
                  key={policy.value}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#2DD4A8] bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-[#2DD4A8]"
                  }`}
                  onClick={() => onChange({ cancellationPolicyId: policy.value })}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? "border-[#2DD4A8]" : "border-gray-300"
                    }`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#2DD4A8]" />}
                    </div>
                    <span className={`text-sm ${isSelected ? "font-semibold text-[#2DD4A8]" : "font-medium text-gray-700"}`}>
                      {policy.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-5 sticky top-[100px] max-lg:static">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <BulbOutlined className="text-lg text-amber-400" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Mẹo đặt giá</h4>
          </div>
          <ul className="list-none p-0 m-0">
            {[
              'Tham khảo giá các cơ sở tương tự trong khu vực.',
              'Phụ thu cuối tuần 10-30% là mức phổ biến.',
              'Chính sách "Linh hoạt" thu hút nhiều khách hơn.',
              'Đặt cọc 30-50% giúp giảm rủi ro hủy phòng.',
              'Cho phép thanh toán khi nhận phòng tăng khả năng đặt phòng.',
            ].map((tip, i) => (
              <li key={i} className="text-[13px] text-gray-600 leading-relaxed py-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#2DD4A8] before:font-bold">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
