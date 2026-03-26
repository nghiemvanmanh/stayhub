"use client";

import { useMemo } from "react";
import { Upload, Checkbox, Skeleton } from "antd";
import type { UploadFile } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  PictureOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  BulbOutlined,
} from "@ant-design/icons";
import {
  Wifi,
  Tv,
  Microwave,
  WashingMachine,
  CircleParking,
  Snowflake,
  Briefcase,
  WavesLadder,
  Bath,
  Aperture,
  Drumstick,
  Flame,
  Dumbbell,
  FireExtinguisher,
  Disc3,
  BriefcaseMedical,
  Radar,
  type LucideIcon,
} from "lucide-react";
import { type PropertyAmenitiesData, type AmenityItem } from "./registrationData";
import { fetcher } from "../../../utils/fetcher";

interface PropertyAmenitiesStepProps {
  data: PropertyAmenitiesData;
  onChange: (data: Partial<PropertyAmenitiesData>) => void;
}

const amenityIconMap: Record<string, LucideIcon> = {
  Wifi,
  Tv,
  Microwave,
  WashingMachine,
  CircleParking,
  Snowflake,
  Briefcase,
  WavesLadder,
  Bath,
  Aperture,
  Drumstick,
  Flame,
  Dumbbell,
  FireExtinguisher,
  Disc3,
  BriefcaseMedical,
  Radar,
};

function ImageThumb({ file, onRemove, index }: { file: File; onRemove: () => void; index: number }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  return (
    <div className={`relative rounded-xl overflow-hidden border-2 border-[#2DD4A8] bg-blue-50 flex items-center justify-center ${index === 0 ? "col-span-2 row-span-2 min-h-[260px]" : "min-h-[120px]"}`}>
      <img src={url} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover block" />
      <button
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 border-none text-white text-xs cursor-pointer flex items-center justify-center transition-colors hover:bg-red-500/90 z-[2]"
        onClick={onRemove}
      >
        <DeleteOutlined />
      </button>
      {index === 0 && (
        <span className="absolute bottom-2 left-2 text-xs font-semibold text-white bg-black/50 px-2 py-0.5 rounded">
          Ảnh bìa
        </span>
      )}
    </div>
  );
}

export default function PropertyAmenitiesStep({ data, onChange }: PropertyAmenitiesStepProps) {
  // Fetch amenities from API
  const { data: amenities, isLoading: loadingAmenities } = useQuery<AmenityItem[]>({
    queryKey: ["public-amenities"],
    queryFn: async () => {
      const res = await fetcher.get("/public/amenities");
      return res.data?.data ?? res.data;
    },
  });

  const amenityList = amenities ?? [];

  const handleAmenityToggle = (amenityId: number) => {
    const current = data.amenityIds;
    if (current.includes(amenityId)) {
      onChange({ amenityIds: current.filter((id) => id !== amenityId) });
    } else {
      onChange({ amenityIds: [...current, amenityId] });
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...data.images];
    newImages.splice(index, 1);
    onChange({ images: newImages });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tiện ích & Hình ảnh</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Chọn các tiện ích có sẵn và tải lên hình ảnh hấp dẫn để thu hút khách hàng.
          </p>
        </div>

        {/* Amenities */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <AppstoreOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">
              Tiện ích có sẵn <span className="text-red-500">*</span>
            </h3>
          </div>

          {loadingAmenities ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton.Button key={i} active block style={{ height: 72, borderRadius: 12 }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {amenityList.map((amenity) => {
                const isSelected = data.amenityIds.includes(amenity.id);
                const AmenityIcon = amenityIconMap[amenity.iconName];
                return (
                  <div
                    key={amenity.id}
                    className={`border-2 rounded-xl p-3 cursor-pointer transition-all text-center ${
                      isSelected
                        ? "border-[#2DD4A8] bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleAmenityToggle(amenity.id)}
                  >
                    <Checkbox checked={isSelected} className="!hidden" />
                    <div className="text-2xl mb-1 flex items-center justify-center">
                      {AmenityIcon ? <AmenityIcon className="w-6 h-6" /> : <AppstoreOutlined />}
                    </div>
                    <span className="text-xs font-medium text-gray-700">{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          )}
          {data.amenityIds.length > 0 && (
            <p className="text-xs text-gray-400 mt-3 m-0">
              Đã chọn {data.amenityIds.length} tiện ích
            </p>
          )}
        </div>

        {/* Images */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <PictureOutlined className="text-lg text-[#2DD4A8]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">
                Hình ảnh cơ sở <span className="text-red-500">*</span>
              </h3>
            </div>
            <span className="text-xs text-gray-400">Tối thiểu 5 ảnh, tối đa 20 ảnh</span>
          </div>

          {data.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {data.images.map((file, i) => (
                <ImageThumb key={i} file={file} index={i} onRemove={() => removeImage(i)} />
              ))}
            </div>
          )}

          {data.images.length < 20 && (
            <Upload.Dragger
              showUploadList={false}
              multiple
              accept="image/*"
              beforeUpload={() => false}
              fileList={[]}
              onChange={({ fileList }) => {
                const newFiles = fileList
                  .map((f) => f.originFileObj as File)
                  .filter(Boolean);
                onChange({ images: [...data.images, ...newFiles].slice(0, 20) });
              }}
              className="!rounded-xl !border-2 !border-dashed !border-gray-300 !bg-gray-50 hover:!bg-blue-50"
            >
              <div className="flex flex-col items-center text-center gap-1 py-4">
                <div className="text-4xl text-gray-300 mb-2"><PictureOutlined /></div>
                <p className="text-sm font-semibold text-gray-700 m-0">Kéo thả hoặc nhấp để tải ảnh lên</p>
                <p className="text-xs text-gray-400 m-0">
                  JPG, PNG — Ảnh đầu tiên sẽ là ảnh bìa ({data.images.length}/20)
                </p>
              </div>
            </Upload.Dragger>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-5 sticky top-[100px] max-lg:static">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <BulbOutlined className="text-lg text-amber-400" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Mẹo chụp ảnh</h4>
          </div>
          <ul className="list-none p-0 m-0">
            {[
              'Ảnh bìa quyết định ấn tượng đầu tiên — chọn ảnh đẹp nhất!',
              'Chụp vào ban ngày, tận dụng ánh sáng tự nhiên.',
              'Chụp góc rộng để thể hiện không gian thực tế.',
              'Đảm bảo phòng gọn gàng, sạch sẽ trước khi chụp.',
              'Thêm ảnh từ nhiều góc: phòng ngủ, phòng tắm, ban công, view.',
              'Càng nhiều tiện ích, cơ sở càng hấp dẫn khách.',
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
