"use client";

import { useQuery } from "@tanstack/react-query";
import { mockReviews, mockProfiles } from "@/data";
import { Rate, Avatar, Skeleton } from "antd";
import Marquee from "react-fast-marquee";

const fetchTestimonials = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Get latest 6 reviews with high rating
  return mockReviews
    .filter(r => r.rating >= 4)
    .slice(0, 6)
    .map((r, index) => {
      const profile = mockProfiles.find(p => p.userId === r.userId);
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        name: profile?.fullName || "Khách Hàng",
        avatar: profile?.avatarUrl || `https://i.pravatar.cc/150?u=${r.userId}`,
        location: profile?.fullName ? "Từ StayHub" : "Khách du lịch",
      };
    });
};

export default function Testimonials() {
  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: fetchTestimonials,
  });

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="text-center px-6 mb-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Khách hàng nói gì về chúng tôi
        </h2>
        <p className="text-sm text-gray-400 max-w-lg mx-auto">
          Hơn 500,000 khách hàng đã có những trải nghiệm đáng nhớ
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} active paragraph={{ rows: 4 }} />
          ))}
        </div>
      ) : (
        <Marquee
          speed={35}
          pauseOnHover={true}
          gradient={true}
          gradientColor="#f9fafb"
          gradientWidth={80}
        >
          {testimonials?.map((t, idx) => (
            <div
              key={t.id}
              className="shrink-0 w-[280px] bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm mx-2.5 my-4 flex flex-col transition-all duration-300 animate-card-float hover:shadow-xl hover:-translate-y-1 hover:[animation-play-state:paused]"
              style={{ animationDelay: `${idx * 0.4}s` }}
            >
              <Rate
                disabled
                defaultValue={t.rating}
                className="text-sm"
                style={{ color: "#fadb14", fontSize: 14 }}
              />
              <p className="text-[13px] text-gray-500 leading-relaxed my-3 flex-1 line-clamp-4">
                &ldquo;{t.comment}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                <Avatar src={t.avatar} size={40} />
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-400 leading-tight">
                    {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      )}
    </section>
  );
}
