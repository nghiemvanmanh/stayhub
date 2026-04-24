"use client";

import { Modal, Form, Input, Button, Divider, message } from "antd";
import {
    MailOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
} from "@ant-design/icons";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/utils/fetcher";
import { PASSWORD_RULES } from "@/constants/validation";
import { useRouter } from "next/navigation";
import { getRolesFromToken } from "@/lib/tokenUtils";

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export default function LoginModal({
    open,
    onClose,
    onSwitchToRegister,
}: LoginModalProps) {
    const [form] = Form.useForm();
    const [forgotForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const { login } = useAuth();
    const [messageApi, contextHolder] = message.useMessage();
    const router = useRouter();

    const handleLogin = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const res = await fetcher.post('/auth/login', values);
            const data = res.data.data;
            login(data.userInfResponse, { accessToken: data.accessToken, refreshToken: data.refreshToken });
            messageApi.success(`Chào mừng trở lại, ${data?.userInfResponse?.fullName}! 👋`);
            form.resetFields();
            onClose();
            
            const roles = getRolesFromToken(data.accessToken);
            if (roles.includes("ROLE_ADMIN")) {
                router.push("/admin/dashboard");
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data?.data || "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
            messageApi.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForgotPassword = () => {
        const currentEmail = form.getFieldValue("email");
        if (currentEmail) {
            forgotForm.setFieldsValue({ email: currentEmail });
        }
        setForgotOpen(true);
    };

    const handleCloseForgotPassword = () => {
        if (forgotLoading) return;
        setForgotOpen(false);
        forgotForm.resetFields();
    };

    const handleForgotPassword = async () => {
        try {
            const values = await forgotForm.validateFields();
            setForgotLoading(true);
            await fetcher.post("/auth/forgot-password", {
                email: values.email,
            });
            messageApi.success("Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email của bạn.");
            handleCloseForgotPassword();
        } catch (err: any) {
            if (err?.errorFields) {
                return;
            }
            const msg = err?.response?.data?.message || err?.response?.data?.data || "Gửi yêu cầu thất bại. Vui lòng thử lại.";
            messageApi.error(msg);
        } finally {
            setForgotLoading(false);
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
                destroyOnHidden
            >
                {/* Header */}
                <div className="text-center mb-6 pt-2">
                    <div className="w-10 h-10 bg-[#2DD4A8] rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">H</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 m-0">
                        Chào mừng trở lại!
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 mb-0">
                        Đăng nhập để tiếp tục khám phá
                    </p>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLogin}
                    requiredMark={false}
                >
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
                        rules={PASSWORD_RULES}
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

                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={handleOpenForgotPassword}
                            className="text-sm text-[#2DD4A8] hover:underline bg-transparent border-none cursor-pointer p-0"
                        >
                            Quên mật khẩu?
                        </button>
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                        className="rounded-xl h-12 text-base font-semibold"
                        style={{ background: "#2DD4A8", borderColor: "#2DD4A8" }}
                    >
                        Đăng nhập
                    </Button>
                </Form>

                <Divider className="my-5">
                    <span className="text-gray-400 text-sm">hoặc</span>
                </Divider>

                <p className="text-center text-sm text-gray-500 mb-0">
                    Chưa có tài khoản?{" "}
                    <button
                        type="button"
                        onClick={() => {
                            form.resetFields();
                            onSwitchToRegister();
                        }}
                        className="text-[#2DD4A8] font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                        Đăng ký ngay
                    </button>
                </p>
            </Modal>

            <Modal
                open={forgotOpen}
                onCancel={handleCloseForgotPassword}
                onOk={handleForgotPassword}
                okText="Gửi yêu cầu"
                cancelText="Hủy"
                confirmLoading={forgotLoading}
                title="Quên mật khẩu"
                width={420}
                destroyOnHidden
            >
                <Form
                    form={forgotForm}
                    layout="vertical"
                    requiredMark={false}
                >
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
                </Form>
            </Modal>
        </>
    );
}
