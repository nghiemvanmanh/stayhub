"use client";

import { useState } from "react";
import { PropertyPricingFields } from "@/components/common/property-form/PropertyPricingFields";
import { BulbOutlined } from "@ant-design/icons";
import {
  isPrivateRoomRentalType,
  type PropertyPricingData,
  type RentalTypeItem,
} from "@/components/common/property-form/propertyData";
import { validatePrice, validateSelect } from "@/constants/validation";

interface PropertyPricingStepProps {
  data: PropertyPricingData;
  onChange: (data: Partial<PropertyPricingData>) => void;
  rentalTypeId: number | null;
  rentalTypes: RentalTypeItem[];
}

 

export default function PropertyPricingStep({ data, onChange, rentalTypeId, rentalTypes }: PropertyPricingStepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    if (!touched[field]) setTouched(prev => ({ ...prev, [field]: true }));
  };

  const selectedType = rentalTypes.find(r => r.id === rentalTypeId);
  const isPrivateRoom = isPrivateRoomRentalType(selectedType);

  const priceVal = touched.pricePerNight ? validatePrice(data.pricePerNight) : null;
  const policyVal = touched.cancellationPolicyId ? validateSelect(data.cancellationPolicyId, "chính sách hủy phòng") : null;

  const errors = {
    pricePerNight: priceVal,
    cancellationPolicyId: policyVal,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Giá & Chính sách</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Thiết lập giá cho thuê và các chính sách thanh toán, hủy phòng phù hợp.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <PropertyPricingFields
            data={data}
            onChange={onChange}
            errors={errors}
            touched={touched}
            markTouched={markTouched}
            isPrivateRoom={isPrivateRoom}
          />
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
