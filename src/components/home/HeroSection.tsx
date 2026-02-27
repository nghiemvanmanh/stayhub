"use client";

import { Button, DatePicker, Input, Select } from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden flex items-center py-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-32 w-full h-[700px] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full h-full">
          {/* Left Content */}
          <div className="flex flex-col gap-6 max-w-[540px]">
            <div className="inline-flex items-center gap-2 bg-[#E6FFF8] text-[#2DD4A8] border border-[#2DD4A8]/40 px-4 py-1.5 rounded-full text-xs font-medium w-fit">
              <span>Sẵn sàng cho kỳ nghỉ hè?</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] text-gray-900">
              Tìm nơi ở hoàn hảo cho{" "}
              <span className="text-[#2DD4A8] italic font-extrabold">hành trình</span>{" "}
              tiếp theo.
            </h1>
            <p className="text-gray-500 text-base leading-relaxed">
              Khám phá hàng ngàn homestay độc đáo, từ căn hộ hiện đại đến
              những ngôi nhà trên cây lãng mạn.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-gray-800 px-3 pt-2 uppercase tracking-wide">
                  Địa điểm
                </div>
                <Input
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                  placeholder="Bạn muốn"
                  variant="borderless"
                  className="text-sm"
                />
              </div>
              <div className="hidden sm:block w-px h-10 bg-gray-200 self-center" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-gray-800 px-3 pt-2 uppercase tracking-wide">
                  Thời gian
                </div>
                <DatePicker
                  placeholder="Thêm ngày"
                  variant="borderless"
                  className="w-full text-sm"
                  suffixIcon={null}
                />
              </div>
              <div className="hidden sm:block w-px h-10 bg-gray-200 self-center" />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-gray-800 px-3 pt-2 uppercase tracking-wide">
                  Khách
                </div>
                <Select
                  placeholder="Thêm khách"
                  variant="borderless"
                  className="w-full text-sm"
                  options={[
                    { value: "1", label: "1 khách" },
                    { value: "2", label: "2 khách" },
                    { value: "3", label: "3 khách" },
                    { value: "4", label: "4+ khách" },
                  ]}
                />
              </div>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                className="!bg-[#2DD4A8] hover:!bg-[#22b892] !border-none !rounded-xl !h-12 !px-6 !font-semibold"
                size="large"
              >
                Tìm kiếm
              </Button>
            </div>
          </div>

          {/* Right Image — single image with equal top/bottom spacing */}
          <div className="hidden lg:block relative self-stretch">
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=1200&fit=crop"
                alt="Homestay interior"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating card — bottom left of image */}
            <div className="absolute bottom-[-20px] left-[-25px] bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 z-10">
              <div className="w-8 h-8 rounded-full bg-[#E6FFF8] flex items-center justify-center flex-shrink-0">
                <span className="text-[#2DD4A8] text-sm font-bold">✓</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800">An tâm đặt phòng</p>
                <p className="text-[11px] text-gray-400">Chính sách hoàn tiền 100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
