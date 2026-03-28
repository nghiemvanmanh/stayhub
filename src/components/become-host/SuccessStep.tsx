"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Steps } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  MessageOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const reviewSteps = [
  {
    title: "Đã nhận hồ sơ",
    description: "Chúng tôi đã nhận đầy đủ thông tin từ bạn.",
    icon: <CheckCircleOutlined />,
  },
  {
    title: "Đang xác minh",
    description: "Kiểm tra thông tin cá nhân và giấy tờ tùy thân.",
    icon: <SafetyCertificateOutlined />,
  },
  {
    title: "Hoàn tất",
    description: "Kích hoạt tài khoản Host chính thức.",
    icon: <CheckCircleOutlined />,
  },
];

export default function SuccessStep() {
  const [applicationId, setApplicationId] = useState("");

  useEffect(() => {
    setApplicationId(`HSB-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000
    )}-XT`);
  }, []);

  return (
    <div className="max-w-[800px] mx-auto flex flex-col gap-7 pb-10">
      {/* Hero */}
      <div className="text-center pt-10 pb-8">
        <div className="w-[60px] h-[60px] rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5 text-[28px] text-green-500">
          <CheckCircleOutlined />
        </div>
        <h1 className="text-[28px] font-bold text-gray-900 mb-3">
          Hồ sơ của bạn đã được gửi thành công!
        </h1>
        <p className="text-[15px] text-gray-500 max-w-[500px] mx-auto leading-relaxed mb-6">
          Cảm ơn bạn đã tin tưởng HomestayBooking. Đội ngũ của chúng tôi sẽ bắt
          đầu quy trình xác minh ngay lập tức.
        </p>
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-full border border-gray-200">
          <span className="text-xs text-gray-400 font-medium tracking-wide">MÃ HỒ SƠ:</span>
          <span className="text-sm font-bold text-gray-900 font-mono">{applicationId}</span>
          <span className="text-xs font-medium text-[#2DD4A8] px-2.5 py-0.5 bg-blue-50 rounded-xl border border-blue-200">
            Đang chờ duyệt
          </span>
        </div>
      </div>

      {/* Review Process */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <ClockCircleOutlined className="text-lg text-[#2DD4A8]" />
          <h3 className="text-base font-semibold text-gray-900 m-0 flex-1">Quy trình xem xét hồ sơ</h3>
          <span className="text-[13px] text-gray-400 italic">Thời gian dự kiến: 1-3 ngày làm việc</span>
        </div>
        <Steps current={1} items={reviewSteps} />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl py-7 px-6 text-center">
          <ClockCircleOutlined className="text-[28px] text-[#2DD4A8] mb-3" />
          <h4 className="text-base font-semibold text-gray-900 mb-2">Theo dõi trạng thái</h4>
          <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
            Cập nhật tiến độ phê duyệt hồ sơ của bạn theo thời gian thực.
          </p>
          <Button type="primary" block className="!rounded-[10px] !font-semibold !h-10 !bg-[#2DD4A8] !border-[#2DD4A8]">
            Xem chi tiết hồ sơ
          </Button>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl py-7 px-6 text-center">
          <MessageOutlined className="text-[28px] text-[#2DD4A8] mb-3" />
          <h4 className="text-base font-semibold text-gray-900 mb-2">Cần hỗ trợ?</h4>
          <p className="text-[13px] text-gray-500 mb-4 leading-relaxed">
            Mọi thắc mắc về quy trình đăng ký, vui lòng liên hệ đội ngũ hỗ trợ.
          </p>
          <Button block className="!rounded-[10px] !font-medium !h-10 !text-gray-600 !border-gray-300">
            Chat với chúng tôi
          </Button>
        </div>
      </div>

      {/* Useful Links */}
      <div className="bg-gray-50 rounded-xl px-6 py-5 text-center">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Thông tin hữu ích dành cho bạn:</h4>
        <div className="flex justify-center gap-6 flex-wrap">
          {[
            { label: "Cẩm nang cho Host mới" },
            { label: "Cách tối ưu hóa tin đăng" },
            { label: "Chính sách bảo hiểm Host" },
          ].map((link) => (
            <Link
              key={link.label}
              href="/"
              className="text-[13px] text-[#2DD4A8] no-underline flex items-center gap-1.5 hover:underline"
            >
              <FileTextOutlined /> {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Back to Home */}
      <div className="text-center py-2">
        <Link href="/" className="text-sm text-gray-500 no-underline hover:text-[#2DD4A8]">
          Quay về Trang chủ
        </Link>
      </div>
    </div>
  );
}
