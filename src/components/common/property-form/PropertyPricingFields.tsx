import { InputNumber, Switch, Skeleton } from "antd";
import { type PropertyPricingData } from "./propertyData";
import { FieldError } from "./FieldError";
import { type ValidationResult } from "@/constants/validation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";

interface PropertyPricingFieldsProps {
  data: PropertyPricingData;
  onChange: (data: Partial<PropertyPricingData>) => void;
  errors: Record<string, ValidationResult | null>;
  touched: Record<string, boolean>;
  markTouched: (field: string) => void;
  isPrivateRoom: boolean;
}

interface CancellationPolicy {
  id: number;
  name: string;
  description: string;
  refundPercentage: number;
  daysBeforeCheckin: number;
}

export function PropertyPricingFields({
  data,
  onChange,
  errors,
  touched,
  markTouched,
  isPrivateRoom,
}: PropertyPricingFieldsProps) {
  const { data: policiesResponse, isLoading: isLoadingPolicies } = useQuery({
    queryKey: ["cancellation-policies"],
    queryFn: async () => {
      const res = await fetcher.get("/properties/host/cancellation-policy");
      return res.data?.data ?? res.data;
    },
  });

  const policies: CancellationPolicy[] = Array.isArray(policiesResponse) ? policiesResponse : [];

  const selectedPolicy = policies.find((p) => p.id === data.cancellationPolicyId);
  const selectedPolicyName = selectedPolicy?.name?.toLowerCase() || "";
  const isStrict = selectedPolicyName.includes("nghiêm ngặt");
  const isFlexible = selectedPolicyName.includes("linh hoạt");
  const isModerate = selectedPolicyName.includes("trung bình") || selectedPolicyName.includes("vừa phải");

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

      {/* 2. Cancellation Policy */}
      <div className="flex flex-col gap-4">
        <label className="text-sm font-semibold text-gray-900">
          Chính sách hủy phòng <span className="text-red-500">*</span>
        </label>
        {isLoadingPolicies ? (
          <Skeleton active paragraph={{ rows: 3 }} title={false} />
        ) : (
          <div className="flex flex-col gap-3">
            {policies.map((policy) => {
              const isSelected = data.cancellationPolicyId === policy.id;
              const hasError = touched.cancellationPolicyId && errors.cancellationPolicyId && !errors.cancellationPolicyId.isValid;
              return (
                <div
                  key={policy.id}
                  className={`border-2 rounded-xl p-3 md:p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#2DD4A8] bg-[#e6faf4] shadow-sm"
                      : hasError
                      ? "border-red-400 hover:border-red-500"
                      : "border-gray-200 hover:border-[#2DD4A8]"
                  }`}
                  onClick={() => {
                    markTouched("cancellationPolicyId");

                    const policyName = policy.name.toLowerCase();
                    const strict = policyName.includes("nghiêm ngặt");
                    const flex = policyName.includes("linh hoạt");

                    let newPayAtCheckin = data.isPayAtCheckinAllowed;
                    if (strict) {
                      newPayAtCheckin = false;
                    }

                    let newDeposit = data.depositPercentage;
                    if (newPayAtCheckin) {
                      const min = flex ? 30 : 50;
                      if (Number(newDeposit) < min) newDeposit = min;
                    } else {
                      newDeposit = 100;
                    }

                    onChange({
                      cancellationPolicyId: policy.id,
                      isPayAtCheckinAllowed: newPayAtCheckin,
                      depositPercentage: newDeposit,
                    });
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? "border-[#2DD4A8]" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#2DD4A8]" />}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm ${isSelected ? "font-semibold text-[#2DD4A8]" : "font-medium text-gray-700"}`}>
                        {policy.name}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">{policy.description}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <FieldError error={touched.cancellationPolicyId ? errors.cancellationPolicyId : null} />
          </div>
        )}
      </div>

      <div className="w-full h-[1px] bg-gray-200 my-2" />

      {/* 3. Payment & Deposit */}
      <div className="flex flex-col gap-4">
        <label className="text-sm font-semibold text-gray-900">Thanh toán & Đặt cọc</label>
        <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 ${isStrict ? 'opacity-60 cursor-not-allowed' : ''}`}>
          <div className="pr-4">
            <p className="text-sm font-medium text-gray-900 m-0">Cho phép thanh toán khi nhận phòng</p>
            <p className="text-xs text-gray-400 m-0 mt-1">Khách có thể trả tiền trực tiếp khi check-in</p>
            {isStrict && <p className="text-xs text-red-500 m-0 mt-1">Không áp dụng cho chính sách bảo lưu Nghiêm ngặt</p>}
          </div>
          <Switch
            disabled={isStrict}
            checked={isStrict ? false : data.isPayAtCheckinAllowed}
            onChange={(v) => {
              let newDeposit = data.depositPercentage;
              if (v) {
                const min = isFlexible ? 30 : 50;
                if (Number(newDeposit) < min) newDeposit = min;
              } else {
                newDeposit = 100;
              }
              onChange({ isPayAtCheckinAllowed: v, depositPercentage: newDeposit });
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">Tỉ lệ đặt cọc (%)</label>
          <InputNumber
            size="large"
            min={data.isPayAtCheckinAllowed ? (isFlexible ? 30 : 50) : 100}
            max={100}
            value={data.isPayAtCheckinAllowed ? data.depositPercentage : 100}
            disabled={!data.isPayAtCheckinAllowed}
            onChange={(v) => onChange({ depositPercentage: v ?? "" })}
            formatter={(value) => `${value}%`}
            parser={(value) => Number(value?.replace("%", "") || 0)}
            className="!w-full sm:!w-1/2"
          />
          <span className="text-xs text-gray-400">
            {data.isPayAtCheckinAllowed 
              ? `Tối thiểu ${isFlexible ? 30 : 50}% dựa trên chính sách hủy phòng` 
              : `Bắt buộc thanh toán trước 100% khi không cho phép thanh toán khi nhận phòng`}
          </span>
        </div>
      </div>
    </div>
  );
}
