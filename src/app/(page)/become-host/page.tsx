"use client";

import { useState, useMemo, useCallback } from "react";
import { Steps, Button, message } from "antd";
import {
  SolutionOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  initialFormData,
  type RegistrationFormData,
  type PersonalInfoData,
  type VerificationData,
  type PresignedUrlRequest,
  type PresignedUrlResponse,
} from "@/components/become-host/registrationData";
import VerificationStep from "@/components/become-host/VerificationStep";
import PersonalInfoStep from "@/components/become-host/PersonalInfoStep";
import ReviewStep from "@/components/become-host/ReviewStep";
import SuccessStep from "@/components/become-host/SuccessStep";
import { fetcher } from "../../../../utils/fetcher";

const stepItems = [
  { title: "Cá nhân", icon: <SolutionOutlined /> },
  { title: "Xác minh", icon: <SafetyCertificateOutlined /> },
  { title: "Xem lại", icon: <CheckCircleOutlined /> },
];

// Validation helpers
function isStep0Valid(data: PersonalInfoData): boolean {
  return !!(
    data.supportEmail.trim() &&
    data.businessPhone.trim() &&
    data.identityCardNumber.trim()
  );
}

function isStep1Valid(data: VerificationData): boolean {
  return !!(
    data.frontCCCD &&
    data.backCCCD &&
    data.businessLicenseNumber.trim() &&
    data.businessLicense &&
    data.agreed
  );
}

// Helper: get file extension and content type
function getFileInfo(file: File): PresignedUrlRequest {
  const name = file.name;
  const ext = name.substring(name.lastIndexOf(".")).toLowerCase();
  return { extension: ext, contentType: file.type || "application/octet-stream" };
}

// Helper: upload a single file via presigned URL
async function uploadFileToS3(file: File): Promise<string> {
  const fileInfo = getFileInfo(file);

  // 1. Get presigned URL
  const { data } = await fetcher.post<PresignedUrlResponse>("/files/presigned-url", {
    files: [fileInfo],
  });

  // Response is array when sending files array
  const presigned = Array.isArray(data) ? data[0] : data;
  console.log(presigned.data)
  // 2. PUT file to S3 via presigned URL (raw axios, no auth header)
  await fetch(presigned.data.presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  // 3. Return public URL
  return presigned.data.publicUrl;
}

export default function PartnerRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [highestStep, setHighestStep] = useState(0);

  const updatePersonal = useCallback(
    (data: Partial<PersonalInfoData>) => {
      setFormData((prev) => ({
        ...prev,
        personal: { ...prev.personal, ...data },
      }));
    },
    []
  );

  const updateVerification = useCallback(
    (data: Partial<VerificationData>) => {
      setFormData((prev) => ({
        ...prev,
        verification: { ...prev.verification, ...data },
      }));
    },
    []
  );

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return isStep0Valid(formData.personal);
      case 1:
        return isStep1Valid(formData.verification);
      case 2:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleNext = () => {
    if (!canProceed) return;
    if (currentStep < stepItems.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (next > highestStep) setHighestStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStepChange = (step: number) => {
    if (step <= highestStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const { personal, verification } = formData;

      // Step 1: Upload 3 files in parallel via presigned URLs
      const [identityCardFrontUrl, identityCardBackUrl, businessLicenseUrl] =
        await Promise.all([
          uploadFileToS3(verification.frontCCCD!),
          uploadFileToS3(verification.backCCCD!),
          uploadFileToS3(verification.businessLicense!),
        ]);
       console.log({identityCardFrontUrl, identityCardBackUrl, businessLicenseUrl})
      // Step 2: Submit registration
      const apiBody = {
        businessPhone: personal.businessPhone,
        supportEmail: personal.supportEmail,
        identityCardNumber: personal.identityCardNumber,
        identityCardFrontUrl,
        identityCardBackUrl,
        businessLicenseNumber: verification.businessLicenseNumber,
        businessLicenseUrl,
      };

      console.log("=== PARTNER REGISTRATION API BODY ===");
      console.log(JSON.stringify(apiBody, null, 2));

      await fetcher.post("/auth/host-applications", apiBody);

      messageApi.success("Đăng ký thành công!");
      setSubmitted(true);
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      const err = error as { response?: { data?: { message?: string } } };
      messageApi.error(
        err?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      case 0:
        return (
          <PersonalInfoStep data={formData.personal} onChange={updatePersonal} />
        );
      case 1:
        return (
          <VerificationStep
            data={formData.verification}
            onChange={updateVerification}
          />
        );
      case 2:
        return (
          <ReviewStep
            formData={formData}
            onSubmit={handleSubmit}
            onGoToStep={goToStep}
            submitting={submitting}
          />
        );
      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return "Kiểm tra & Hoàn tất";
      case 2:
        return ;
      default:
        return "Tiếp theo";
    }
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-[calc(100vh-64px-57px)] flex flex-col">
        {/* Steps */}
        <div className="bg-white border-b border-gray-200 py-5">
          <div className="max-w-[700px] mx-auto px-6">
            <Steps
              current={currentStep}
              onChange={handleStepChange}
              items={stepItems.map((item, index) => ({
                ...item,
                className:
                  index <= highestStep ? "cursor-pointer" : "cursor-not-allowed",
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
              onClick={currentStep === 2 ? handleSubmit : handleNext}
              className="!min-w-[180px] !h-[42px] !rounded-[10px] !font-semibold !text-sm"
              disabled={!canProceed || submitting}
              loading={submitting && currentStep === 2}
              hidden={currentStep === 2}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
