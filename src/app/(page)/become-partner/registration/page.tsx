"use client";

import { useState, useMemo, useCallback } from "react";
import { Steps, Button, message } from "antd";
import {
  SolutionOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  initialFormData,
  type RegistrationFormData,
  type PersonalInfoData,
  type VerificationData,
  type BankData,
} from "@/components/become-partner/registration/registrationData";
import VerificationStep from "@/components/become-partner/registration/VerificationStep";
import PersonalInfoStep from "@/components/become-partner/registration/PersonalInfoStep";
import BankInfoStep from "@/components/become-partner/registration/BankInfoStep";
import ReviewStep from "@/components/become-partner/registration/ReviewStep";
import SuccessStep from "@/components/become-partner/registration/SuccessStep";

const stepItems = [
  { title: "Cá nhân", icon: <SolutionOutlined /> },
  { title: "Xác minh", icon: <SafetyCertificateOutlined /> },
  { title: "Ngân hàng", icon: <BankOutlined /> },
  { title: "Xem lại", icon: <CheckCircleOutlined /> },
];

// Validation helpers
function isStep0Valid(data: PersonalInfoData): boolean {
  return !!(
    data.fullName.trim() &&
    data.phone.trim() &&
    data.province &&
    data.district &&
    data.addressDetail.trim()
  );
}

function isStep1Valid(data: VerificationData): boolean {
  return !!(data.frontCCCD && data.backCCCD && data.selfie && data.agreed);
}

function isStep2Valid(data: BankData): boolean {
  return !!(
    data.accountHolder.trim() &&
    data.bankCode &&
    data.accountNumber.trim() &&
    data.accountNumberConfirm.trim() &&
    data.accountNumber === data.accountNumberConfirm
  );
}

export default function PartnerRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationFormData>(initialFormData);
  const [submitted, setSubmitted] = useState(false);
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

  const updateBank = useCallback(
    (data: Partial<BankData>) => {
      setFormData((prev) => ({
        ...prev,
        bank: { ...prev.bank, ...data },
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
        return isStep2Valid(formData.bank);
      case 3:
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

  const handleStepClick = (step: number) => {
    if (step <= highestStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    const apiBody = {
      personal: {
        fullName: formData.personal.fullName,
        phone: formData.personal.phone,
        accountType: formData.personal.accountType,
        province: formData.personal.province,
        district: formData.personal.district,
        addressDetail: formData.personal.addressDetail,
      },
      verification: {
        frontCCCD: formData.verification.frontCCCD?.name || null,
        backCCCD: formData.verification.backCCCD?.name || null,
        selfie: formData.verification.selfie?.name || null,
        agreed: formData.verification.agreed,
      },
      bank: {
        accountHolder: formData.bank.accountHolder,
        bankCode: formData.bank.bankCode,
        accountNumber: formData.bank.accountNumber,
        branch: formData.bank.branch,
        currency: formData.bank.currency,
        swift: formData.bank.swift,
        iban: formData.bank.iban,
      },
    };

    console.log("=== PARTNER REGISTRATION API BODY ===");
    console.log(JSON.stringify(apiBody, null, 2));

    // TODO: Replace with actual API call
    // const formPayload = new FormData();
    // formPayload.append("data", JSON.stringify(apiBody));
    // if (formData.verification.frontCCCD)
    //   formPayload.append("frontCCCD", formData.verification.frontCCCD);
    // if (formData.verification.backCCCD)
    //   formPayload.append("backCCCD", formData.verification.backCCCD);
    // if (formData.verification.selfie)
    //   formPayload.append("selfie", formData.verification.selfie);
    // if (formData.bank.proofFile)
    //   formPayload.append("bankProof", formData.bank.proofFile);
    // const res = await fetcher.post("/partner/register", formPayload);

    messageApi.success("Đăng ký thành công!");
    setSubmitted(true);
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
            accountType={formData.personal.accountType}
          />
        );
      case 2:
        return <BankInfoStep data={formData.bank} onChange={updateBank} />;
      case 3:
        return (
          <ReviewStep
            formData={formData}
            onSubmit={handleSubmit}
            onGoToStep={goToStep}
          />
        );
      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return "Tiếp tục";
      case 2:
        return "Kiểm tra & Hoàn tất";
      case 3:
        return "Gửi hồ sơ để duyệt";
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
              items={stepItems.map((item, index) => ({
                ...item,
                className:
                  index <= highestStep ? "clickable-step" : "disabled-step",
                onClick: () => handleStepClick(index),
              }))}
              className="registration-steps"
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
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              className="registration-btn-next"
              disabled={!canProceed}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
