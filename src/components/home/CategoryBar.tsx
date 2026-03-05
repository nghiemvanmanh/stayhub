"use client";

import { useQuery } from "@tanstack/react-query";
import { mockCategories } from "../../data/property";
import { Skeleton, Tabs } from "antd";
import { Building, House, TreePine, Tent, Palmtree } from "lucide-react";
import { JSX } from "react";

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
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockCategories;
    },
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

  const items = categories?.map((cat) => ({
    key: String(cat.id),
    label: (
      <div className="flex flex-col items-center gap-2 px-4 py-2">
        <span className="text-gray-700">{categoryIcons[String(cat.id)]}</span>
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
