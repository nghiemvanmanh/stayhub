"use client";

import { useMemo, useState } from "react";
import { Input, Select, Skeleton } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  HomeOutlined,
  EnvironmentOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import {
  provinceData,
  type PropertyInfoData,
  type RentalTypeItem,
} from "./registrationData";
import { fetcher } from "../../../utils/fetcher";
import {
  validatePropertyName,
  validateDescription,
  validateLatitude,
  validateLongitude,
  validateRequired,
  validateSelect,
} from "@/constants/validation";

const { TextArea } = Input;

interface PropertyInfoStepProps {
  data: PropertyInfoData;
  onChange: (data: Partial<PropertyInfoData>) => void;
}

function FieldError({ message }: { message: string }) {
  if (!message) return null;
  return <span className="text-xs text-red-500 mt-1 block">{message}</span>;
}

export default function PropertyInfoStep({ data, onChange }: PropertyInfoStepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    if (!touched[field]) setTouched(prev => ({ ...prev, [field]: true }));
  };

  const { data: rentalTypes, isLoading: loadingRentalTypes } = useQuery<RentalTypeItem[]>({
    queryKey: ["public-rental-types"],
    queryFn: async () => {
      const res = await fetcher.get("/public/rental-types");
      return res.data?.data ?? res.data;
    },
  });

  const categoryOptions = useMemo(() => {
    if (!data.rentalTypeId || !rentalTypes) return [];
    const selectedRentalType = rentalTypes.find(r => r.id === data.rentalTypeId);
    return (selectedRentalType?.categoryResponses ?? []).map((c) => ({ value: c.id, label: c.name }));
  }, [data.rentalTypeId, rentalTypes]);

  const rentalTypeOptions = useMemo(
    () => (rentalTypes ?? []).map((r) => ({ value: r.id, label: r.name })),
    [rentalTypes]
  );

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

  // Validations
  const nameVal = touched.name ? validatePropertyName(data.name) : null;
  const descVal = touched.description ? validateDescription(data.description) : null;
  const rentalTypeVal = touched.rentalTypeId ? validateSelect(data.rentalTypeId, "hình thức cho thuê") : null;
  const categoryVal = touched.categoryId ? validateSelect(data.categoryId, "loại hình lưu trú") : null;

  const provinceVal = touched.province ? validateRequired(data.province, "tỉnh/thành phố") : null;
  const districtVal = touched.district ? validateRequired(data.district, "quận/huyện") : null;
  const wardVal = touched.ward ? validateRequired(data.ward, "phường/xã") : null;
  const addressVal = touched.addressDetail ? validateRequired(data.addressDetail, "địa chỉ chi tiết") : null;

  const latVal = touched.latitude ? validateLatitude(data.latitude) : null;
  const lngVal = touched.longitude ? validateLongitude(data.longitude) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cơ sở lưu trú</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Cung cấp thông tin cơ bản về cơ sở lưu trú của bạn để khách hàng dễ dàng tìm kiếm và đặt phòng.
          </p>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <HomeOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Thông tin cơ bản</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                Tên cơ sở lưu trú <span className="text-red-500">*</span>
              </label>
              <Input
                size="large"
                placeholder="Ví dụ: Biệt thự Đồi Thông Đà Lạt"
                value={data.name}
                status={nameVal && !nameVal.isValid ? "error" : undefined}
                onChange={(e) => onChange({ name: e.target.value })}
                onBlur={() => markTouched("name")}
                maxLength={100}
                showCount
              />
              {nameVal && !nameVal.isValid && <FieldError message={nameVal.message} />}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <TextArea
                placeholder="Mô tả về không gian, vị trí, điểm nổi bật..."
                rows={4}
                value={data.description}
                status={descVal && !descVal.isValid ? "error" : undefined}
                onChange={(e) => onChange({ description: e.target.value })}
                onBlur={() => markTouched("description")}
                maxLength={2000}
                showCount
              />
              {descVal && !descVal.isValid && <FieldError message={descVal.message} />}
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
                      status={rentalTypeVal && !rentalTypeVal.isValid ? "error" : undefined}
                      onChange={(v) => {
                        if (v !== data.rentalTypeId) {
                          onChange({ rentalTypeId: v, categoryId: null });
                        }
                      }}
                      onBlur={() => markTouched("rentalTypeId")}
                    />
                    {rentalTypeVal && !rentalTypeVal.isValid && <FieldError message={rentalTypeVal.message} />}
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
                      value={data.categoryId ?? undefined}
                      status={categoryVal && !categoryVal.isValid ? "error" : undefined}
                      onChange={(v) => onChange({ categoryId: v })}
                      onBlur={() => markTouched("categoryId")}
                      disabled={!data.rentalTypeId || categoryOptions.length === 0}
                    />
                    {categoryVal && !categoryVal.isValid && <FieldError message={categoryVal.message} />}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <EnvironmentOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Vị trí</h3>
          </div>
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
                  status={provinceVal && !provinceVal.isValid ? "error" : undefined}
                  onChange={(v) => onChange({ province: v, district: "", ward: "" })}
                  onBlur={() => markTouched("province")}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
                {provinceVal && !provinceVal.isValid && <FieldError message={provinceVal.message} />}
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
                  status={districtVal && !districtVal.isValid ? "error" : undefined}
                  onChange={(v) => onChange({ district: v, ward: "" })}
                  onBlur={() => markTouched("district")}
                  disabled={!data.province}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
                {districtVal && !districtVal.isValid && <FieldError message={districtVal.message} />}
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
                  status={wardVal && !wardVal.isValid ? "error" : undefined}
                  onChange={(v) => onChange({ ward: v })}
                  onBlur={() => markTouched("ward")}
                  disabled={!data.district}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                />
                {wardVal && !wardVal.isValid && <FieldError message={wardVal.message} />}
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
                status={addressVal && !addressVal.isValid ? "error" : undefined}
                onChange={(e) => onChange({ addressDetail: e.target.value })}
                onBlur={() => markTouched("addressDetail")}
              />
              {addressVal && !addressVal.isValid && <FieldError message={addressVal.message} />}
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
                  status={latVal && !latVal.isValid ? "error" : undefined}
                  onChange={(e) => onChange({ latitude: e.target.value })}
                  onBlur={() => markTouched("latitude")}
                />
                {latVal && !latVal.isValid && <FieldError message={latVal.message} />}
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
                  status={lngVal && !lngVal.isValid ? "error" : undefined}
                  onChange={(e) => onChange({ longitude: e.target.value })}
                  onBlur={() => markTouched("longitude")}
                />
                {lngVal && !lngVal.isValid && <FieldError message={lngVal.message} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-5 sticky top-[100px] max-lg:static">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <BulbOutlined className="text-lg text-amber-400" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Mẹo đặt tên</h4>
          </div>
          <ul className="list-none p-0 m-0">
            {[
              'Đặt tên ngắn gọn, dễ nhớ, nêu bật điểm đặc biệt.',
              'Mô tả nên nhấn mạnh vị trí, view, không gian sống.',
              'Chọn đúng loại hình giúp khách tìm kiếm chính xác hơn.',
              'Địa chỉ chi tiết giúp khách dễ dàng tìm đường đến nơi.',
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
