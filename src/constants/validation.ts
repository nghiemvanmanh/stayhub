export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_RULES = [
    { required: true, message: "Vui lòng nhập mật khẩu" },
    { min: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
    {
        pattern: PASSWORD_REGEX,
        message: "Mật khẩu phải bao gồm 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
    },
];
