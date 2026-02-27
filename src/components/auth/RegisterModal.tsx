"use client";

import { Modal, Form, Input, Button, Divider, message } from "antd";
import {
    MailOutlined,
    LockOutlined,
    UserOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from "@ant-design/icons";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { registerApi } from "@/app/services/authService";

interface RegisterModalProps {
    open: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function RegisterModal({
    open,
    onClose,
    onSwitchToLogin,
}: RegisterModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();

    const handleRegister = async (values: {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
    }) => {
        setLoading(true);
        try {
            const res = await registerApi(values);
            login(res.user, res.tokens);
            messageApi.success(`Đăng ký thành công! Chào mừng ${res.user.name} 🎉`);
            form.resetFields();
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Đăng ký thất bại";
            messageApi.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {contextHolder}
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                centered
                width={440}
                className="auth-modal"
                destroyOnClose
            >
                {/* Header */}
                <div className="text-center mb-6 pt-2">
                    <div className="w-10 h-10 bg-[#2DD4A8] rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">H</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 m-0">
                        Tạo tài khoản mới
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 mb-0">
                        Tham gia Stayhub để khám phá những điểm lưu trú tuyệt vời
                    </p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleRegister}
                    requiredMark={false}
                >
                    <Form.Item
                        name="name"
                        label={
                            <span className="font-medium text-gray-700">Họ và tên</span>
                        }
                        rules={[
                            { required: true, message: "Vui lòng nhập họ tên" },
                            { min: 2, message: "Họ tên ít nhất 2 ký tự" },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Nguyễn Văn A"
                            size="large"
                            className="rounded-xl"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={<span className="font-medium text-gray-700">Email</span>}
                        rules={[
                            { required: true, message: "Vui lòng nhập email" },
                            { type: "email", message: "Email không hợp lệ" },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="example@email.com"
                            size="large"
                            className="rounded-xl"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={<span className="font-medium text-gray-700">Mật khẩu</span>}
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu" },
                            { min: 6, message: "Mật khẩu ít nhất 6 ký tự" },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="••••••••"
                            size="large"
                            className="rounded-xl"
                            iconRender={(visible) =>
                                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                            }
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label={
                            <span className="font-medium text-gray-700">
                                Xác nhận mật khẩu
                            </span>
                        }
                        dependencies={["password"]}
                        rules={[
                            { required: true, message: "Vui lòng xác nhận mật khẩu" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="••••••••"
                            size="large"
                            className="rounded-xl"
                            iconRender={(visible) =>
                                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                            }
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                        className="rounded-xl h-12 text-base font-semibold mt-1"
                        style={{ background: "#2DD4A8", borderColor: "#2DD4A8" }}
                    >
                        Đăng ký
                    </Button>
                </Form>

                <Divider className="my-5" />

                <p className="text-center text-sm text-gray-500 mb-0">
                    Đã có tài khoản?{" "}
                    <button
                        type="button"
                        onClick={() => {
                            form.resetFields();
                            onSwitchToLogin();
                        }}
                        className="text-[#2DD4A8] font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                        Đăng nhập
                    </button>
                </p>
            </Modal>
        </>
    );
}
