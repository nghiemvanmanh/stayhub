// Realistic Vietnamese location data
export const provinceData: Record<string, string[]> = {
  "TP. Hồ Chí Minh": [
    "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8",
    "Quận 10", "Quận 11", "Quận 12", "Quận Bình Tân", "Quận Bình Thạnh",
    "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình", "Quận Tân Phú",
    "TP. Thủ Đức", "Huyện Bình Chánh", "Huyện Cần Giờ", "Huyện Củ Chi",
    "Huyện Hóc Môn", "Huyện Nhà Bè",
  ],
  "Hà Nội": [
    "Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Hai Bà Trưng", "Quận Đống Đa",
    "Quận Tây Hồ", "Quận Cầu Giấy", "Quận Thanh Xuân", "Quận Hoàng Mai",
    "Quận Long Biên", "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm", "Quận Hà Đông",
    "Huyện Gia Lâm", "Huyện Thanh Trì", "Huyện Đông Anh", "Huyện Sóc Sơn",
  ],
  "Đà Nẵng": [
    "Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn",
    "Quận Liên Chiểu", "Quận Cẩm Lệ", "Huyện Hòa Vang", "Huyện Hoàng Sa",
  ],
  "Hải Phòng": [
    "Quận Hồng Bàng", "Quận Ngô Quyền", "Quận Lê Chân", "Quận Hải An",
    "Quận Kiến An", "Quận Đồ Sơn", "Quận Dương Kinh", "Huyện Thủy Nguyên",
    "Huyện An Dương", "Huyện An Lão", "Huyện Kiến Thụy", "Huyện Cát Hải",
  ],
  "Cần Thơ": [
    "Quận Ninh Kiều", "Quận Bình Thủy", "Quận Cái Răng", "Quận Ô Môn",
    "Quận Thốt Nốt", "Huyện Phong Điền", "Huyện Cờ Đỏ", "Huyện Vĩnh Thạnh",
    "Huyện Thới Lai",
  ],
  "Nha Trang (Khánh Hòa)": [
    "TP. Nha Trang", "TP. Cam Ranh", "Huyện Vạn Ninh", "Huyện Ninh Hòa",
    "Huyện Diên Khánh", "Huyện Khánh Vĩnh", "Huyện Cam Lâm",
  ],
  "Đà Lạt (Lâm Đồng)": [
    "TP. Đà Lạt", "TP. Bảo Lộc", "Huyện Lạc Dương", "Huyện Đơn Dương",
    "Huyện Đức Trọng", "Huyện Di Linh", "Huyện Bảo Lâm",
  ],
  "Vũng Tàu (Bà Rịa - Vũng Tàu)": [
    "TP. Vũng Tàu", "TP. Bà Rịa", "Huyện Long Điền", "Huyện Đất Đỏ",
    "Huyện Xuyên Mộc", "Huyện Châu Đức", "Huyện Côn Đảo",
  ],
  "Huế (Thừa Thiên Huế)": [
    "TP. Huế", "Huyện Phong Điền", "Huyện Quảng Điền", "Huyện Phú Vang",
    "Huyện Phú Lộc", "Huyện A Lưới", "Huyện Nam Đông",
  ],
  "Quảng Ninh": [
    "TP. Hạ Long", "TP. Cẩm Phả", "TP. Uông Bí", "TP. Móng Cái",
    "Huyện Vân Đồn", "Huyện Đông Triều", "Huyện Tiên Yên",
  ],
};

export const bankOptions = [
  { value: "vcb", label: "Vietcombank - NH TMCP Ngoại thương VN" },
  { value: "tcb", label: "Techcombank - NH TMCP Kỹ thương VN" },
  { value: "mb", label: "MB Bank - NH TMCP Quân đội" },
  { value: "acb", label: "ACB - NH TMCP Á Châu" },
  { value: "vpb", label: "VPBank - NH TMCP Việt Nam Thịnh Vượng" },
  { value: "bidv", label: "BIDV - NH TMCP Đầu tư và Phát triển VN" },
  { value: "agr", label: "Agribank - NH Nông nghiệp VN" },
  { value: "scb", label: "Sacombank - NH TMCP Sài Gòn Thương Tín" },
  { value: "tpb", label: "TPBank - NH TMCP Tiên Phong" },
  { value: "shb", label: "SHB - NH TMCP Sài Gòn - Hà Nội" },
  { value: "msb", label: "MSB - NH TMCP Hàng Hải VN" },
  { value: "ocb", label: "OCB - NH TMCP Phương Đông" },
  { value: "hdbank", label: "HDBank - NH TMCP Phát triển TP.HCM" },
];

export const currencyOptions = [
  { value: "VND", label: "VND - Việt Nam Đồng" },
  { value: "USD", label: "USD - Đô la Mỹ" },
];

// Types for centralized form data
export interface PersonalInfoData {
  fullName: string;
  phone: string;
  accountType: "personal" | "business";
  province: string;
  district: string;
  addressDetail: string;
}

export interface VerificationData {
  frontCCCD: File | null;
  backCCCD: File | null;
  selfie: File | null;
  agreed: boolean;
}

export interface BankData {
  accountHolder: string;
  bankCode: string;
  accountNumber: string;
  accountNumberConfirm: string;
  branch: string;
  currency: string;
  swift: string;
  iban: string;
  proofFile: File | null;
}

export interface RegistrationFormData {
  personal: PersonalInfoData;
  verification: VerificationData;
  bank: BankData;
}

export const initialFormData: RegistrationFormData = {
  personal: {
    fullName: "",
    phone: "",
    accountType: "personal",
    province: "",
    district: "",
    addressDetail: "",
  },
  verification: {
    frontCCCD: null,
    backCCCD: null,
    selfie: null,
    agreed: false,
  },
  bank: {
    accountHolder: "",
    bankCode: "",
    accountNumber: "",
    accountNumberConfirm: "",
    branch: "",
    currency: "VND",
    swift: "",
    iban: "",
    proofFile: null,
  },
};
