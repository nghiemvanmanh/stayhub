"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchTestimonials } from "../../interfaces/homestay";
import { Rate, Avatar, Skeleton } from "antd";

export default function Testimonials() {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Khách hàng nói gì về chúng tôi
        </h2>
        <p className="text-sm text-gray-400 mb-12 max-w-lg mx-auto">
          Hơn 500,000 khách hàng đã có những trải nghiệm đáng nhớ
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} active paragraph={{ rows: 4 }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials?.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-2xl p-6 text-left shadow-sm border border-gray-50 hover:shadow-md transition-shadow"
              >
                <Rate
                  disabled
                  defaultValue={t.rating}
                  className="text-sm mb-4"
                  style={{ color: "#fadb14" }}
                />
                <p className="text-sm text-gray-500 leading-relaxed mb-6 line-clamp-4">
                  &ldquo;{t.comment}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <Avatar src={t.avatar} size={40} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
