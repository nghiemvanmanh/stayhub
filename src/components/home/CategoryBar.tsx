"use client";

import { useQuery } from "@tanstack/react-query";
import { Skeleton, Tabs } from "antd";
import { Building, House, TreePine, Tent, Palmtree } from "lucide-react";
import { JSX, useEffect } from "react";
import { fetcher } from "@/utils/fetcher";

interface CategoryBarProps {
  onCategoryChange: (categoryId: string) => void;
  activeCategory: string;
}

const categoryIcons: Record<string, JSX.Element> = {
  "1": <House className="w-6 h-6" />,
  "2": <Building className="w-6 h-6" />,
  "3": <House className="w-6 h-6" />,
  "4": <TreePine className="w-6 h-6" />,
  "5": <Tent className="w-6 h-6" />,
};

export default function CategoryBar({ onCategoryChange, activeCategory }: CategoryBarProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetcher.get("/properties/categories");
      return res.data?.data || [];
    },
  });

  useEffect(() => {
    if (categories?.length > 0 && !activeCategory) {
      onCategoryChange(categories[0].slug);
    }
  }, [categories, activeCategory, onCategoryChange]);

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

  // Fallback map since we don't have server-defined icon yet
  const getIcon = (iconName: string, id: string) => {
    // If the backend doesn't send specific distinct keys yet, just use a fallback map based on ID modulo
    const fallbackIds = ["1", "2", "3", "4", "5"];
    const fakeId = fallbackIds[(parseInt(id) % 5)] || "1";
    return categoryIcons[fakeId] || categoryIcons["1"];
  };

  const items = categories?.map((cat: any) => ({
    key: cat.slug,
    label: (
      <div className="flex flex-col items-center gap-2 px-4 py-2">
        <span className="text-gray-700">{getIcon(cat.iconName, String(cat.id))}</span>
        <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
      </div>
    ),
  }));

  return (
    <div className="border-gray-100 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <Tabs
          activeKey={activeCategory}
          onChange={onCategoryChange}
          items={items}
          centered
          className="category-tabs"
        />
      </div>
    </div>
  );
}
