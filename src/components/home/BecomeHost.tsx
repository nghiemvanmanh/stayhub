"use client";

import { Button } from "antd";
import {
  DollarOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Image from "next/image";

export default function BecomeHost() {
  const benefits = [
    {
      icon: <DollarOutlined className="text-[#2DD4A8] text-xl" />,
      title: "Tăng thu nhập",
      desc: "Kiếm thêm thu nhập từ căn hộ/nhà trống của bạn. Không giới hạn chi phí.",
    },
    {
      icon: <SafetyCertificateOutlined className="text-[#2DD4A8] text-xl" />,
      title: "An tâm tuyệt đối",
      desc: "Bảo hiểm thiệt hại tài sản lên đến 1 tỷ VNĐ cho mỗi booking.",
    },
    {
      icon: <CustomerServiceOutlined className="text-[#2DD4A8] text-xl" />,
      title: "Hỗ trợ 24/7",
      desc: "Đội ngũ hỗ trợ chuyên nghiệp luôn sẵn sàng giải đáp mọi thắc mắc.",
    },
    {
      icon: <TeamOutlined className="text-[#2DD4A8] text-xl" />,
      title: "Cộng đồng host",
      description:
        "Gia nhập cộng đồng host sôi nổ, chia sẻ kinh nghiệm và học hỏi lẫn nhau.",
      desc: "Gia nhập cộng đồng host sôi nổ, chia sẻ kinh nghiệm trong cộng đồng.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="bg-[#FAFAFA] rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                Mở cửa ngôi nhà của bạn
                <br />
                và bắt đầu kinh doanh ngay.
              </h2>
              <p className="text-sm text-gray-400 mb-8 max-w-md">
                Tham gia cùng hơn 1 triệu Host trên toàn thế giới. Chúng tôi
                cung cấp các công cụ và bảo hiểm tốt nhất để bạn an tâm đón
                khách.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                {benefits.map((b, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 flex flex-col gap-2 shadow-sm border border-gray-50"
                  >
                    <div className="w-10 h-10 bg-[#E6FFF8] rounded-lg flex items-center justify-center">
                      {b.icon}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">{b.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                type="primary"
                size="large"
                className="!bg-[#2DD4A8] hover:!bg-[#22b892] !border-none !rounded-xl w-fit px-8 font-semibold"
              >
                Bắt đầu ngay hôm nay
              </Button>
            </div>

            {/* Right Image */}
            <div className="relative min-h-[400px] hidden lg:block">
              <Image
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
                alt="Become a host"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
