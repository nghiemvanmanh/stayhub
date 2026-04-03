"use client";

import { useState, useCallback } from "react";
import {
  Drawer,
  Button,
  InputNumber,
  message,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  HomeOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  PictureOutlined,
  DollarOutlined,
  CloseOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { PropertyInfoFields } from "@/components/common/property-form/PropertyInfoFields";
import { PropertyLocationFields } from "@/components/common/property-form/PropertyLocationFields";
import { PropertyAmenitiesFields } from "@/components/common/property-form/PropertyAmenitiesFields";
import { PropertyImagesFields } from "@/components/common/property-form/PropertyImagesFields";
import { PropertyRoomsFields } from "@/components/common/property-form/PropertyRoomsFields";
import { PropertyPricingFields } from "@/components/common/property-form/PropertyPricingFields";
import { usePropertyValidation } from "@/components/common/property-form/usePropertyValidation";
import {
  type PropertyInfoData,
  type PropertyAmenitiesData,
  type PropertyPricingData,
  type RoomData,
  type RentalTypeItem,
  type AmenityItem,
  type PresignedUrlResponse,
  type EntirePlaceData,
  isEntirePlaceRentalType,
} from "@/components/common/property-form/propertyData";
import RoomModal from "@/components/become-host/RoomModal";
import { fetcher } from "../../../../utils/fetcher";
interface CreatePropertyDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
 
function getFileInfo(file: File) {
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  return { extension: ext, contentType: file.type || "application/octet-stream" };
}

async function uploadFileToS3(file: File): Promise<string> {
  const fileInfo = getFileInfo(file);
  const { data } = await fetcher.post<PresignedUrlResponse>("/files/presigned-url", {
    files: [fileInfo],
  });
  const presigned = Array.isArray(data) ? data[0] : data;
  const presignedData = (presigned as Record<string, unknown>).data || presigned;
  await fetch(presignedData.presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  return presignedData.publicUrl;
}
 
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4 md:mb-5">
        <span className="text-lg text-[#2DD4A8]">{icon}</span>
        <h3 className="text-base font-semibold text-gray-900 m-0">{title}</h3>
      </div>
      {children}
    </div>
  );
}
 
export default function CreatePropertyDrawer({ open, onClose, onSuccess }: CreatePropertyDrawerProps) {
  const [messageApi, contextHolder] = message.useMessage();
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    if (!touched[field]) setTouched(prev => ({ ...prev, [field]: true }));
  };

  const [propertyInfo, setPropertyInfo] = useState<PropertyInfoData>({
    name: "", description: "", categoryId: null, rentalTypeId: null,
    province: "", district: "", ward: "", addressDetail: "",
    latitude: null, longitude: null,
  });

  const [amenities, setAmenities] = useState<PropertyAmenitiesData>({
    amenityIds: [], images: [], rooms: [],
    entirePlace: { maxGuests: 1, numBedrooms: 1, numBeds: 1, numBathrooms: 1, roomCount: 1 },
  });

  const [pricing, setPricing] = useState<PropertyPricingData>({
    pricePerNight: 0, weekendSurchargePercentage: 0, cleaningFee: 0,
    isPayAtCheckinAllowed: false, depositPercentage: 50, cancellationPolicyId: null,
  });

  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);

  const { data: rentalTypesData, isLoading: loadingRentalTypes } = useQuery<RentalTypeItem[]>({
    queryKey: ["public-rental-types"],
    queryFn: async () => {
      const res = await fetcher.get("/public/rental-types");
      return res.data?.data ?? res.data;
    },
  });
  const rentalTypes = rentalTypesData ?? [];

  const { data: amenitiesData, isLoading: loadingAmenities } = useQuery<AmenityItem[]>({
    queryKey: ["public-amenities"],
    queryFn: async () => {
      const res = await fetcher.get("/public/amenities");
      return res.data?.data ?? res.data;
    },
  });
  const amenityList = amenitiesData ?? [];

 

  const updateInfo = useCallback((d: Partial<PropertyInfoData>) => setPropertyInfo(prev => ({ ...prev, ...d })), []);
  const updateAmenities = useCallback((d: Partial<PropertyAmenitiesData>) => setAmenities(prev => ({ ...prev, ...d })), []);
  const updatePricing = useCallback((d: Partial<PropertyPricingData>) => setPricing(prev => ({ ...prev, ...d })), []);

  const openRoomModal = (index: number | null = null) => { setEditingRoomIndex(index); setRoomModalVisible(true); };
  const handleSaveRoom = (room: RoomData) => {
    const rooms = [...amenities.rooms];
    if (editingRoomIndex !== null) {
      rooms[editingRoomIndex] = room;
    } else {
      rooms.push(room);
    }
    updateAmenities({ rooms });
    setRoomModalVisible(false); setEditingRoomIndex(null);
  };
  const handleDeleteRoom = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const rooms = [...amenities.rooms]; rooms.splice(i, 1);
    updateAmenities({ rooms });
  };

  const selectedRentalType = rentalTypes.find(r => r.id === propertyInfo.rentalTypeId);
  const isEntirePlace = isEntirePlaceRentalType(selectedRentalType);

  const updateEntirePlace = (partial: Partial<EntirePlaceData>) => {
    setAmenities(prev => ({ ...prev, entirePlace: { ...prev.entirePlace, ...partial } }));
  };

  const resetForm = () => {
    setPropertyInfo({ name: "", description: "", categoryId: null, rentalTypeId: null, province: "", district: "", ward: "", addressDetail: "", latitude: null, longitude: null });
    setAmenities({ amenityIds: [], images: [], rooms: [], entirePlace: { maxGuests: 1, numBedrooms: 1, numBeds: 1, numBathrooms: 1, roomCount: 1 } });
    setPricing({ pricePerNight: 0, weekendSurchargePercentage: 0, cleaningFee: 0, isPayAtCheckinAllowed: false, depositPercentage: 50, cancellationPolicyId: null });
    setTouched({});
  };

  const { errors, canSubmit, isPrivateRoom } = usePropertyValidation({
    propertyInfo,
    amenities,
    pricing,
    touched,
    rentalTypes,
  });

  const handleSubmit = async () => {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    try {
      const uploadOrGetUrl = async (f: string | File) => typeof f === "string" ? f : await uploadFileToS3(f);
      const imageUrls = await Promise.all(amenities.images.map(f => uploadOrGetUrl(f)));
      const roomsWithUrls = await Promise.all(amenities.rooms.map(async (room) => {
        const roomImageUrls = await Promise.all(room.images.map(f => uploadOrGetUrl(f)));
        return { ...room, imageUrls: roomImageUrls };
      }));

      // Build rooms based on rental type
      let finalRooms;
      if (isEntirePlace) {
        finalRooms = [{
          name: propertyInfo.name,
          description: propertyInfo.description,
          pricePerNight: Number(pricing.pricePerNight) || 0,
          maxGuests: amenities.entirePlace.maxGuests,
          numBeds: amenities.entirePlace.numBeds,
          numBathrooms: amenities.entirePlace.numBathrooms,
          numBedrooms: amenities.entirePlace.numBedrooms,
          amenityIds: amenities.amenityIds,
          imageUrls: imageUrls,
        }];
      } else if (isPrivateRoom) {
        finalRooms = roomsWithUrls.map(r => ({
          name: r.name, description: r.description, pricePerNight: r.pricePerNight,
          maxGuests: r.maxGuests, numBeds: r.numBeds, numBathrooms: r.numBathrooms,
          amenityIds: r.amenityIds, imageUrls: r.imageUrls,
        }));
      }

      const body: Record<string, unknown> = {
        rentalTypeId: propertyInfo.rentalTypeId,
        categoryId: propertyInfo.categoryId,
        amenityIds: amenities.amenityIds,
        province: propertyInfo.province,
        district: propertyInfo.district,
        ward: propertyInfo.ward,
        addressDetail: propertyInfo.addressDetail,
        latitude: propertyInfo.latitude,
        longitude: propertyInfo.longitude,
        name: propertyInfo.name,
        description: propertyInfo.description,
        weekendSurchargePercentage: pricing.weekendSurchargePercentage,
        cleaningFee: pricing.cleaningFee,
        roomCount: isEntirePlace ? amenities.entirePlace.roomCount : (finalRooms ? finalRooms.length : 0),
        imageUrls,
        rooms: finalRooms || [],
      };

      await fetcher.post("/properties", body);
      messageApi.success("Tạo cơ sở lưu trú thành công!");
      resetForm();
      onSuccess();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      messageApi.error(err?.response?.data?.message || "Tạo bài đăng thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title={
          <div>
            <h2 className="text-xl font-bold text-gray-900 m-0">Tạo bài đăng mới</h2>
            <p className="text-xs text-gray-400 m-0 mt-1">Điền đầy đủ thông tin để đăng cơ sở lưu trú</p>
          </div>
        }
        placement="right"
        size="large"
        open={open}
        onClose={onClose}
        closeIcon={<CloseOutlined />}
        footer={
          <div className="flex flex-col md:flex-row md:items-center justify-between py-2 gap-3">
            <span className="text-xs text-gray-400">
              {amenities.images.length}/5 ảnh tối thiểu • {amenities.amenityIds.length} tiện ích
            </span>
            <div className="flex gap-3 w-full md:w-auto">
              <Button onClick={onClose} className="!rounded-lg flex-1 md:flex-none">Hủy bỏ</Button>
              <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} disabled={!canSubmit || submitting} loading={submitting}
                className="!bg-[#2DD4A8] !border-[#2DD4A8] !rounded-lg !font-semibold !px-6 hover:!bg-[#22b892] flex-1 md:flex-none">
                {submitting ? "Đang tạo..." : "Đăng bài"}
              </Button>
            </div>
          </div>
        }
        styles={{ body: { background: "#f8f9fb", padding: "16px md:24px" } }}
      >
        <div className="flex flex-col gap-6">
          {/* SECTION 1: Property Info */}
          <Section icon={<HomeOutlined />} title="Thông tin cơ sở lưu trú">
            <PropertyInfoFields
              data={propertyInfo}
              onChange={updateInfo}
              errors={errors}
              touched={touched}
              markTouched={markTouched}
              rentalTypes={rentalTypes}
              loadingRentalTypes={loadingRentalTypes}
            />
          </Section>

          {/* SECTION 2: Location */}
          <Section icon={<EnvironmentOutlined />} title="Vị trí">
            <PropertyLocationFields
              data={propertyInfo}
              onChange={updateInfo}
              errors={errors}
              touched={touched}
              markTouched={markTouched}
            />
          </Section>

          {/* SECTION 3: Amenities */}
          <Section icon={<AppstoreOutlined />} title="Tiện ích có sẵn">
            <PropertyAmenitiesFields
              data={amenities}
              onChange={updateAmenities}
              amenityList={amenityList}
              loadingAmenities={loadingAmenities}
            />
          </Section>

          {/* SECTION 4: Images */}
          <Section icon={<PictureOutlined />} title="Hình ảnh cơ sở">
            <PropertyImagesFields
              data={amenities}
              onChange={updateAmenities}
            />
          </Section>

          {/* SECTION 5a: Entire Place Info (Conditional) */}
          {isEntirePlace && (
            <Section icon={<HomeOutlined />} title="Thông tin chỗ ở">
              <p className="text-xs text-gray-400 mb-4 -mt-2">
                Nhập thông tin tổng thể cho toàn bộ chỗ ở của bạn.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {([
                  { label: "Số phòng", field: "roomCount" as const, min: 1 },
                  { label: "Khách tối đa", field: "maxGuests" as const, min: 1 },
                  { label: "Số phòng ngủ", field: "numBedrooms" as const, min: 0 },
                  { label: "Số giường", field: "numBeds" as const, min: 1 },
                  { label: "Số phòng tắm", field: "numBathrooms" as const, min: 0 },
                ] as const).map(({ label, field, min }) => (
                  <div key={field} className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-gray-700">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <InputNumber
                      size="large"
                      min={min}
                      max={50}
                      value={amenities.entirePlace[field]}
                      onChange={(v) => updateEntirePlace({ [field]: v ?? min })}
                      className="!w-full"
                    />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* SECTION 5b: Rooms (Private Room Only) */}
          {isPrivateRoom && (
            <Section icon={<AppstoreOutlined />} title="Thông tin phòng">
              <PropertyRoomsFields
                data={amenities}
                onOpenRoomModal={openRoomModal}
                onDeleteRoom={handleDeleteRoom}
              />
            </Section>
          )}

          {/* SECTION 6: Pricing */}
          <Section icon={<DollarOutlined />} title="Giá & Chính sách">
            <PropertyPricingFields
              data={pricing}
              onChange={updatePricing}
              errors={errors}
              touched={touched}
              markTouched={markTouched}
              isPrivateRoom={isPrivateRoom}
            />
          </Section>
        </div>
      </Drawer>

      {/* Reusing existing RoomModal without modifying it */}
      <RoomModal
        visible={roomModalVisible}
        onCancel={() => { setRoomModalVisible(false); setEditingRoomIndex(null); }}
        onSave={handleSaveRoom}
        initialData={editingRoomIndex !== null ? amenities.rooms[editingRoomIndex] : undefined}
        amenities={amenityList}
      />
    </>
  );
}
