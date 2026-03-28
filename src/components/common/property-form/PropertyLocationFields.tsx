import { useMemo } from "react";
import { Input, Select } from "antd";
import { provinceData, type PropertyInfoData } from "./propertyData";
import { FieldError } from "./FieldError";
import { type ValidationResult } from "@/constants/validation";

interface PropertyLocationFieldsProps {
  data: PropertyInfoData;
  onChange: (data: Partial<PropertyInfoData>) => void;
  errors: Record<string, ValidationResult | null>;
  touched: Record<string, boolean>;
  markTouched: (field: string) => void;
}

export function PropertyLocationFields({
  data,
  onChange,
  errors,
  touched,
  markTouched,
}: PropertyLocationFieldsProps) {
  const provinceOptions = useMemo(
    () => Object.keys(provinceData).map((p) => ({ value: p, label: p })),
    []
  );

  const districtOptions = useMemo(() => {
    if (!data.province || !provinceData[data.province]) return [];
    return Object.keys(provinceData[data.province]).map((d) => ({ value: d, label: d }));
  }, [data.province]);

  const wardOptions = useMemo(() => {
    if (!data.province || !data.district || !provinceData[data.province]?.[data.district]) return [];
    return provinceData[data.province][data.district].map((w) => ({ value: w, label: w }));
  }, [data.province, data.district]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Tỉnh / Thành phố <span className="text-red-500">*</span>
          </label>
          <Select
            size="large"
            placeholder="Chọn tỉnh/TP"
            options={provinceOptions}
            value={data.province || undefined}
            status={touched.province && errors.province && !errors.province.isValid ? "error" : undefined}
            onChange={(v) => onChange({ province: v, district: "", ward: "" })}
            onBlur={() => markTouched("province")}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <FieldError error={touched.province ? errors.province : null} />
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
            status={touched.district && errors.district && !errors.district.isValid ? "error" : undefined}
            onChange={(v) => onChange({ district: v, ward: "" })}
            onBlur={() => markTouched("district")}
            disabled={!data.province}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <FieldError error={touched.district ? errors.district : null} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Phường / Xã <span className="text-red-500">*</span>
          </label>
          <Select
            size="large"
            placeholder="Chọn phường/xã"
            options={wardOptions}
            value={data.ward || undefined}
            status={touched.ward && errors.ward && !errors.ward.isValid ? "error" : undefined}
            onChange={(v) => onChange({ ward: v })}
            onBlur={() => markTouched("ward")}
            disabled={!data.district}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          />
          <FieldError error={touched.ward ? errors.ward : null} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-gray-700">
          Địa chỉ chi tiết <span className="text-red-500">*</span>
        </label>
        <Input
          size="large"
          placeholder="Số nhà, tên đường..."
          value={data.addressDetail}
          status={touched.addressDetail && errors.addressDetail && !errors.addressDetail.isValid ? "error" : undefined}
          onChange={(e) => onChange({ addressDetail: e.target.value })}
          onBlur={() => markTouched("addressDetail")}
        />
        <FieldError error={touched.addressDetail ? errors.addressDetail : null} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Vĩ độ (Latitude) <span className="text-red-500">*</span>
          </label>
          <Input
            size="large"
            className="!w-full"
            placeholder="Ví dụ: 10.762622"
            value={data.latitude?.toString()}
            status={touched.latitude && errors.latitude && !errors.latitude.isValid ? "error" : undefined}
            onChange={(e) => onChange({ latitude: e.target.value })}
            onBlur={() => markTouched("latitude")}
          />
          <FieldError error={touched.latitude ? errors.latitude : null} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-gray-700">
            Kinh độ (Longitude) <span className="text-red-500">*</span>
          </label>
          <Input
            size="large"
            className="!w-full"
            placeholder="Ví dụ: 106.660172"
            value={data.longitude?.toString()}
            status={touched.longitude && errors.longitude && !errors.longitude.isValid ? "error" : undefined}
            onChange={(e) => onChange({ longitude: e.target.value })}
            onBlur={() => markTouched("longitude")}
          />
          <FieldError error={touched.longitude ? errors.longitude : null} />
        </div>
      </div>
    </div>
  );
}
