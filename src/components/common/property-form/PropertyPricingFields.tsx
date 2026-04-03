import { InputNumber, Switch } from "antd";
import { type PropertyPricingData, cancellationPolicyOptions } from "./propertyData";
import { FieldError } from "./FieldError";
import { type ValidationResult } from "@/constants/validation";

interface PropertyPricingFieldsProps {
  data: PropertyPricingData;
  onChange: (data: Partial<PropertyPricingData>) => void;
  errors: Record<string, ValidationResult | null>;
  touched: Record<string, boolean>;
  markTouched: (field: string) => void;
  isPrivateRoom: boolean;
}

export function PropertyPricingFields({
  data,
  onChange,
  errors,
  touched,
  markTouched,
  isPrivateRoom,
}: PropertyPricingFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 1. Base Pricing */}
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
                status={touched.pricePerNight && errors.pricePerNight && !errors.pricePerNight.isValid ? "error" : undefined}
                onChange={(v) => onChange({ pricePerNight: v ?? "" })}
                onBlur={() => markTouched("pricePerNight")}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => Number(value?.replace(/,/g, "") || 0)}
                className="!w-full"
                placeholder="500,000"
              />
              <FieldError error={touched.pricePerNight ? errors.pricePerNight : null} />
              {(!touched.pricePerNight || !errors.pricePerNight || errors.pricePerNight.isValid) && (
                <span className="text-xs text-gray-400">Giá cơ bản cho ngày thường</span>
              )}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">Phụ thu cuối tuần (%)</label>
            <InputNumber
              size="large"
              min={0}
              max={100}
              value={data.weekendSurchargePercentage}
              status={touched.weekendSurchargePercentage && errors.weekendSurchargePercentage && !errors.weekendSurchargePercentage.isValid ? "error" : undefined}
              onChange={(v) => onChange({ weekendSurchargePercentage: v ?? "" })}
              onBlur={() => markTouched("weekendSurchargePercentage")}
              formatter={(value) => `${value}%`}
              parser={(value) => Number(value?.replace("%", "") || 0)}
              className="!w-full"
              placeholder="20"
            />
            <FieldError error={touched.weekendSurchargePercentage ? errors.weekendSurchargePercentage : null} />
            {(!touched.weekendSurchargePercentage || !errors.weekendSurchargePercentage || errors.weekendSurchargePercentage.isValid) && (
              <span className="text-xs text-gray-400">Áp dụng thêm cho Thứ 6, 7, CN</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Phí dọn dẹp (VNĐ)</label>
          <InputNumber
            size="large"
            min={0}
            step={50000}
            value={data.cleaningFee}
            status={touched.cleaningFee && errors.cleaningFee && !errors.cleaningFee.isValid ? "error" : undefined}
            onChange={(v) => onChange({ cleaningFee: v ?? "" })}
            onBlur={() => markTouched("cleaningFee")}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => Number(value?.replace(/,/g, "") || 0)}
            className="!w-full sm:!w-1/2"
            placeholder="200,000"
          />
          <FieldError error={touched.cleaningFee ? errors.cleaningFee : null} />
          {(!touched.cleaningFee || !errors.cleaningFee || errors.cleaningFee.isValid) && (
            <span className="text-xs text-gray-400">Phí dịch vụ dọn dẹp sau khi trả phòng (0 = miễn phí)</span>
          )}
        </div>
      </div>

      <div className="w-full h-[1px] bg-gray-200 my-2" />

      {/* 2. Payment & Deposit */}
      <div className="flex flex-col gap-4">
        <label className="text-sm font-semibold text-gray-900">Thanh toán & Đặt cọc</label>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="pr-4">
            <p className="text-sm font-medium text-gray-900 m-0">Cho phép thanh toán khi nhận phòng</p>
            <p className="text-xs text-gray-400 m-0 mt-1">Khách có thể trả tiền trực tiếp khi check-in</p>
          </div>
          <Switch
            checked={data.isPayAtCheckinAllowed}
            onChange={(v) => onChange({ isPayAtCheckinAllowed: v })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Tỉ lệ đặt cọc (%)</label>
          <InputNumber
            size="large"
            min={0}
            max={100}
            value={data.depositPercentage}
            onChange={(v) => onChange({ depositPercentage: v ?? "" })}
            formatter={(value) => `${value}%`}
            parser={(value) => Number(value?.replace("%", "") || 0)}
            className="!w-full sm:!w-1/2"
          />
          <span className="text-xs text-gray-400">Phần trăm đặt cọc trước</span>
        </div>
      </div>

      <div className="w-full h-[1px] bg-gray-200 my-2" />

      {/* 3. Cancellation Policy */}
      <div className="flex flex-col gap-4">
        <label className="text-sm font-semibold text-gray-900">Chính sách hủy phòng <span className="text-red-500">*</span></label>
        <div className="flex flex-col gap-3">
          {cancellationPolicyOptions.map((policy) => {
            const isSelected = data.cancellationPolicyId === policy.value;
            const hasError = touched.cancellationPolicyId && errors.cancellationPolicyId && !errors.cancellationPolicyId.isValid;
            return (
              <div
                key={policy.value}
                className={`border-2 rounded-xl p-3 md:p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#2DD4A8] bg-[#e6faf4] shadow-sm"
                    : (hasError ? "border-red-400 hover:border-red-500" : "border-gray-200 hover:border-[#2DD4A8]")
                }`}
                onClick={() => {
                  markTouched("cancellationPolicyId");
                  onChange({ cancellationPolicyId: policy.value });
                }}
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
          <FieldError error={touched.cancellationPolicyId ? errors.cancellationPolicyId : null} />
        </div>
      </div>
    </div>
  );
}
