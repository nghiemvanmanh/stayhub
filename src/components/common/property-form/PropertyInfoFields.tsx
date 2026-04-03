import { useMemo } from "react";
import { Input, Select, Skeleton } from "antd";
import { type PropertyInfoData, type RentalTypeItem } from "./propertyData";
import { FieldError } from "./FieldError";
import { type ValidationResult } from "@/constants/validation";

const { TextArea } = Input;

interface PropertyInfoFieldsProps {
  data: PropertyInfoData;
  onChange: (data: Partial<PropertyInfoData>) => void;
  errors: Record<string, ValidationResult | null>;
  touched: Record<string, boolean>;
  markTouched: (field: string) => void;
  rentalTypes: RentalTypeItem[];
  loadingRentalTypes: boolean;
  categoryName?: string;
}

export function PropertyInfoFields({
  data,
  onChange,
  errors,
  touched,
  markTouched,
  rentalTypes,
  loadingRentalTypes,
  categoryName,
}: PropertyInfoFieldsProps) {
  const categoryOptions = useMemo(() => {
    if (!data.rentalTypeId || !rentalTypes) return [];
    const selectedRentalType = rentalTypes.find((r) => r.id === data.rentalTypeId);
    return (selectedRentalType?.categoryResponses ?? []).map((c) => ({ value: c.id, label: c.name }));
  }, [data.rentalTypeId, rentalTypes]);
  const rentalTypeOptions = useMemo(
    () => (rentalTypes ?? []).map((r) => ({ value: r.id, label: r.name })),
    [rentalTypes]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-gray-700">
          Tên cơ sở lưu trú <span className="text-red-500">*</span>
        </label>
        <Input
          size="large"
          placeholder="Ví dụ: Biệt thự Đồi Thông Đà Lạt"
          value={data.name}
          status={touched.name && errors.name && !errors.name.isValid ? "error" : undefined}
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={() => markTouched("name")}
          maxLength={100}
          showCount
        />
        <FieldError error={touched.name ? errors.name : null} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-gray-700">
          Mô tả chi tiết <span className="text-red-500">*</span>
        </label>
        <TextArea
          placeholder="Mô tả về không gian, vị trí, điểm nổi bật..."
          rows={4}
          value={data.description}
          status={touched.description && errors.description && !errors.description.isValid ? "error" : undefined}
          onChange={(e) => onChange({ description: e.target.value })}
          onBlur={() => markTouched("description")}
          maxLength={2000}
          showCount
        />
        <FieldError error={touched.description ? errors.description : null} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Hình thức cho thuê <span className="text-red-500">*</span>
          </label>
          {loadingRentalTypes ? (
            <Skeleton.Input active size="large" block />
          ) : (
            <>
              <Select
                size="large"
                placeholder="Chọn hình thức"
                options={rentalTypeOptions}
                value={data.rentalTypeId ?? undefined}
                status={touched.rentalTypeId && errors.rentalTypeId && !errors.rentalTypeId.isValid ? "error" : undefined}
                onChange={(v) => {
                  if (v !== data.rentalTypeId) {
                    onChange({ rentalTypeId: v, categoryId: null });
                  }
                }}
                onBlur={() => markTouched("rentalTypeId")}
              />
              <FieldError error={touched.rentalTypeId ? errors.rentalTypeId : null} />
            </>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Loại hình lưu trú <span className="text-red-500">*</span>
          </label>
          {loadingRentalTypes ? (
            <Skeleton.Input active size="large" block />
          ) : (
            <>
              <Select
                size="large"
                placeholder="Chọn loại hình"
                options={categoryOptions}
                value={categoryName}
                status={touched.categoryId && errors.categoryId && !errors.categoryId.isValid ? "error" : undefined}
                onChange={(v) => onChange({ categoryId: v })}
                onBlur={() => markTouched("categoryId")}
                disabled={!data.rentalTypeId || categoryOptions.length === 0}
              />
              <FieldError error={touched.categoryId ? errors.categoryId : null} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
