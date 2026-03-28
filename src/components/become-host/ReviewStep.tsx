"use client";

import { useState, useMemo } from "react";
import { Button, Checkbox, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  FileProtectOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  AppstoreOutlined,
  DollarOutlined,
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
import {
  type RegistrationFormData,
  type CategoryItem,
  type RentalTypeItem,
  type AmenityItem,
  cancellationPolicyOptions,
  isPrivateRoomRentalType,
} from "./registrationData";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "../../../utils/fetcher";

interface ReviewStepProps {
  formData: RegistrationFormData;
  onSubmit: () => void;
  onGoToStep: (step: number) => void;
  submitting?: boolean;
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

export default function ReviewStep({ formData, onSubmit, onGoToStep, submitting, rentalTypes }: ReviewStepProps) {
  const { user } = useAuth();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const { personal, verification, propertyInfo, propertyAmenities, propertyPricing } = formData;

  const { data: amenities } = useQuery<AmenityItem[]>({
    queryKey: ["public-amenities"],
    queryFn: async () => {
      const res = await fetcher.get("/public/amenities");
      return res.data?.data ?? res.data;
    },
  });


  const frontUrl = useMemo(() => verification.frontCCCD ? URL.createObjectURL(verification.frontCCCD) : null, [verification.frontCCCD]);
  const backUrl = useMemo(() => verification.backCCCD ? URL.createObjectURL(verification.backCCCD) : null, [verification.backCCCD]);
  const licenseUrl = useMemo(() => verification.businessLicense ? URL.createObjectURL(verification.businessLicense) : null, [verification.businessLicense]);
  const imageUrls = useMemo(() => propertyAmenities.images.map((f) => URL.createObjectURL(f)), [propertyAmenities.images]);

  const isPrivateRoom = useMemo(() => {
    const selectedType = rentalTypes.find(r => r.id === propertyInfo.rentalTypeId);
    return isPrivateRoomRentalType(selectedType);
  }, [propertyInfo.rentalTypeId, rentalTypes]);

  const categoryLabel = useMemo(() => {
    const selectedType = rentalTypes.find(r => r.id === propertyInfo.rentalTypeId);
    if (!selectedType) return "—";
    const category = (selectedType.categoryResponses ?? []).find(c => c.id === propertyInfo.categoryId);
    return category?.name || "—";
  }, [rentalTypes, propertyInfo.rentalTypeId, propertyInfo.categoryId]);
  const rentalTypeLabel = (rentalTypes ?? []).find((r : RentalTypeItem) => r.id === propertyInfo.rentalTypeId)?.name || "—";
  const cancellationLabel = cancellationPolicyOptions.find((c) => c.value === propertyPricing.cancellationPolicyId)?.label || "—";
  const selectedAmenities = (amenities ?? []).filter((a : AmenityItem) => propertyAmenities.amenityIds.includes(a.id));
  const formatVND = (n: number | string) => Number(n || 0).toLocaleString("vi-VN") + " ₫";

  const EditBtn = ({ step }: { step: number }) => (
    <button
      className="bg-transparent border-none text-[#2DD4A8] text-[13px] font-medium cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-blue-50"
      onClick={() => onGoToStep(step)}
    >
      <EditOutlined /> Sửa
    </button>
  );

  const Info = ({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-1.5">
      {icon && <span className="text-gray-400 mt-0.5 text-sm">{icon}</span>}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="text-sm text-gray-900 font-medium">{value}</span>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kiểm tra lại hồ sơ</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vui lòng xem lại tất cả thông tin trước khi gửi hồ sơ đăng ký.
          </p>
        </div>

        {/* 1. Account */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-[#2DD4A8]" />
              <h3 className="text-sm font-semibold text-gray-900 m-0">Tài khoản</h3>
            </div>
          </div>
          <Info label="Email đăng nhập" value={user?.email || "—"} icon={<MailOutlined />} />
        </div>

        {/* 2. Personal + KYC */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <SafetyCertificateOutlined className="text-[#2DD4A8]" />
              <h3 className="text-sm font-semibold text-gray-900 m-0">Thông tin & Xác minh</h3>
            </div>
            <EditBtn step={0} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <Info label="Email CSKH" value={personal.supportEmail} icon={<MailOutlined />} />
            <Info label="SĐT kinh doanh" value={personal.businessPhone} icon={<PhoneOutlined />} />
            <Info label="Số CCCD" value={personal.identityCardNumber} icon={<IdcardOutlined />} />
            <Info label="Số GPKD" value={verification.businessLicenseNumber} icon={<FileProtectOutlined />} />
          </div>
          <div className="flex gap-3 flex-wrap mt-3 pt-3 border-t border-gray-50">
            {[
              { url: frontUrl, label: "CCCD trước" },
              { url: backUrl, label: "CCCD sau" },
              { url: licenseUrl, label: "GPKD" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <div className="w-[100px] h-[70px] rounded-lg bg-gray-100 overflow-hidden relative">
                  {item.url ? (
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex items-center justify-center h-full text-gray-300 text-xl"><IdcardOutlined /></span>
                  )}
                  {item.url && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">
                      <CheckCircleOutlined />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Property Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <HomeOutlined className="text-[#2DD4A8]" />
              <h3 className="text-sm font-semibold text-gray-900 m-0">Cơ sở lưu trú</h3>
            </div>
            <EditBtn step={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <Info label="Tên cơ sở" value={propertyInfo.name} icon={<HomeOutlined />} />
            <Info label="Loại hình" value={<Tag color="blue">{categoryLabel}</Tag>} />
            <Info label="Hình thức cho thuê" value={<Tag color="geekblue">{rentalTypeLabel}</Tag>} />
            <Info label="Vị trí" value={`${propertyInfo.addressDetail}, ${propertyInfo.ward}, ${propertyInfo.district}, ${propertyInfo.province}`} icon={<EnvironmentOutlined />} />
            <Info label="Vĩ độ" value={propertyInfo.latitude ?? "—"} />
            <Info label="Kinh độ" value={propertyInfo.longitude ?? "—"} />
          </div>
          {propertyInfo.description && (
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50 m-0 leading-relaxed line-clamp-3">
              {propertyInfo.description}
            </p>
          )}
        </div>

        {/* 4. Amenities + Images */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AppstoreOutlined className="text-[#2DD4A8]" />
              <h3 className="text-sm font-semibold text-gray-900 m-0">Tiện ích & Hình ảnh</h3>
            </div>
            <EditBtn step={3} />
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedAmenities.map((a : AmenityItem) => (
              <Tag key={a.id} color="blue" className="!rounded-full !text-xs !px-3 !py-0.5">
                <span className="inline-flex items-center gap-1">
                  {amenityIconMap[a.iconName] ? (() => {
                    const AmenityIcon = amenityIconMap[a.iconName];
                    return <AmenityIcon className="w-3.5 h-3.5" />;
                  })() : "✨"}
                  <span>{a.name}</span>
                </span>
              </Tag>
            ))}
          </div>
          {imageUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2 pt-3 border-t border-gray-50">
              {imageUrls.slice(0, 6).map((url, i) => (
                <div key={i} className="w-[80px] h-[60px] rounded-lg overflow-hidden bg-gray-100 relative">
                  <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-0.5 left-0.5 text-[8px] font-bold text-white bg-black/50 px-1 rounded">Bìa</span>
                  )}
                </div>
              ))}
              {imageUrls.length > 6 && (
                <div className="w-[80px] h-[60px] rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-500">+{imageUrls.length - 6}</span>
                </div>
              )}
            </div>
          )}
          {isPrivateRoom && propertyAmenities.rooms.length > 0 && (
             <div className="mt-4 pt-4 border-t border-gray-100">
               <h4 className="text-sm font-semibold text-gray-900 mb-3">Thông tin phòng ({propertyAmenities.rooms.length})</h4>
               <div className="flex flex-col gap-3">
                 {propertyAmenities.rooms.map((room, idx) => (
                   <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                     <div className="w-[80px] h-[60px] rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                       {room.images?.[0] ? <img src={URL.createObjectURL(room.images[0])} alt={room.name} className="w-full h-full object-cover"/> : null}
                     </div>
                     <div className="flex-1 min-w-0">
                       <h5 className="text-[13px] font-semibold text-gray-900 m-0 truncate">{room.name}</h5>
                       <div className="flex gap-2 text-[11px] text-gray-500 mt-1">
                          <span>👥 {room.maxGuests}</span>
                          <span>🛌 {room.numBeds}</span>
                          <span>🚿 {room.numBathrooms}</span>
                       </div>
                       <div className="text-[12px] font-semibold text-[#2DD4A8] mt-1">{formatVND(room.pricePerNight)}</div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}
        </div>

        {/* 5. Pricing */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <DollarOutlined className="text-[#2DD4A8]" />
              <h3 className="text-sm font-semibold text-gray-900 m-0">Giá & Chính sách</h3>
            </div>
            <EditBtn step={4} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {!isPrivateRoom && (
               <Info label="Giá / đêm" value={formatVND(propertyPricing.pricePerNight)} />
            )}
            <Info label="Phụ thu cuối tuần" value={`${propertyPricing.weekendSurchargePercentage}%`} />
            <Info label="Phí dọn dẹp" value={formatVND(propertyPricing.cleaningFee)} />
            <Info label="Đặt cọc" value={`${propertyPricing.depositPercentage}%`} />
            <Info label="Thanh toán tại nơi" value={propertyPricing.isPayAtCheckinAllowed ? "Có" : "Không"} />
            <Info label="Chính sách hủy" value={cancellationLabel} />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-5 sticky top-[100px] max-lg:static">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <CheckCircleOutlined className="text-lg text-[#2DD4A8]" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Xác nhận & Cam kết</h4>
          </div>
          <div className="flex gap-3 mb-4">
            <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}>
            </Checkbox>
            <span className="text-[13px] text-gray-700 leading-relaxed">
              Tôi đồng ý với{" "}
              <a href="/" className="text-[#2DD4A8] font-medium no-underline hover:underline">Điều khoản Dịch vụ</a>{" "}
              cho Chủ nhà.
            </span>
          </div>
          <div className="flex gap-3 mb-4">
            <Checkbox checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)}>
            </Checkbox>
            <span className="text-[13px] text-gray-700 leading-relaxed">
              Tôi đã đọc{" "}
              <a href="/" className="text-[#2DD4A8] font-medium no-underline hover:underline">Chính sách Bảo mật</a>.
            </span>
          </div>

          <div className="flex items-center gap-2 py-2.5 rounded-lg mb-4">
            <ClockCircleOutlined className="text-sm text-[#2DD4A8] shrink-0" />
            <span className="text-xs text-gray-900 font-medium">
              Xét duyệt dự kiến: 24 - 48 giờ làm việc.
            </span>
          </div>

          <Button
            type="primary"
            block
            size="large"
            className="!rounded-[10px] !font-semibold !h-11 !bg-[#2DD4A8] !border-[#2DD4A8] mb-2.5"
            disabled={!agreeTerms || !agreePrivacy || submitting}
            onClick={onSubmit}
            loading={submitting}
          >
            {submitting ? "Đang gửi hồ sơ..." : "Gửi hồ sơ để duyệt"}
          </Button>

          <p className="text-[11px] text-gray-400 text-center m-0 leading-relaxed">
            Bằng cách nhấn &quot;Gửi hồ sơ&quot;, bạn cam kết thông tin đã cung cấp là chính xác và trung thực.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <QuestionCircleOutlined className="text-lg text-amber-400" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Cần hỗ trợ?</h4>
          </div>
          <ul className="list-none p-0 m-0">
            {[
              'Hồ sơ bị từ chối sẽ kèm lý do chi tiết.',
              'Cập nhật thông tin sau khi hồ sơ được duyệt.',
              'Liên hệ: 1900 1234 (8:00 – 22:00).',
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
