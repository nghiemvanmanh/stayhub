"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, Skeleton } from "antd";
import { HeartOutlined, RightOutlined } from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { fetcher } from "../../../utils/fetcher";
import { PropertyListItem } from "@/interfaces/property";

interface FeaturedListingsProps {
  categorySlug: string;
}

const fetchHomestaysByCategory = async (categorySlug: string): Promise<PropertyListItem[]> => {
  if (!categorySlug) return [];
  try {
    const res = await fetcher.get(`/properties/category/${categorySlug}/top`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return [];
  }
};

export default function FeaturedListings({ categorySlug }: FeaturedListingsProps) {
  const { data: homestays, isLoading } = useQuery({
    queryKey: ["homestaysByCategory", categorySlug],
    queryFn: () => fetchHomestaysByCategory(categorySlug),
    enabled: !!categorySlug,
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
            href="/search"
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
            {homestays?.map((stay) => {
              const imageUrl = stay.thumbnailUrl || "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80";
              
              return (
              <Link
                key={stay.id}
                href={`/homestay/${stay.slug}`}
                className="no-underline block"
              >
                <Card
                  hoverable
                  className="!rounded-2xl overflow-hidden !border-0 !shadow-none group !p-[5px]"
                  styles={{ body: { padding: "12px 0 0 0" } }}
                  cover={
                    <div className="relative w-full h-[220px] overflow-hidden rounded-2xl">
                      <Image
                        src={imageUrl}
                        alt={stay.name}
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
                          {stay.ratingAvg?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {stay.name}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{stay.district}, {stay.province}</p>
                    <p className="text-xs text-gray-400">Tối đa {stay.maxGuests} khách · {stay.numBedrooms} phòng ngủ</p>
                    <p className="text-sm mt-1">
                      <span className="font-bold text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stay.pricePerNight)}</span>
                      <span className="text-gray-400 font-normal"> / đêm</span>
                    </p>
                  </div>
                </Card>
              </Link>
            )})}
          </div>
        )}
      </div>
    </section>
  );
}
