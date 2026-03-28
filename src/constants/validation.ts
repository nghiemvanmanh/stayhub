// ==========================================
// SHARED VALIDATION RULES & HELPERS
// ==========================================

// === Regex Patterns ===
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_VN_REGEX = /^(0[3|5|7|8|9])[0-9]{8}$/;
export const CCCD_REGEX = /^[0-9]{12}$/;
export const BUSINESS_LICENSE_REGEX = /^[A-Za-z0-9\-\/]{5,30}$/;

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
    if (!PHONE_VN_REGEX.test(cleaned)) return { isValid: false, message: "SĐT phải có 10 số, bắt đầu bằng 03/05/07/08/09" };
    return VALID;
}

export function validateCCCD(value: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: "Vui lòng nhập số CCCD" };
    if (!CCCD_REGEX.test(value.trim())) return { isValid: false, message: "Số CCCD phải gồm đúng 12 chữ số" };
    return VALID;
}

export function validateBusinessLicense(value: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: "Vui lòng nhập số giấy phép kinh doanh" };
    if (!BUSINESS_LICENSE_REGEX.test(value.trim())) return { isValid: false, message: "Số giấy phép phải từ 5-30 ký tự (chữ, số, dấu - /)" };
    return VALID;
}

export function validatePropertyName(value: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: "Vui lòng nhập tên cơ sở lưu trú" };
    if (value.trim().length < 5) return { isValid: false, message: "Tên cơ sở tối thiểu 5 ký tự" };
    if (value.trim().length > 100) return { isValid: false, message: "Tên cơ sở tối đa 100 ký tự" };
    return VALID;
}

export function validateDescription(value: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: "Vui lòng nhập mô tả" };
    if (value.trim().length < 20) return { isValid: false, message: "Mô tả tối thiểu 20 ký tự" };
    if (value.trim().length > 2000) return { isValid: false, message: "Mô tả tối đa 2000 ký tự" };
    return VALID;
}

export function validateLatitude(value: number | null): ValidationResult {
    if (value === null || value === undefined) return { isValid: false, message: "Vui lòng nhập vĩ độ" };
    if (value < -90 || value > 90) return { isValid: false, message: "Vĩ độ phải từ -90 đến 90" };
    return VALID;
}

export function validateLongitude(value: number | null): ValidationResult {
    if (value === null || value === undefined) return { isValid: false, message: "Vui lòng nhập kinh độ" };
    if (value < -180 || value > 180) return { isValid: false, message: "Kinh độ phải từ -180 đến 180" };
    return VALID;
}

export function validatePrice(value: number): ValidationResult {
    if (!value || value <= 0) return { isValid: false, message: "Giá phải lớn hơn 0" };
    return VALID;
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
    if (!value.trim()) return { isValid: false, message: `Vui lòng nhập ${fieldName}` };
    return VALID;
}

export function validateSelect(value: unknown, fieldName: string): ValidationResult {
    if (value === null || value === undefined) return { isValid: false, message: `Vui lòng chọn ${fieldName}` };
    return VALID;
}
