"use client";

import { Button, Input } from "antd";
import { MailOutlined } from "@ant-design/icons";

export default function PromoBanner() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="bg-[#2DD4A8] rounded-3xl px-8 py-12 lg:py-14 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Nhận ưu đãi lên đến 30%
          </h2>
          <p className="text-sm text-white/80 mb-8 max-w-md mx-auto">
            Đăng ký nhận bản tin của chúng tôi để không bỏ lỡ những deal hot
            nhất cho kỳ nghỉ sắp tới của bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Nhập địa chỉ email của bạn"
              size="large"
              className="!rounded-xl flex-1"
            />
            <Button
              size="large"
              className="!bg-gray-900 !text-white !border-none !rounded-xl hover:!bg-gray-800 font-semibold px-8"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
