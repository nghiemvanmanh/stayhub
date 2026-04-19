"use client";

import { DatePicker, Input, Slider, Radio, Checkbox, Button } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";


const { RangePicker } = DatePicker;

// Top amenities to show as filter (matching mockup)
const filterAmenities = [
  { id: 1, name: "Wi-Fi miễn phí", key: "wifi" },
  { id: 3, name: "Bếp", key: "bep" },
  { id: 2, name: "Hồ bơi", key: "ho-boi" },
  { id: 4, name: "Điều hòa", key: "dieu-hoa" },
  { id: 7, name: "TV", key: "tv" },
];

interface SearchFiltersProps {
  location: string;
  onLocationChange: (val: string) => void;
  dates: [Dayjs, Dayjs] | null;
  onDatesChange: (val: [Dayjs, Dayjs] | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (val: [number, number]) => void;
  rentalType: string;
  onRentalTypeChange: (val: string) => void;
  selectedAmenities: number[];
  onAmenitiesChange: (val: number[]) => void;
  onReset: () => void;
}

export default function SearchFilters({
  location,
  onLocationChange,
  dates,
  onDatesChange,
  priceRange,
  onPriceRangeChange,
  rentalType,
  onRentalTypeChange,
  selectedAmenities,
  onAmenitiesChange,
  onReset,
}: SearchFiltersProps) {
  const formatPrice = (val: number) => {
    if (val >= 10000000) return "10,000,000+";
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  return (
    <div className="w-full space-y-5">
      {/* Date Picker */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-1">
          Ngày nhận — trả phòng
        </h4>
        <p className="text-xs text-gray-400 mb-2">
          Thêm ngày để có giá chính xác.
        </p>
        <RangePicker
          placeholder={["Nhận phòng", "Trả phòng"]}
          className="w-full !rounded-lg"
          size="middle"
          format="DD/MM/YYYY"
          disabledDate={(current) => current && current < dayjs().startOf("day")}
          value={dates}
          onChange={(vals) => {
            if (vals?.[0] && vals?.[1]) {
              onDatesChange([vals[0], vals[1]]);
            } else {
              onDatesChange(null);
            }
          }}
        />
      </div>

      {/* Location input */}
      <div>
        <Input
          prefix={<EnvironmentOutlined className="text-gray-400" />}
          placeholder="Nhập địa điểm..."
          className="!rounded-lg"
          size="middle"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          allowClear
        />
      </div>

      {/* Separator */}
      <div className="border-t border-gray-100" />

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1">
            <span>🏷️</span> Bộ lọc
          </h4>
        </div>
        <div className="mb-1">
          <p className="text-xs font-semibold text-gray-700 mb-0">
            Khoảng giá (đêm)
          </p>
        </div>
        <Slider
          range
          min={0}
          max={10000000}
          step={100000}
          value={priceRange}
          onChange={(val) => onPriceRangeChange(val as [number, number])}
          tooltip={{ formatter: (val) => (val !== undefined ? formatPrice(val) + "đ" : "") }}
          styles={{
            track: { background: "#2DD4A8" },
            handle: { borderColor: "#2DD4A8" },
          }}
        />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatPrice(priceRange[0])}đ</span>
          <span>{formatPrice(priceRange[1])}đ</span>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-100" />

      {/* Rental Type */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Loại hình chỗ ở</h4>
        <Radio.Group
          value={rentalType}
          onChange={(e) => onRentalTypeChange(e.target.value)}
          className="flex flex-col gap-2"
        >
          <Radio value="" className="!text-sm text-gray-700">
            Toàn bộ nhà
          </Radio>
          <Radio value="PRIVATE_ROOM" className="!text-sm text-gray-700">
            Phòng riêng
          </Radio>
          <Radio value="SHARED_ROOM" className="!text-sm text-gray-700">
            Phòng chung
          </Radio>
        </Radio.Group>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-100" />

      {/* Amenities */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 mb-2">Tiện nghi phổ biến</h4>
        <Checkbox.Group
          value={selectedAmenities}
          onChange={(vals) => onAmenitiesChange(vals as number[])}
          className="flex flex-col gap-2"
        >
          {filterAmenities.map((amenity) => (
            <Checkbox key={amenity.id} value={amenity.id} className="!text-sm text-gray-700">
              {amenity.name}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="text-[#2DD4A8] text-xs font-medium hover:underline cursor-pointer bg-transparent border-none p-0"
      >
        Xóa tất cả bộ lọc
      </button>
    </div>
  );
}
