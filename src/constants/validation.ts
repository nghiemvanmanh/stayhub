// ==========================================
// SHARED VALIDATION RULES & HELPERS
// ==========================================

// === Regex Patterns ===
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_VN_REGEX = /^(0|84|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9[0-9])([0-9]{7})$/;
export const CCCD_REGEX = /^[0-9]{12}$/;

// === Password Rules (Ant Design Form compatible) ===
export const PASSWORD_RULES = [
    { required: true, message: "Vui lòng nhập mật khẩu" },
    { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
    {
        pattern: PASSWORD_REGEX,
        message: "Mật khẩu phải bao gồm 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
    },
];

// === Inline Validator Results ===
export interface ValidationResult {
    isValid: boolean;
    message: string;
}

const VALID: ValidationResult = { isValid: true, message: "" };

// === Validators (return error message or empty string) ===

export function validateEmail(value: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: "Vui lòng nhập email" };
    if (!EMAIL_REGEX.test(value.trim())) return { isValid: false, message: "Email không hợp lệ (vd: example@email.com)" };
    return VALID;
}

export function validatePhone(value: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: "Vui lòng nhập số điện thoại" };
    // Remove spaces/dashes for validation
    const cleaned = value.replace(/[\s\-]/g, "");
    if (!PHONE_VN_REGEX.test(cleaned)) return { isValid: false, message: "SĐT không hợp lệ" };
    return VALID;
}

export function validateCCCD(value: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: "Vui lòng nhập số CCCD" };
    if (!CCCD_REGEX.test(value.trim())) return { isValid: false, message: "Số CCCD phải gồm đúng 12 chữ số" };
    return VALID;
}

export function validateBusinessLicense(value: string): ValidationResult {
    const trimmed = value.trim();
    if (trimmed && trimmed.length > 50) return { isValid: false, message: "Số giấy phép tối đa 50 ký tự" };
    return VALID;
}

export function validatePropertyName(value: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: "Vui lòng nhập tên cơ sở lưu trú" };
    if (value.trim().length < 10) return { isValid: false, message: "Tên cơ sở tối thiểu 10 ký tự" };
    if (value.trim().length > 255) return { isValid: false, message: "Tên cơ sở tối đa 255 ký tự" };
    return VALID;
}

export function validateDescription(value: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: "Vui lòng nhập mô tả" };
    if (value.trim().length > 5000) return { isValid: false, message: "Mô tả tối đa 5000 ký tự" };
    return VALID;
}

export function validateLatitude(value: number | string | null): ValidationResult {
    if (value === null || value === undefined || value === "") return { isValid: false, message: "Vui lòng nhập vĩ độ" };
    const num = Number(value);
    if (isNaN(num)) return { isValid: false, message: "Vĩ độ sai định dạng" };
    if (num < -90 || num > 90) return { isValid: false, message: "Vĩ độ phải từ -90 đến 90" };
    return VALID;
}

export function validateLongitude(value: number | string | null): ValidationResult {
    if (value === null || value === undefined || value === "") return { isValid: false, message: "Vui lòng nhập kinh độ" };
    const num = Number(value);
    if (isNaN(num)) return { isValid: false, message: "Kinh độ sai định dạng" };
    if (num < -180 || num > 180) return { isValid: false, message: "Kinh độ phải từ -180 đến 180" };
    return VALID;
}

export function validatePrice(value: number | string | null): ValidationResult {
    if (value === null || value === undefined || value === "") return { isValid: false, message: "Vui lòng nhập giá" };
    const num = Number(value);
    if (isNaN(num) || num <= 0) return { isValid: false, message: "Giá bị bỏ trống hoặc không được nhỏ hơn 0" };
    return VALID;
}

export function validateRequired(value: string, fieldName: string, maxLength?: number): ValidationResult {
    if (!value.trim()) return { isValid: false, message: `Vui lòng nhập ${fieldName}` };
    if (maxLength && value.trim().length > maxLength) return { isValid: false, message: `${fieldName} tối đa ${maxLength} ký tự` };
    return VALID;
}

export function validateSelect(value: unknown, fieldName: string): ValidationResult {
    if (value === null || value === undefined) return { isValid: false, message: `Vui lòng chọn ${fieldName}` };
    return VALID;
}

export function validateSurcharge(value: number | string | null): ValidationResult {
    if (value === null || value === undefined || value === "") return VALID;
    const num = Number(value);
    if (isNaN(num)) return { isValid: false, message: "Phụ phí phải là số" };
    if (num < 0 || num > 100) return { isValid: false, message: "Phụ phí cuối tuần phải từ 0 đến 100" };
    return VALID;
}

export function validateCleaningFee(value: number | string | null): ValidationResult {
    if (value === null || value === undefined || value === "") return VALID;
    const num = Number(value);
    if (isNaN(num)) return { isValid: false, message: "Phí dọn dẹp phải là số" };
    if (num < 0) return { isValid: false, message: "Phí dọn dẹp không được nhỏ hơn 0" };
    return VALID;
}
