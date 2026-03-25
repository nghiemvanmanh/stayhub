// Types matching BE API: POST /auth/host-applications

export interface PersonalInfoData {
  supportEmail: string;
  businessPhone: string;
  identityCardNumber: string;
}

export interface VerificationData {
  frontCCCD: File | null;
  backCCCD: File | null;
  businessLicenseNumber: string;
  businessLicense: File | null;
  agreed: boolean;
}

export interface RegistrationFormData {
  personal: PersonalInfoData;
  verification: VerificationData;
}

export const initialFormData: RegistrationFormData = {
  personal: {
    supportEmail: "",
    businessPhone: "",
    identityCardNumber: "",
  },
  verification: {
    frontCCCD: null,
    backCCCD: null,
    businessLicenseNumber: "",
    businessLicense: null,
    agreed: false,
  },
};

// Presigned URL types
export interface PresignedUrlRequest {
  extension: string;
  contentType: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
}
