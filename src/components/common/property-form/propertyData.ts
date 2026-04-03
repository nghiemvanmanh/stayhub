// Types matching BE API:
// POST /auth/host-applications (combined host + firstProperty)

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

export interface EntirePlaceData {
  maxGuests: number;
  numBedrooms: number;
  numBeds: number;
  numBathrooms: number;
  roomCount: number;
}

export interface RoomData {
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  numBeds: number;
  numBathrooms: number;
  amenityIds: number[];
  images: (File | string)[];
}

export interface PropertyInfoData {
  name: string;
  description: string;
  categoryId: number | null | any;
  rentalTypeId: number | null;
  province: string;
  district: string;
  ward: string;
  addressDetail: string;
  latitude: number | string | null;
  longitude: number | string | null;
}

export interface PropertyAmenitiesData {
  amenityIds: number[];
  images: (File | string)[];
  rooms: RoomData[];
  entirePlace: EntirePlaceData;
}

export interface PropertyPricingData {
  pricePerNight: number | string;
  weekendSurchargePercentage: number | string;
  cleaningFee: number | string;
  isPayAtCheckinAllowed: boolean;
  depositPercentage: number | string;
  cancellationPolicyId: number | null;
}

export interface RegistrationFormData {
  personal: PersonalInfoData;
  verification: VerificationData;
  propertyInfo: PropertyInfoData;
  propertyAmenities: PropertyAmenitiesData;
  propertyPricing: PropertyPricingData;
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
  propertyInfo: {
    name: "",
    description: "",
    categoryId: null,
    rentalTypeId: null,
    province: "",
    district: "",
    ward: "",
    addressDetail: "",
    latitude: null,
    longitude: null,
  },
  propertyAmenities: {
    amenityIds: [],
    images: [],
    rooms: [],
    entirePlace: {
      maxGuests: 1,
      numBedrooms: 1,
      numBeds: 1,
      numBathrooms: 1,
      roomCount: 1,
    },
  },
  propertyPricing: {
    pricePerNight: 0,
    weekendSurchargePercentage: 0,
    cleaningFee: 0,
    isPayAtCheckinAllowed: false,
    depositPercentage: 50,
    cancellationPolicyId: null,
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

// API response types: GET /public/categories
export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  isActive: boolean;
}

// API response types: GET /public/rental-types
export interface RentalTypeItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  isActive: boolean;
  categoryResponses?: CategoryItem[];
}

export function isPrivateRoomRentalType(
  rentalType?: RentalTypeItem | null,
): boolean {
  if (!rentalType) return false;

  const slug = rentalType.slug?.toLowerCase() ?? "";
  const name = rentalType.name?.toLowerCase() ?? "";

  return slug === "thue-theo-phong" || name === "thuê theo phòng";
}

export function isEntirePlaceRentalType(
  rentalType?: RentalTypeItem | null,
): boolean {
  if (!rentalType) return false;
  const slug = rentalType.slug?.toLowerCase() ?? "";
  return slug === "toan-bo-cho-o";
}

// API response types: GET /public/amenities
export interface AmenityItem {
  id: number;
  name: string;
  iconName: string;
  type: string;
}

// Cancellation policies (no API — keep static)
export const cancellationPolicyOptions = [
  { value: 1, label: "Linh hoạt — Miễn phí hủy trước 24h" },
  { value: 2, label: "Vừa phải — Miễn phí hủy trước 5 ngày" },
  { value: 3, label: "Nghiêm ngặt — Hoàn 50% nếu hủy trước 7 ngày" },
];

// Province → District → Ward (static location data)
export const provinceData: Record<string, Record<string, string[]>> = {
  "TP. Hồ Chí Minh": {
    "Quận 1": [
      "Phường Bến Nghé",
      "Phường Bến Thành",
      "Phường Cầu Kho",
      "Phường Đa Kao",
      "Phường Nguyễn Cư Trinh",
    ],
    "Quận 3": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5"],
    "Quận 7": [
      "Phường Tân Phong",
      "Phường Tân Quy",
      "Phường Phú Mỹ",
      "Phường Tân Thuận Đông",
    ],
    "Quận Bình Thạnh": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 22",
      "Phường 25",
    ],
    "TP. Thủ Đức": [
      "Phường An Phú",
      "Phường Thảo Điền",
      "Phường Bình Chiểu",
      "Phường Hiệp Bình Chánh",
    ],
  },
  "Hà Nội": {
    "Quận Ba Đình": [
      "Phường Cống Vị",
      "Phường Điện Biên",
      "Phường Kim Mã",
      "Phường Ngọc Hà",
    ],
    "Quận Hoàn Kiếm": [
      "Phường Hàng Buồm",
      "Phường Hàng Bạc",
      "Phường Tràng Tiền",
      "Phường Lý Thái Tổ",
    ],
    "Quận Tây Hồ": [
      "Phường Bưởi",
      "Phường Nhật Tân",
      "Phường Quảng An",
      "Phường Xuân La",
    ],
    "Quận Cầu Giấy": [
      "Phường Dịch Vọng",
      "Phường Mai Dịch",
      "Phường Nghĩa Đô",
      "Phường Quan Hoa",
    ],
  },
  "Đà Nẵng": {
    "Quận Hải Châu": [
      "Phường Thanh Bình",
      "Phường Thuận Phước",
      "Phường Hải Châu I",
      "Phường Hải Châu II",
    ],
    "Quận Sơn Trà": [
      "Phường An Hải Bắc",
      "Phường An Hải Đông",
      "Phường Mân Thái",
      "Phường Phước Mỹ",
    ],
    "Quận Ngũ Hành Sơn": ["Phường Hoà Hải", "Phường Hoà Quý", "Phường Mỹ An"],
  },
  "Lâm Đồng": {
    "TP. Đà Lạt": [
      "Phường 1",
      "Phường 2",
      "Phường 3",
      "Phường 4",
      "Phường 5",
      "Phường 6",
    ],
    "TP. Bảo Lộc": ["Phường 1", "Phường 2", "Phường B'Lao"],
  },
  "Khánh Hòa": {
    "TP. Nha Trang": [
      "Phường Lộc Thọ",
      "Phường Tân Lập",
      "Phường Vĩnh Hải",
      "Phường Vĩnh Nguyên",
    ],
    "TP. Cam Ranh": ["Phường Ba Ngòi", "Phường Cam Lợi"],
  },
  "Kiên Giang": {
    "TP. Phú Quốc": ["Phường An Thới", "Phường Dương Đông", "Phường Cửa Cạn"],
  },
  "Quảng Nam": {
    "TP. Hội An": [
      "Phường Minh An",
      "Phường Sơn Phong",
      "Phường Cẩm Phô",
      "Phường Tân An",
    ],
  },
};
