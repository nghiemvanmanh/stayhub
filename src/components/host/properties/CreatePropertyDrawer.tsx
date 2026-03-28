"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Drawer,
  Input,
  InputNumber,
  Select,
  Upload,
  Checkbox,
  Switch,
  Button,
  Skeleton,
  message,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  HomeOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  PictureOutlined,
  DollarOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
  CloseOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Wifi, Tv, Microwave, WashingMachine, CircleParking, Snowflake, Briefcase,
  WavesLadder, Bath, Aperture, Drumstick, Flame, Dumbbell, FireExtinguisher,
  Disc3, BriefcaseMedical, Radar, type LucideIcon,
} from "lucide-react";
import {
  provinceData,
  cancellationPolicyOptions,
  type PropertyInfoData,
  type PropertyAmenitiesData,
  type PropertyPricingData,
  type RoomData,
  type RentalTypeItem,
  type AmenityItem,
  type PresignedUrlResponse,
} from "@/components/become-host/registrationData";
import RoomModal from "@/components/become-host/RoomModal";
import { fetcher } from "../../../../utils/fetcher";

const { TextArea } = Input;

interface CreatePropertyDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const amenityIconMap: Record<string, LucideIcon> = {
  Wifi, Tv, Microwave, WashingMachine, CircleParking, Snowflake, Briefcase,
  WavesLadder, Bath, Aperture, Drumstick, Flame, Dumbbell, FireExtinguisher,
  Disc3, BriefcaseMedical, Radar,
};

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
  const presignedData = (presigned as any).data || presigned;
  await fetch(presignedData.presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  return presignedData.publicUrl;
}

function ImageThumb({ file, onRemove, index }: { file: File; onRemove: () => void; index: number }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  return (
    <div className={`relative rounded-xl overflow-hidden border-2 border-[#2DD4A8] bg-blue-50 flex items-center justify-center ${index === 0 ? "col-span-2 row-span-2 min-h-[200px]" : "min-h-[100px]"}`}>
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

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
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

  const [propertyInfo, setPropertyInfo] = useState<PropertyInfoData>({
    name: "", description: "", categoryId: null, rentalTypeId: null,
    province: "", district: "", ward: "", addressDetail: "",
    latitude: null, longitude: null,
  });

  const [amenities, setAmenities] = useState<PropertyAmenitiesData>({
    amenityIds: [], images: [], rooms: [],
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

  const isPrivateRoom = useMemo(() => {
    const selectedType = rentalTypes.find(r => r.id === propertyInfo.rentalTypeId);
    return selectedType?.slug === "thue-theo-phong";
  }, [propertyInfo.rentalTypeId, rentalTypes]);

  const categoryOptions = useMemo(() => {
    if (!propertyInfo.rentalTypeId || !rentalTypes) return [];
    const selected = rentalTypes.find(r => r.id === propertyInfo.rentalTypeId);
    return (selected?.categoryResponses ?? []).map(c => ({ value: c.id, label: c.name }));
  }, [propertyInfo.rentalTypeId, rentalTypes]);

  const rentalTypeOptions = useMemo(() => rentalTypes.map(r => ({ value: r.id, label: r.name })), [rentalTypes]);
  const provinceOptions = useMemo(() => Object.keys(provinceData).map(p => ({ value: p, label: p })), []);
  const districtOptions = useMemo(() => {
    if (!propertyInfo.province || !provinceData[propertyInfo.province]) return [];
    return Object.keys(provinceData[propertyInfo.province]).map(d => ({ value: d, label: d }));
  }, [propertyInfo.province]);
  const wardOptions = useMemo(() => {
    if (!propertyInfo.province || !propertyInfo.district || !provinceData[propertyInfo.province]?.[propertyInfo.district]) return [];
    return provinceData[propertyInfo.province][propertyInfo.district].map(w => ({ value: w, label: w }));
  }, [propertyInfo.province, propertyInfo.district]);

  const updateInfo = useCallback((d: Partial<PropertyInfoData>) => setPropertyInfo(prev => ({ ...prev, ...d })), []);
  const updateAmenities = useCallback((d: Partial<PropertyAmenitiesData>) => setAmenities(prev => ({ ...prev, ...d })), []);
  const updatePricing = useCallback((d: Partial<PropertyPricingData>) => setPricing(prev => ({ ...prev, ...d })), []);

  const handleAmenityToggle = (id: number) => {
    const cur = amenities.amenityIds;
    updateAmenities({ amenityIds: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] });
  };

  const removeImage = (index: number) => {
    const imgs = [...amenities.images]; imgs.splice(index, 1);
    updateAmenities({ images: imgs });
  };

  const openRoomModal = (index: number | null = null) => { setEditingRoomIndex(index); setRoomModalVisible(true); };
  const handleSaveRoom = (room: RoomData) => {
    const rooms = [...amenities.rooms];
    editingRoomIndex !== null ? rooms[editingRoomIndex] = room : rooms.push(room);
    updateAmenities({ rooms });
    setRoomModalVisible(false); setEditingRoomIndex(null);
  };
  const handleDeleteRoom = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const rooms = [...amenities.rooms]; rooms.splice(i, 1);
    updateAmenities({ rooms });
  };

  const resetForm = () => {
    setPropertyInfo({ name: "", description: "", categoryId: null, rentalTypeId: null, province: "", district: "", ward: "", addressDetail: "", latitude: null, longitude: null });
    setAmenities({ amenityIds: [], images: [], rooms: [] });
    setPricing({ pricePerNight: 0, weekendSurchargePercentage: 0, cleaningFee: 0, isPayAtCheckinAllowed: false, depositPercentage: 50, cancellationPolicyId: null });
  };

  const canSubmit = useMemo(() => {
    const infoOk = !!(propertyInfo.name.trim() && propertyInfo.description.trim() && propertyInfo.categoryId && propertyInfo.rentalTypeId && propertyInfo.province && propertyInfo.district && propertyInfo.ward && propertyInfo.addressDetail.trim() && propertyInfo.latitude !== null && propertyInfo.longitude !== null);
    const amenitiesOk = amenities.amenityIds.length > 0 && amenities.images.length >= 5;
    const pricingOk = isPrivateRoom ? pricing.cancellationPolicyId !== null : (pricing.pricePerNight > 0 && pricing.cancellationPolicyId !== null);
    return infoOk && amenitiesOk && pricingOk;
  }, [propertyInfo, amenities, pricing, isPrivateRoom]);

  const handleSubmit = async () => {
    if (submitting || !canSubmit) return;
    setSubmitting(true);
    try {
      const imageUrls = await Promise.all(amenities.images.map(f => uploadFileToS3(f)));
      const roomsWithUrls = await Promise.all(amenities.rooms.map(async (room) => {
        const roomImageUrls = await Promise.all(room.images.map(f => uploadFileToS3(f)));
        return { ...room, imageUrls: roomImageUrls };
      }));

      const body = {
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
        imageUrls,
        ...(isPrivateRoom
          ? { rooms: roomsWithUrls.map(r => ({ name: r.name, description: r.description, pricePerNight: r.pricePerNight, maxGuests: r.maxGuests, numBeds: r.numBeds, numBathrooms: r.numBathrooms, amenityIds: r.amenityIds, imageUrls: r.imageUrls })) }
          : { pricePerNight: pricing.pricePerNight }),
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
        width="min(900px, 100vw)"
        open={open}
        onClose={onClose}
        closeIcon={<CloseOutlined />}
        footer={
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-gray-400">
              {amenities.images.length}/5 ảnh tối thiểu • {amenities.amenityIds.length} tiện ích
            </span>
            <div className="flex gap-3">
              <Button onClick={onClose} className="!rounded-lg">Hủy bỏ</Button>
              <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit} disabled={!canSubmit || submitting} loading={submitting}
                className="!bg-[#2DD4A8] !border-[#2DD4A8] !rounded-lg !font-semibold !px-6 hover:!bg-[#22b892]">
                {submitting ? "Đang tạo..." : "Đăng bài"}
              </Button>
            </div>
          </div>
        }
        styles={{ body: { background: "#f8f9fb", padding: "24px" } }}
      >
        <div className="flex flex-col gap-6">
          {/* SECTION 1: Property Info */}
          <Section icon={<HomeOutlined />} title="Thông tin cơ sở lưu trú">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Tên cơ sở lưu trú <span className="text-red-500">*</span></label>
                <Input size="large" placeholder="Ví dụ: Biệt thự Đồi Thông Đà Lạt" value={propertyInfo.name} onChange={e => updateInfo({ name: e.target.value })} maxLength={100} showCount />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Mô tả chi tiết <span className="text-red-500">*</span></label>
                <TextArea placeholder="Mô tả về không gian, vị trí, điểm nổi bật..." rows={4} value={propertyInfo.description} onChange={e => updateInfo({ description: e.target.value })} maxLength={2000} showCount />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Hình thức cho thuê <span className="text-red-500">*</span></label>
                  {loadingRentalTypes ? <Skeleton.Input active size="large" block /> : (
                    <Select size="large" placeholder="Chọn hình thức" options={rentalTypeOptions} value={propertyInfo.rentalTypeId ?? undefined}
                      onChange={v => { if (v !== propertyInfo.rentalTypeId) { updateInfo({ rentalTypeId: v, categoryId: null }); if (!rentalTypes.find(r => r.id === v)?.slug?.includes("phong")) updateAmenities({ rooms: [] }); } }} />
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Loại hình lưu trú <span className="text-red-500">*</span></label>
                  {loadingRentalTypes ? <Skeleton.Input active size="large" block /> : (
                    <Select size="large" placeholder="Chọn loại hình" options={categoryOptions} value={propertyInfo.categoryId ?? undefined}
                      onChange={v => updateInfo({ categoryId: v })} disabled={!propertyInfo.rentalTypeId || categoryOptions.length === 0} />
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* SECTION 2: Location */}
          <Section icon={<EnvironmentOutlined />} title="Vị trí">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                  <Select size="large" placeholder="Chọn tỉnh/TP" options={provinceOptions} value={propertyInfo.province || undefined}
                    onChange={v => updateInfo({ province: v, district: "", ward: "" })} showSearch filterOption={(i, o) => (o?.label ?? "").toLowerCase().includes(i.toLowerCase())} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Quận / Huyện <span className="text-red-500">*</span></label>
                  <Select size="large" placeholder="Chọn quận/huyện" options={districtOptions} value={propertyInfo.district || undefined}
                    onChange={v => updateInfo({ district: v, ward: "" })} disabled={!propertyInfo.province} showSearch filterOption={(i, o) => (o?.label ?? "").toLowerCase().includes(i.toLowerCase())} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Phường / Xã <span className="text-red-500">*</span></label>
                  <Select size="large" placeholder="Chọn phường/xã" options={wardOptions} value={propertyInfo.ward || undefined}
                    onChange={v => updateInfo({ ward: v })} disabled={!propertyInfo.district} showSearch filterOption={(i, o) => (o?.label ?? "").toLowerCase().includes(i.toLowerCase())} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
                <Input size="large" placeholder="Số nhà, tên đường..." value={propertyInfo.addressDetail} onChange={e => updateInfo({ addressDetail: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Vĩ độ (Latitude) <span className="text-red-500">*</span></label>
                  <InputNumber size="large" className="!w-full" placeholder="Ví dụ: 10.762622" min={-90} max={90} step={0.000001} value={propertyInfo.latitude} onChange={v => updateInfo({ latitude: v })} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Kinh độ (Longitude) <span className="text-red-500">*</span></label>
                  <InputNumber size="large" className="!w-full" placeholder="Ví dụ: 106.660172" min={-180} max={180} step={0.000001} value={propertyInfo.longitude} onChange={v => updateInfo({ longitude: v })} />
                </div>
              </div>
            </div>
          </Section>

          {/* SECTION 3: Amenities */}
          <Section icon={<AppstoreOutlined />} title="Tiện ích có sẵn">
            {loadingAmenities ? (
              <div className="grid grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton.Button key={i} active block style={{ height: 72, borderRadius: 12 }} />)}</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {amenityList.map(a => {
                  const sel = amenities.amenityIds.includes(a.id);
                  const Icon = amenityIconMap[a.iconName];
                  return (
                    <div key={a.id} className={`border-2 rounded-xl p-3 cursor-pointer transition-all text-center ${sel ? "border-[#2DD4A8] bg-[#e6faf4] shadow-sm" : "border-gray-200 hover:border-[#2DD4A8]"}`} onClick={() => handleAmenityToggle(a.id)}>
                      <Checkbox checked={sel} className="!hidden" />
                      <div className="text-2xl mb-1 flex items-center justify-center">{Icon ? <Icon className="w-6 h-6" /> : <AppstoreOutlined />}</div>
                      <span className="text-xs font-medium text-gray-700">{a.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {amenities.amenityIds.length > 0 && <p className="text-xs text-gray-400 mt-3 m-0">Đã chọn {amenities.amenityIds.length} tiện ích</p>}
          </Section>

          {/* SECTION 4: Images */}
          <Section icon={<PictureOutlined />} title="Hình ảnh cơ sở">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-400">Tối thiểu 5 ảnh, tối đa 20 ảnh</span>
              <span className="text-xs text-gray-500 font-medium">{amenities.images.length}/20</span>
            </div>
            {amenities.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-4">
                {amenities.images.map((file, i) => <ImageThumb key={i} file={file} index={i} onRemove={() => removeImage(i)} />)}
              </div>
            )}
            {amenities.images.length < 20 && (
              <Upload.Dragger showUploadList={false} multiple accept="image/*" beforeUpload={() => false} fileList={[]}
                onChange={({ fileList }) => { const f = fileList.map(f => f.originFileObj as File).filter(Boolean); updateAmenities({ images: [...amenities.images, ...f].slice(0, 20) }); }}
                className="!rounded-xl !border-2 !border-dashed !border-gray-300 !bg-gray-50 hover:!bg-[#e6faf4]">
                <div className="flex flex-col items-center text-center gap-1 py-4">
                  <div className="text-4xl text-gray-300 mb-2"><PictureOutlined /></div>
                  <p className="text-sm font-semibold text-gray-700 m-0">Kéo thả hoặc nhấp để tải ảnh lên</p>
                  <p className="text-xs text-gray-400 m-0">JPG, PNG — Ảnh đầu tiên sẽ là ảnh bìa</p>
                </div>
              </Upload.Dragger>
            )}
          </Section>

          {/* SECTION 5: Rooms (Conditional) */}
          {isPrivateRoom && (
            <Section icon={<AppstoreOutlined />} title="Thông tin phòng">
              <div className="flex flex-col gap-4">
                {amenities.rooms.map((room, i) => (
                  <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#2DD4A8] transition-colors cursor-pointer" onClick={() => openRoomModal(i)}>
                    <div className="w-[100px] h-[75px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {room.images?.[0] ? <img src={URL.createObjectURL(room.images[0])} alt={room.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-400"><PictureOutlined className="text-xl" /></div>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-[15px] font-semibold text-gray-900 m-0 truncate pr-2">{room.name}</h4>
                          <button className="text-red-500 hover:text-red-600 border-none bg-transparent cursor-pointer p-0 shrink-0" onClick={e => handleDeleteRoom(i, e)}><DeleteOutlined /></button>
                        </div>
                        <p className="text-xs text-gray-500 truncate m-0 mt-1">{room.description}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                        <span>👥 {room.maxGuests}</span><span>🛌 {room.numBeds}</span><span>🚿 {room.numBathrooms}</span>
                        <span className="font-semibold text-[#2DD4A8] ml-auto">{room.pricePerNight.toLocaleString()} ₫</span>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 border-2 border-dashed border-[#2DD4A8] text-[#2DD4A8] rounded-xl font-medium bg-transparent cursor-pointer hover:bg-[#e6faf4] transition-colors flex items-center justify-center gap-2"
                  onClick={() => openRoomModal(null)}>+ Thêm phòng mới</button>
              </div>
            </Section>
          )}

          {/* SECTION 6: Pricing */}
          <Section icon={<DollarOutlined />} title="Bảng giá">
            <div className="flex flex-col gap-4">
              <div className={`grid grid-cols-1 ${!isPrivateRoom ? "sm:grid-cols-2" : ""} gap-4`}>
                {!isPrivateRoom && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-medium text-gray-700">Giá mỗi đêm (VNĐ) <span className="text-red-500">*</span></label>
                    <InputNumber size="large" min={0} step={50000} value={pricing.pricePerNight} onChange={v => updatePricing({ pricePerNight: v || 0 })}
                      formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={v => Number(v?.replace(/,/g, "") || 0)} className="!w-full" placeholder="500,000" />
                    <span className="text-xs text-gray-400">Giá cơ bản cho ngày thường</span>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-gray-700">Phụ thu cuối tuần (%)</label>
                  <InputNumber size="large" min={0} max={100} value={pricing.weekendSurchargePercentage} onChange={v => updatePricing({ weekendSurchargePercentage: v || 0 })}
                    formatter={v => `${v}%`} parser={v => Number(v?.replace("%", "") || 0)} className="!w-full" placeholder="20" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Phí dọn dẹp (VNĐ)</label>
                <InputNumber size="large" min={0} step={50000} value={pricing.cleaningFee} onChange={v => updatePricing({ cleaningFee: v || 0 })}
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} parser={v => Number(v?.replace(/,/g, "") || 0)} className="!w-1/2" placeholder="200,000" />
              </div>
            </div>
          </Section>

          {/* SECTION 7: Payment & Deposit */}
          <Section icon={<PercentageOutlined />} title="Thanh toán & Đặt cọc">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900 m-0">Cho phép thanh toán khi nhận phòng</p>
                  <p className="text-xs text-gray-400 m-0 mt-1">Khách có thể trả tiền trực tiếp khi check-in</p>
                </div>
                <Switch checked={pricing.isPayAtCheckinAllowed} onChange={v => updatePricing({ isPayAtCheckinAllowed: v })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Tỉ lệ đặt cọc (%)</label>
                <InputNumber size="large" min={0} max={100} value={pricing.depositPercentage} onChange={v => updatePricing({ depositPercentage: v || 0 })}
                  formatter={v => `${v}%`} parser={v => Number(v?.replace("%", "") || 0)} className="!w-1/2" />
              </div>
            </div>
          </Section>

          {/* SECTION 8: Cancellation Policy */}
          <Section icon={<SafetyCertificateOutlined />} title="Chính sách hủy phòng">
            <div className="flex flex-col gap-3">
              {cancellationPolicyOptions.map(p => {
                const sel = pricing.cancellationPolicyId === p.value;
                return (
                  <div key={p.value} className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${sel ? "border-[#2DD4A8] bg-[#e6faf4] shadow-sm" : "border-gray-200 hover:border-[#2DD4A8]"}`}
                    onClick={() => updatePricing({ cancellationPolicyId: p.value })}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${sel ? "border-[#2DD4A8]" : "border-gray-300"}`}>
                        {sel && <div className="w-2.5 h-2.5 rounded-full bg-[#2DD4A8]" />}
                      </div>
                      <span className={`text-sm ${sel ? "font-semibold text-[#2DD4A8]" : "font-medium text-gray-700"}`}>{p.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        </div>
      </Drawer>

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
