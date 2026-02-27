"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedHomestays } from "@/app/services/homestayService";
import { Card, Rate, Skeleton, Button } from "antd";
import { HeartOutlined, RightOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";

export default function FeaturedListings() {
  const { data: homestays, isLoading } = useQuery({
    queryKey: ["featuredHomestays"],
    queryFn: fetchFeaturedHomestays,
  });

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chỗ ở nổi bật</h2>
            <p className="text-sm text-gray-400 mt-1">
              Khám phá những điểm đến được đánh giá cao nhất bởi cộng đồng.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-[#2DD4A8] no-underline flex items-center gap-1 transition-colors"
          >
            Xem tất cả <RightOutlined className="text-xs" />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton.Image active style={{ width: "100%", height: 220 }} className="!w-full !h-[220px] rounded-2xl" />
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homestays?.map((stay) => (
              <Card
                key={stay.id}
                hoverable
                className="!rounded-2xl overflow-hidden !border-0 !shadow-none group"
                styles={{ body: { padding: "12px 0 0 0" } }}
                cover={
                  <div className="relative w-full h-[220px] overflow-hidden rounded-2xl">
                    <Image
                      src={stay.image}
                      alt={stay.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer border-none">
                      <HeartOutlined className="text-gray-600 text-sm" />
                    </button>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                      <span className="text-yellow-500 text-xs">★</span>
                      <span className="text-xs font-semibold text-gray-800">
                        {stay.rating}
                      </span>
                    </div>
                  </div>
                }
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {stay.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400">{stay.distance}</p>
                  <p className="text-xs text-gray-400">{stay.dates}</p>
                  <p className="text-sm mt-1">
                    <span className="font-bold text-gray-900">{stay.price}</span>
                    <span className="text-gray-400 font-normal"> / đêm</span>
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
