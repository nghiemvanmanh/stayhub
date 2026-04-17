"use client";

import { useState, useMemo, useCallback } from "react";
import { Steps, Button, message } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  SolutionOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  AppstoreOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  initialFormData,
  isPrivateRoomRentalType,
  isEntirePlaceRentalType,
  type RegistrationFormData,
  type PersonalInfoData,
  type VerificationData,
  type PropertyInfoData,
  type PropertyAmenitiesData,
  type PropertyPricingData,
  type PresignedUrlResponse,
  type RentalTypeItem,
} from "@/components/common/property-form/propertyData";
import PersonalInfoStep from "@/components/become-host/PersonalInfoStep";
import VerificationStep from "@/components/become-host/VerificationStep";
import PropertyInfoStep from "@/components/become-host/PropertyInfoStep";
import PropertyAmenitiesStep from "@/components/become-host/PropertyAmenitiesStep";
import PropertyPricingStep from "@/components/become-host/PropertyPricingStep";
import ReviewStep from "@/components/become-host/ReviewStep";
import SuccessStep from "@/components/become-host/SuccessStep";
import { fetcher } from "@/utils/fetcher";
import { validateEmail, validatePhone, validateCCCD, validateBusinessLicense, validatePrice } from "@/constants/validation";

const stepItems = [
  { title: "Cá nhân", icon: <SolutionOutlined /> },
  { title: "Xác minh", icon: <SafetyCertificateOutlined /> },
  { title: "Cơ sở", icon: <HomeOutlined /> },
  { title: "Tiện ích", icon: <AppstoreOutlined /> },
  { title: "Giá cả", icon: <DollarOutlined /> },
  { title: "Xem lại", icon: <CheckCircleOutlined /> },
];

// === Validation helpers ===
function isStep0Valid(d: PersonalInfoData): boolean {
  return validateEmail(d.supportEmail).isValid && validatePhone(d.businessPhone).isValid && validateCCCD(d.identityCardNumber).isValid;
}

function isStep1Valid(d: VerificationData): boolean {
  return !!(d.frontCCCD && d.backCCCD && validateBusinessLicense(d.businessLicenseNumber).isValid && d.businessLicense && d.agreed);
}

function isStep2Valid(d: PropertyInfoData): boolean {
  return !!(
    d.name.trim() &&
    d.description.trim() &&
    d.categoryId &&
    d.rentalTypeId &&
    d.province &&
    d.district &&
    d.ward &&
    d.addressDetail.trim() &&
    d.latitude !== null &&
    d.longitude !== null
  );
}

function isStep3Valid(d: PropertyAmenitiesData, isEntirePlace: boolean): boolean {
  const base = d.amenityIds.length > 0 && d.images.length >= 5;
  if (isEntirePlace) {
    return base && d.entirePlace.maxGuests >= 1 && d.entirePlace.numBeds >= 1;
  }
  return base;
}

function isStep4Valid(d: PropertyPricingData, isPrivateRoom: boolean): boolean {
  if (isPrivateRoom) return !!d.cancellationPolicyId;
  return validatePrice(d.pricePerNight).isValid && !!d.cancellationPolicyId;
}

// === File upload helper ===
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

export default function PartnerRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [highestStep, setHighestStep] = useState(0);

  // === Updaters ===
  const updatePersonal = useCallback(
    (data: Partial<PersonalInfoData>) =>
      setFormData((prev) => ({ ...prev, personal: { ...prev.personal, ...data } })),
    []
  );
  const updateVerification = useCallback(
    (data: Partial<VerificationData>) =>
      setFormData((prev) => ({ ...prev, verification: { ...prev.verification, ...data } })),
    []
  );
  const updatePropertyInfo = useCallback(
    (data: Partial<PropertyInfoData>) =>
      setFormData((prev) => ({ ...prev, propertyInfo: { ...prev.propertyInfo, ...data } })),
    []
  );
  const updatePropertyAmenities = useCallback(
    (data: Partial<PropertyAmenitiesData>) =>
      setFormData((prev) => ({ ...prev, propertyAmenities: { ...prev.propertyAmenities, ...data } })),
    []
  );
  const updatePropertyPricing = useCallback(
    (data: Partial<PropertyPricingData>) =>
      setFormData((prev) => ({ ...prev, propertyPricing: { ...prev.propertyPricing, ...data } })),
    []
  );

  // === Fetch Categories/Rental Types For Validation & Passing Props ===
  const { data: rentalTypesData } = useQuery<RentalTypeItem[]>({
    queryKey: ["public-rental-types"],
    queryFn: async () => {
      const res = await fetcher.get("/public/rental-types");
      return res.data?.data ?? res.data;
    },
  });
  const rentalTypes = rentalTypesData ?? [];

  // === Validation ===
  const canProceed = useMemo(() => {
    const selectedType = rentalTypes.find(r => r.id === formData.propertyInfo.rentalTypeId);
    const isPrivateRoom = isPrivateRoomRentalType(selectedType);
    const isEntirePlace = isEntirePlaceRentalType(selectedType);
    switch (currentStep) {
      case 0: return isStep0Valid(formData.personal);
      case 1: return isStep1Valid(formData.verification);
      case 2: return isStep2Valid(formData.propertyInfo);
      case 3: return isStep3Valid(formData.propertyAmenities, isEntirePlace);
      case 4: return isStep4Valid(formData.propertyPricing, isPrivateRoom);
      case 5: return true;
      default: return false;
    }
  }, [currentStep, formData, rentalTypes]);

  // === Navigation ===
  const handleNext = () => {
    if (!canProceed) return;
    if (currentStep < stepItems.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > highestStep) setHighestStep(next);
      setTimeout(() => window.scrollTo(0, 0), 10);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setTimeout(() => window.scrollTo(0, 0), 10);
    }
  };

  const handleStepChange = (step: number) => {
    if (step <= highestStep) {
      setCurrentStep(step);
      setTimeout(() => window.scrollTo(0, 0), 10);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setTimeout(() => window.scrollTo(0, 0), 10);
  };

  // === Submit ===
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const { personal, verification, propertyInfo, propertyAmenities, propertyPricing } = formData;

      // 1. Upload host verification files (3 files in parallel)
      const [identityCardFrontUrl, identityCardBackUrl, businessLicenseUrl] = await Promise.all([
        uploadFileToS3(verification.frontCCCD!),
        uploadFileToS3(verification.backCCCD!),
        uploadFileToS3(verification.businessLicense!),
      ]);

      // 2. Upload property images (all in parallel)
      const imageUrls = await Promise.all(
        propertyAmenities.images.map((file) => uploadFileToS3(file as File))
      );

      // 3. Upload room images in parallel
      const roomsWithImageUrls = await Promise.all(
        propertyAmenities.rooms.map(async (room) => {
          const roomImageUrls = await Promise.all(
             room.images.map((file) => uploadFileToS3(file as File))
          );
          return {
             ...room,
             imageUrls: roomImageUrls,
          };
        })
      );

      // 4. Determine rental type
      const selectedType = rentalTypes.find(r => r.id === propertyInfo.rentalTypeId);
      const isEntirePlace = isEntirePlaceRentalType(selectedType);

      // 5. Build rooms array based on rental type
      let finalRooms;
      if (isEntirePlace) {
        // Entire place: create 1 room from entirePlace data + pricePerNight
        finalRooms = [{
          name: propertyInfo.name,
          description: propertyInfo.description,
          pricePerNight: Number(propertyPricing.pricePerNight) || 0,
          maxGuests: propertyAmenities.entirePlace.maxGuests,
          numBeds: propertyAmenities.entirePlace.numBeds,
          numBathrooms: propertyAmenities.entirePlace.numBathrooms,
          numBedrooms: propertyAmenities.entirePlace.numBedrooms,
          amenityIds: propertyAmenities.amenityIds,
          imageUrls: imageUrls,
        }];
      } else {
        finalRooms = roomsWithImageUrls.map(r => ({
          name: r.name,
          description: r.description,
          pricePerNight: r.pricePerNight,
          maxGuests: r.maxGuests,
          numBeds: r.numBeds,
          numBathrooms: r.numBathrooms,
          amenityIds: r.amenityIds,
          imageUrls: r.imageUrls,
        }));
      }

      // 6. Construct unified payload
      const hostBody = {
        hostDetails: {
          businessPhone: personal.businessPhone,
          supportEmail: personal.supportEmail,
          identityCardNumber: personal.identityCardNumber,
          identityCardFrontUrl,
          identityCardBackUrl,
          businessLicenseNumber: verification.businessLicenseNumber,
          businessLicenseUrl,
        },
        firstProperty: {
          rentalTypeId: propertyInfo.rentalTypeId,
          categoryId: propertyInfo.categoryId,
          amenityIds: propertyAmenities.amenityIds,
          province: propertyInfo.province,
          district: propertyInfo.district,
          ward: propertyInfo.ward,
          addressDetail: propertyInfo.addressDetail,
          latitude: propertyInfo.latitude,
          longitude: propertyInfo.longitude,
          name: propertyInfo.name,
          description: propertyInfo.description,
          cancellationPolicyId: propertyPricing.cancellationPolicyId,
          isPayAtCheckinAllowed: propertyPricing.isPayAtCheckinAllowed,
          depositPercentage: propertyPricing.depositPercentage,
          weekendSurchargePercentage: propertyPricing.weekendSurchargePercentage,
          cleaningFee: propertyPricing.cleaningFee,
          roomCount: isEntirePlace ? propertyAmenities.entirePlace.roomCount : null,
          imageUrls,
          rooms: finalRooms,
        }
      };
      await fetcher.post("/auth/host-applications", hostBody);

      messageApi.success("Đăng ký đối tác & tạo cơ sở thành công!");
      setSubmitted(true);
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      messageApi.error(err?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  // === Render ===
  if (submitted) {
    return (
      <>
        {contextHolder}
        <div className="min-h-[calc(100vh-64px-57px)] flex flex-col">
          <div className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-8 pb-10">
            <SuccessStep />
          </div>
        </div>
      </>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return <PersonalInfoStep data={formData.personal} onChange={updatePersonal} />;
      case 1: return <VerificationStep data={formData.verification} onChange={updateVerification} />;
      case 2: return <PropertyInfoStep data={formData.propertyInfo} onChange={updatePropertyInfo} />;
      case 3: return <PropertyAmenitiesStep data={formData.propertyAmenities} onChange={updatePropertyAmenities} rentalTypeId={formData.propertyInfo.rentalTypeId} rentalTypes={rentalTypes} />;
      case 4: return <PropertyPricingStep data={formData.propertyPricing} onChange={updatePropertyPricing} rentalTypeId={formData.propertyInfo.rentalTypeId} rentalTypes={rentalTypes} />;
      case 5: return <ReviewStep formData={formData} onSubmit={handleSubmit} onGoToStep={goToStep} submitting={submitting} rentalTypes={rentalTypes} />;
      default: return null;
    }
  };

  const getButtonText = () => {
    if (currentStep === stepItems.length - 2) return "Kiểm tra & Hoàn tất";
    if (currentStep === stepItems.length - 1) return submitting ? "Đang gửi..." : "Gửi hồ sơ";
    return "Tiếp theo";
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-[calc(100vh-64px-57px)] flex flex-col">
        {/* Steps */}
        <div className="bg-white border-b border-gray-200 py-5">
          <div className="max-w-[860px] mx-auto px-6">
            <Steps
              current={currentStep}
              onChange={handleStepChange}
              size="small"
              items={stepItems.map((item, index) => ({
                ...item,
                className: index <= highestStep ? "cursor-pointer" : "cursor-not-allowed",
                disabled: index > highestStep,
              }))}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-8 pb-10">
          {renderStepContent()}
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 py-4 sticky bottom-0 z-10">
          <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="text-sm font-medium !text-gray-600 px-2"
            >
              Quay lại
            </Button>
            <Button
              type="primary"
              onClick={currentStep === stepItems.length - 1 ? handleSubmit : handleNext}
              className="!min-w-[180px] !h-[42px] !rounded-[10px] !font-semibold !text-sm"
              disabled={!canProceed || submitting}
              loading={submitting && currentStep === stepItems.length - 1}
              hidden={currentStep === stepItems.length - 1}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
