"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PlusOutlined,
  HomeOutlined,
  DashboardOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "../../../../utils/fetcher";

const sidebarItems = [
  { key: "dashboard", label: "Tổng quan", icon: <DashboardOutlined />, href: "/host/dashboard" },
  { key: "properties", label: "Cơ sở lưu trú", icon: <HomeOutlined />, href: "/host/properties" },
  { key: "bookings", label: "Đặt phòng", icon: <CalendarOutlined />, href: "/host/bookings" },
  { key: "settings", label: "Cài đặt", icon: <SettingOutlined />, href: "/host/settings" },
];

export default function HostLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isHost, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [messageApi, contextHolder] = message.useMessage();

  // Determine active menu from current pathname
  const activeKey = sidebarItems.find(item => pathname.startsWith(item.href))?.key || "dashboard";

  const handleLogout = async () => {
    try {
      await fetcher.post("/auth/logout");
    } finally {
      logout();
      messageApi.success("Đã đăng xuất thành công!");
      router.push("/");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Đang tải...</div>
      </div>
    );
  }

  // Role guard: only ROLE_HOST can access
  if (!isLoggedIn || !isHost) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-72px)] bg-[#f8f9fb] flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-[120px] font-bold text-[#2DD4A8] m-0 leading-none">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mt-4 m-0">Không tìm thấy trang</h2>
            <p className="text-gray-500 mt-2 mb-6">
              Bạn không có quyền truy cập trang này hoặc trang không tồn tại.
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-[#2DD4A8] text-white font-semibold rounded-xl border-none cursor-pointer hover:bg-[#22b892] transition-colors text-sm"
            >
              Về trang chủ
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <Header />
      <div className="min-h-[calc(100vh-72px)] bg-[#f8f9fb] flex">
        {/* Sidebar */}
        <aside className="w-[220px] bg-white border-r border-gray-200 py-6 px-3 flex flex-col justify-between flex-shrink-0 sticky top-[72px] h-[calc(100vh-72px)]">
          <div className="flex flex-col gap-1">
            {/* Create Listing Button */}
            <button
              onClick={() => router.push("/host/properties?action=create")}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#2DD4A8] bg-[#e6faf4] border-none cursor-pointer hover:bg-[#d4f5ec] transition-colors mb-4"
            >
              <PlusOutlined />
              Tạo bài đăng
            </button>

            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium border-none cursor-pointer transition-all ${
                  activeKey === item.key
                    ? "bg-[#e6faf4] text-[#2DD4A8]"
                    : "bg-transparent text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-transparent border-none cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <LogoutOutlined />
            Đăng xuất
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8">
          {children}
        </main>
      </div>
    </>
  );
}
