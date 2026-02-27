"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/app/services/homestayService";
import { Skeleton } from "antd";
import { Flame, Waves, House, TreePine, Tent, Camera } from "lucide-react";
import { JSX, useState } from "react";


const categoryIcons: Record<string, JSX.Element> = {
  "1": <Flame />,
  "2": <Waves />,
  "3": <House />,
  "4": <TreePine />,
  "5": <Tent />,
  "6": <Camera />,
};

export default function CategoryBar() {
  const [activeId, setActiveId] = useState<string | null>("1");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-5">
        <div className="flex gap-8 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton.Button key={i} active style={{ width: 60, height: 60 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-4">
        <div className="flex items-center gap-8 justify-center overflow-x-auto">
          {categories?.map((cat) => {
            const isActive = activeId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveId(cat.id)}
                className="relative flex flex-col items-center gap-1.5 min-w-[70px] group cursor-pointer bg-transparent outline-none pb-3 border-none"
              >
                <span
                  className={`text-2xl transition-all duration-200 ${isActive ? "opacity-100 scale-110" : "opacity-60 group-hover:opacity-90 group-hover:scale-105"
                    }`}
                >
                  {categoryIcons[cat.id]}
                </span>
                <span
                  className={`text-xs font-medium whitespace-nowrap transition-colors duration-200 ${isActive
                    ? "text-gray-900"
                    : "text-gray-500 group-hover:text-gray-700"
                    }`}
                >
                  {cat.name}
                </span>
                {/* Active indicator bar */}
                <span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-full transition-all duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
