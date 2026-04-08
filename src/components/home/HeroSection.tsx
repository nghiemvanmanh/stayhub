"use client";

import { Button, DatePicker, Input, Select } from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

export default function HeroSection() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [dates, setDates] = useState<[Dayjs, Dayjs] | null>(null);
  const [guests, setGuests] = useState<string | undefined>(undefined);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (dates) {
      params.set("checkIn", dates[0].format("YYYY-MM-DD"));
      params.set("checkOut", dates[1].format("YYYY-MM-DD"));
    }
    if (guests) params.set("guests", guests);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden flex items-center py-12 lg:py-20 min-h-[700px]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-32 w-full flex items-center h-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full h-full">
          {/* Left Content */}
          <div className="flex flex-col gap-6 lg:max-w-[540px]">
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
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-col gap-1">
              {/* Địa điểm - hàng trên */}
              <div className="w-full border-b border-gray-200 pb-3">
                <Input
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                  placeholder="Bạn muốn đi đâu?"
                  variant="borderless"
                  className="text-base"
                  size="large"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onPressEnter={handleSearch}
                />
              </div>
              
              {/* Ngày đến, Ngày đi, Khách - hàng dưới */}
              <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-2">
                <div className="flex-[2] min-w-0 border-r border-gray-200 pr-3">
                  <RangePicker
                    placeholder={["Ngày đến", "Ngày đi"]}
                    variant="borderless"
                    className="w-full"
                    suffixIcon={null}
                    value={dates}
                    onChange={(vals) => {
                      if (vals?.[0] && vals?.[1]) {
                        setDates([vals[0], vals[1]]);
                      } else {
                        setDates(null);
                      }
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <Select
                    placeholder="Thêm khách"
                    variant="borderless"
                    className="w-full"
                    suffixIcon={<span className="text-gray-400">▼</span>}
                    value={guests}
                    onChange={(val) => setGuests(val)}
                    options={[
                    { value: "1", label: "1 khách" },
                    { value: "2", label: "2 khách" },
                    { value: "3", label: "3 khách" },
                    { value: "4", label: "4+ khách" },
                    ]}
                  />
                </div>
              </div>

              {/* Nút tìm kiếm */}
              <div className="pt-3">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  className="!bg-[#2DD4A8] hover:!bg-[#22b892] !border-none !rounded-xl !h-12 w-full !font-semibold text-base"
                  size="large"
                  block
                  onClick={handleSearch}
                >
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </div>

          {/* Right Image — Responsive for all screens */}
          <div className="relative w-full h-[300px] sm:h-[450px] lg:h-[600px] rounded-3xl overflow-visible mt-6 lg:mt-0">
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=1200&fit=crop"
                alt="Homestay interior"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Floating card — positioned relative to the image container */}
            <div className="absolute bottom-4 left-4 lg:bottom-[-20px] lg:left-[-25px] bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 z-10 hidden sm:flex">
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
