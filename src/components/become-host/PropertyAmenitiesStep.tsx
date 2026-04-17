"use client";

import { useState, useMemo } from "react";
import { InputNumber } from "antd";
import { PropertyAmenitiesFields } from "@/components/common/property-form/PropertyAmenitiesFields";
import { PropertyImagesFields } from "@/components/common/property-form/PropertyImagesFields";
import { PropertyRoomsFields } from "@/components/common/property-form/PropertyRoomsFields";
import { useQuery } from "@tanstack/react-query";
import {
  PictureOutlined,
  AppstoreOutlined,
  BulbOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import {
  type PropertyAmenitiesData,
  type AmenityItem,
  type RoomData,
  type RentalTypeItem,
  type EntirePlaceData,
  isEntirePlaceRentalType,
} from "@/components/common/property-form/propertyData";
import { fetcher } from "@/utils/fetcher";
import RoomModal from "./RoomModal";

interface PropertyAmenitiesStepProps {
  data: PropertyAmenitiesData;
  onChange: (data: Partial<PropertyAmenitiesData>) => void;
  rentalTypeId: number | null;
  rentalTypes: RentalTypeItem[];
}

export default function PropertyAmenitiesStep({ data, onChange, rentalTypeId, rentalTypes }: PropertyAmenitiesStepProps) {
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);

  const selectedType = useMemo(() => rentalTypes.find(r => r.id === rentalTypeId), [rentalTypeId, rentalTypes]);
  const isPrivateRoom = useMemo(() => selectedType?.slug === "thue-theo-phong", [selectedType]);
  const isEntirePlace = useMemo(() => isEntirePlaceRentalType(selectedType), [selectedType]);

  // Fetch amenities from API
  const { data: amenities, isLoading: loadingAmenities } = useQuery<AmenityItem[]>({
    queryKey: ["public-amenities"],
    queryFn: async () => {
      const res = await fetcher.get("/public/amenities");
      return res.data?.data ?? res.data;
    },
  });
  const amenityList = amenities ?? [];

  const updateEntirePlace = (partial: Partial<EntirePlaceData>) => {
    onChange({ entirePlace: { ...data.entirePlace, ...partial } });
  };

  const openRoomModal = (index: number | null = null) => {
    setEditingRoomIndex(index);
    setRoomModalVisible(true);
  };

  const handleSaveRoom = (room: RoomData) => {
    const newRooms = [...data.rooms];
    if (editingRoomIndex !== null) {
      newRooms[editingRoomIndex] = room;
    } else {
      newRooms.push(room);
    }
    onChange({ rooms: newRooms });
    setRoomModalVisible(false);
    setEditingRoomIndex(null);
  };

  const handleDeleteRoom = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newRooms = [...data.rooms];
    newRooms.splice(index, 1);
    onChange({ rooms: newRooms });
  };

  const handleCloseRoomModal = () => {
    setRoomModalVisible(false);
    setEditingRoomIndex(null);
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

          <PropertyAmenitiesFields
            data={data}
            onChange={onChange}
            amenityList={amenityList}
            loadingAmenities={loadingAmenities}
          />
        </div>

        {/* Images */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <PictureOutlined className="text-lg text-[#2DD4A8]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">
              Hình ảnh cơ sở <span className="text-red-500">*</span>
            </h3>
          </div>
          <PropertyImagesFields data={data} onChange={onChange} />
        </div>

        {/* Entire Place Info */}
        {isEntirePlace && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <HomeOutlined className="text-lg text-[#2DD4A8]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">
                Thông tin chỗ ở <span className="text-red-500">*</span>
              </h3>
            </div>
            <p className="text-xs text-gray-400 mb-4 -mt-2">
              Nhập thông tin tổng thể cho toàn bộ chỗ ở của bạn.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Số phòng <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  size="large"
                  min={1}
                  max={100}
                  value={data.entirePlace.roomCount}
                  onChange={(v) => updateEntirePlace({ roomCount: v ?? 1 })}
                  className="!w-full"
                  placeholder="1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Số khách tối đa <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  size="large"
                  min={1}
                  max={50}
                  value={data.entirePlace.maxGuests}
                  onChange={(v) => updateEntirePlace({ maxGuests: v ?? 1 })}
                  className="!w-full"
                  placeholder="2"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Số phòng ngủ <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  size="large"
                  min={0}
                  max={50}
                  value={data.entirePlace.numBedrooms}
                  onChange={(v) => updateEntirePlace({ numBedrooms: v ?? 1 })}
                  className="!w-full"
                  placeholder="1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Số giường <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  size="large"
                  min={1}
                  max={50}
                  value={data.entirePlace.numBeds}
                  onChange={(v) => updateEntirePlace({ numBeds: v ?? 1 })}
                  className="!w-full"
                  placeholder="1"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Số phòng tắm <span className="text-red-500">*</span>
                </label>
                <InputNumber
                  size="large"
                  min={0}
                  max={50}
                  value={data.entirePlace.numBathrooms}
                  onChange={(v) => updateEntirePlace({ numBathrooms: v ?? 1 })}
                  className="!w-full"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Rooms (Private Room Only) */}
        {isPrivateRoom && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <AppstoreOutlined className="text-lg text-[#2DD4A8]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">
                Thông tin phòng <span className="text-red-500">*</span>
              </h3>
            </div>
            <PropertyRoomsFields
              data={data}
              onOpenRoomModal={openRoomModal}
              onDeleteRoom={handleDeleteRoom}
            />
          </div>
        )}
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

      <RoomModal
        visible={roomModalVisible}
        onCancel={handleCloseRoomModal}
        onSave={handleSaveRoom}
        initialData={editingRoomIndex !== null ? data.rooms[editingRoomIndex] : undefined}
        amenities={amenityList}
      />
    </div>
  );
}
