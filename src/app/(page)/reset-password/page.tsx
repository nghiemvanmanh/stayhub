"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Input, message, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { fetcher } from "@/utils/fetcher";
import { PASSWORD_RULES } from "@/constants/validation";

const { Title, Text } = Typography;

type ResetPasswordPayload = {
  token: string;
  newPassword: string;
};

function ResetPasswordContent() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      const res = await fetcher.post("/auth/reset-password", payload);
      return res.data;
    },
    onSuccess: () => {
      setSubmitted(true);
      messageApi.success("Mật khẩu đã được cập nhật thành công! Bạn sẽ được chuyển về trang chủ sau vài giây.");
      setTimeout(() => router.push("/"), 2000);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.data ||
        "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.";
      messageApi.error(msg);
    },
  });

  useEffect(() => {
    if (!token) {
      messageApi.error("Thieu token dat lai mat khau.");
    }
  }, [token, messageApi]);

  const handleSubmit = async () => {
    if (!token) return;

    try {
      const values = await form.validateFields();
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: values.newPassword,
      });
    } catch {
      // validation errors are handled by antd form
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-100 px-4">
      {contextHolder}
      <Card className="w-full max-w-[460px] shadow-xl rounded-2xl" bordered={false}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#2DD4A8] text-white font-bold flex items-center justify-center mx-auto mb-3">
            H
          </div>
          <Title level={3} className="!mb-1">
            Đặt lại mật khẩu
          </Title>
          <Text type="secondary">
            Nhập mật khẩu mới để hoàn tất quá trình khôi phục tài khoản.
          </Text>
        </div>

        {!token ? (
          <div className="text-center">
            <Text type="danger">Liên kết không hợp lệ. Vui lòng kiểm tra lại email.</Text>
            <div className="mt-5">
              <Button type="primary" onClick={() => router.push("/")}>
                Quay về trang chủ
              </Button>
            </div>
          </div>
        ) : submitted ? (
          <div className="text-center">
            <Title level={4} className="!text-green-600 !mb-2">
                Mật khẩu đã được cập nhật!
            </Title>
          </div>
        ) : (
          <Form form={form} layout="vertical" requiredMark={false}>
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={PASSWORD_RULES}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Nhập lại mật khẩu mới"
              />
            </Form.Item>

            <Button
              type="primary"
              block
              size="large"
              loading={resetPasswordMutation.isPending}
              onClick={handleSubmit}
              className="rounded-xl h-11 text-base font-semibold"
              style={{ background: "#2DD4A8", borderColor: "#2DD4A8" }}
            >
              Cập nhật mật khẩu
            </Button>
          </Form>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-100">
          <Card className="w-full max-w-[460px] shadow-xl rounded-2xl" bordered={false}>
            <div className="text-center">
              <Title level={4}>Đang tải...</Title>
            </div>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
