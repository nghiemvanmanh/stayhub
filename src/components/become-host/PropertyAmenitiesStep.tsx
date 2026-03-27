"use client";

import { useState, useMemo } from "react";
import { Upload, Checkbox, Skeleton } from "antd";
import type { UploadFile } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  PictureOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  BulbOutlined,
  EditOutlined
} from "@ant-design/icons";
import {
  Wifi, Tv, Microwave, WashingMachine, CircleParking, Snowflake, Briefcase,
  WavesLadder, Bath, Aperture, Drumstick, Flame, Dumbbell, FireExtinguisher,
  Disc3, BriefcaseMedical, Radar, type LucideIcon
} from "lucide-react";
import { type PropertyAmenitiesData, type AmenityItem, type RoomData, type RentalTypeItem } from "./registrationData";
import { fetcher } from "../../../utils/fetcher";
import RoomModal from "./RoomModal";

interface PropertyAmenitiesStepProps {
  data: PropertyAmenitiesData;
  onChange: (data: Partial<PropertyAmenitiesData>) => void;
  rentalTypeId: number | null;
  rentalTypes: RentalTypeItem[];
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

export default function PropertyAmenitiesStep({ data, onChange, rentalTypeId, rentalTypes }: PropertyAmenitiesStepProps) {
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);

  const isPrivateRoom = useMemo(() => {
    const selectedType = rentalTypes.find(r => r.id === rentalTypeId);
    return selectedType?.slug === "thue-theo-phong";
  }, [rentalTypeId, rentalTypes]);
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
                        : "border-gray-200 hover:border-[#2DD4A8]"
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
        {/* Rooms (Conditionally Rendered) */}
        {isPrivateRoom && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AppstoreOutlined className="text-lg text-[#2DD4A8]" />
                <h3 className="text-base font-semibold text-gray-900 m-0">
                  Thông tin phòng <span className="text-red-500">*</span>
                </h3>
              </div>
              <span className="text-xs text-gray-400">Tối thiểu 2 phòng</span>
            </div>

            <div className="flex flex-col gap-4">
              {data.rooms.map((room, i) => (
                <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#2DD4A8] transition-colors cursor-pointer" onClick={() => openRoomModal(i)}>
                  <div className="w-[120px] h-[90px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {room.images?.[0] ? (
                      <img src={URL.createObjectURL(room.images[0])} alt={room.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><PictureOutlined className="text-2xl" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-[15px] font-semibold text-gray-900 m-0 truncate pr-2">{room.name}</h4>
                        <button className="text-red-500 hover:text-red-600 border-none bg-transparent cursor-pointer p-0 shrink-0" onClick={(e) => handleDeleteRoom(i, e)}>
                          <DeleteOutlined />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 truncate m-0 mt-1">{room.description}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                      <span className="flex items-center gap-1">👥 {room.maxGuests}</span>
                      <span className="flex items-center gap-1">🛌 {room.numBeds}</span>
                      <span className="flex items-center gap-1">🚿 {room.numBathrooms}</span>
                      <span className="font-semibold text-[#2DD4A8] ml-auto">{room.pricePerNight.toLocaleString()} ₫</span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                className="w-full py-3 border-2 border-dashed border-[#2DD4A8] text-[#2DD4A8] rounded-xl font-medium bg-transparent cursor-pointer hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                onClick={() => openRoomModal(null)}
              >
                + Thêm phòng mới
              </button>
            </div>
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
