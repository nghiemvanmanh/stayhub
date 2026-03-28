import { useState, useMemo, useEffect } from "react";
import { Modal, Input, InputNumber, Checkbox, Upload, message, Button } from "antd";
import { PictureOutlined, DeleteOutlined, AppstoreOutlined } from "@ant-design/icons";
import { type RoomData, type AmenityItem } from "@/components/common/property-form/propertyData";
import {
  Wifi, Tv, Microwave, WashingMachine, CircleParking, Snowflake, Briefcase,
  WavesLadder, Bath, Aperture, Drumstick, Flame, Dumbbell, FireExtinguisher,
  Disc3, BriefcaseMedical, Radar, type LucideIcon
} from "lucide-react";

interface RoomModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (room: RoomData) => void;
  initialData?: RoomData;
  amenities: AmenityItem[];
}

const amenityIconMap: Record<string, LucideIcon> = {
  Wifi, Tv, Microwave, WashingMachine, CircleParking, Snowflake, Briefcase,
  WavesLadder, Bath, Aperture, Drumstick, Flame, Dumbbell, FireExtinguisher,
  Disc3, BriefcaseMedical, Radar
};

const emptyRoom: RoomData = {
  name: "",
  description: "",
  pricePerNight: 0,
  maxGuests: 1,
  numBeds: 1,
  numBathrooms: 1,
  amenityIds: [],
  images: [],
};

function ImageThumb({ file, onRemove, index }: { file: File; onRemove: () => void; index: number }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  return (
    <div className={`relative rounded-xl overflow-hidden border-2 border-[#2DD4A8] bg-blue-50 flex items-center justify-center min-h-[120px]`}>
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

export default function RoomModal({ visible, onCancel, onSave, initialData, amenities }: RoomModalProps) {
  const [data, setData] = useState<RoomData>(initialData || emptyRoom);

  // Reset form when opened with new initialData
  useEffect(() => {
    if (visible) {
      setData(initialData || emptyRoom);
    }
  }, [visible, initialData]);

  const updateData = (updates: Partial<RoomData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    if (!data.name.trim()) return message.error("Vui lòng nhập tên phòng");
    if (!data.description.trim()) return message.error("Vui lòng nhập mô tả phòng");
    if (data.pricePerNight <= 0) return message.error("Giá phòng phải lớn hơn 0");
    if (data.images.length === 0) return message.error("Vui lòng tải lên ít nhất 1 ảnh phòng");

    onSave(data);
  };

  const handleAmenityToggle = (amenityId: number) => {
    const current = data.amenityIds;
    if (current.includes(amenityId)) {
      updateData({ amenityIds: current.filter((id) => id !== amenityId) });
    } else {
      updateData({ amenityIds: [...current, amenityId] });
    }
  };

  return (
    <Modal
      title={<h3 className="text-xl font-bold text-gray-900 m-0">{initialData ? "Sửa phòng" : "Thêm phòng mới"}</h3>}
      open={visible}
      onCancel={onCancel}
      width={720}
      footer={[
        <Button key="cancel" onClick={onCancel} className="!rounded-lg">Hủy</Button>,
        <Button key="save" type="primary" onClick={handleSave} className="!rounded-lg !bg-[#2DD4A8] !border-[#2DD4A8]" disabled={data.images.length === 0 || !data.name || !data.description || data.pricePerNight <= 0}>Lưu lại</Button>
      ]}
      className="pb-6"
    >
      <div className="flex flex-col gap-5 py-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Basic Info */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">Tên phòng <span className="text-red-500">*</span></label>
            <Input size="large" placeholder="Ví dụ: Phòng Deluxe Hướng Biển" value={data.name} onChange={e => updateData({ name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">Mô tả chi tiết <span className="text-red-500">*</span></label>
            <Input.TextArea rows={3} placeholder="Mô tả về không gian, view..." value={data.description} onChange={e => updateData({ description: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-700">Giá mỗi đêm (VNĐ) <span className="text-red-500">*</span></label>
            <InputNumber size="large" min={0} step={50000} value={data.pricePerNight} onChange={v => updateData({ pricePerNight: v || 0 })} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={value => Number(value?.replace(/,/g, "") || 0)} className="!w-full" placeholder="500,000" />
          </div>
        </div>

        {/* Capacity */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Số khách tối đa", key: "maxGuests" as const, icon: "👥" },
            { label: "Giường", key: "numBeds" as const, icon: "🛌" },
            { label: "Phòng tắm", key: "numBathrooms" as const, icon: "🚿" },
          ].map((item) => (
            <div key={item.key} className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-gray-700">{item.icon} {item.label}</label>
              <InputNumber size="large" min={1} max={50} value={data[item.key]} onChange={v => updateData({ [item.key]: v || 1 })} className="!w-full" />
            </div>
          ))}
        </div>

        {/* Amenities */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-gray-700">Tiện ích trong phòng (Chọn từ danh sách có sẵn)</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {amenities.map((amenity) => {
              const isSelected = data.amenityIds.includes(amenity.id);
              const AmenityIcon = amenityIconMap[amenity.iconName];
              return (
                <div
                  key={amenity.id}
                  className={`border rounded-lg p-2 cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1 min-h-[64px] ${isSelected ? "border-[#2DD4A8] bg-[#2DD4A8]/10" : "border-gray-200 hover:border-[#2DD4A8]"}`}
                  onClick={() => handleAmenityToggle(amenity.id)}
                >
                  {AmenityIcon ? <AmenityIcon className="w-5 h-5 text-gray-600" /> : <AppstoreOutlined className="text-gray-600" />}
                  <span className="text-[10px] font-medium text-gray-700 leading-tight">{amenity.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Images */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-gray-700">Hình ảnh phòng <span className="text-red-500">*</span></label>
          {data.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {data.images.map((file, i) => (
                <ImageThumb key={i} file={file} index={i} onRemove={() => {
                  const newImages = [...data.images];
                  newImages.splice(i, 1);
                  updateData({ images: newImages });
                }} />
              ))}
            </div>
          )}
          {data.images.length < 10 && (
            <Upload.Dragger
              showUploadList={false}
              multiple
              accept="image/*"
              beforeUpload={() => false}
              fileList={[]}
              onChange={({ fileList }) => {
                const newFiles = fileList.map(f => f.originFileObj as File).filter(Boolean);
                updateData({ images: [...data.images, ...newFiles].slice(0, 10) });
              }}
              className="!rounded-lg !border-dashed !border-gray-300 !bg-gray-50 !py-2"
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <PictureOutlined className="text-xl text-gray-300" />
                <p className="text-xs text-gray-500 m-0">Tải ảnh lên ({data.images.length}/10)</p>
              </div>
            </Upload.Dragger>
          )}
        </div>
      </div>
    </Modal>
  );
}
