"use client";

import { useMemo, useState } from "react";
import { PropertyInfoFields } from "@/components/common/property-form/PropertyInfoFields";
import { PropertyLocationFields } from "@/components/common/property-form/PropertyLocationFields";
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
} from "@/components/common/property-form/propertyData";
import { fetcher } from "@/utils/fetcher";
import {
  validatePropertyName,
  validateDescription,
  validateLatitude,
  validateLongitude,
  validateRequired,
  validateSelect,
} from "@/constants/validation";

 
interface PropertyInfoStepProps {
  data: PropertyInfoData;
  onChange: (data: Partial<PropertyInfoData>) => void;
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

 

  // Validations
  const nameVal = touched.name ? validatePropertyName(data.name) : null;
  const descVal = touched.description ? validateDescription(data.description) : null;
  const rentalTypeVal = touched.rentalTypeId ? validateSelect(data.rentalTypeId, "hình thức cho thuê") : null;
  const categoryVal = touched.categoryId ? validateSelect(data.categoryId, "loại hình lưu trú") : null;

  const provinceVal = touched.province ? validateRequired(data.province, "tỉnh/thành phố", 100) : null;
  const districtVal = touched.district ? validateRequired(data.district, "quận/huyện", 100) : null;
  const wardVal = touched.ward ? validateRequired(data.ward, "phường/xã", 100) : null;
  const addressVal = touched.addressDetail ? validateRequired(data.addressDetail, "địa chỉ chi tiết", 255) : null;

  const latVal = touched.latitude ? validateLatitude(data.latitude) : null;
  const lngVal = touched.longitude ? validateLongitude(data.longitude) : null;

  const errors = {
    name: nameVal,
    description: descVal,
    rentalTypeId: rentalTypeVal,
    categoryId: categoryVal,
    province: provinceVal,
    district: districtVal,
    ward: wardVal,
    addressDetail: addressVal,
    latitude: latVal,
    longitude: lngVal,
  };

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
          <PropertyInfoFields
            data={data}
            onChange={onChange}
            errors={errors}
            touched={touched}
            markTouched={markTouched}
            rentalTypes={rentalTypes ?? []}
            loadingRentalTypes={loadingRentalTypes}
          />
        </div>

        {/* Location */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <EnvironmentOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Vị trí</h3>
          </div>
          <PropertyLocationFields
            data={data}
            onChange={onChange}
            errors={errors}
            touched={touched}
            markTouched={markTouched}
          />
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
