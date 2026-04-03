"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PlusOutlined,
  HomeOutlined,
  DashboardOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { message, Menu, Drawer, Button } from "antd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "../../../../utils/fetcher";

const menuItems = [
  { key: "dashboard", icon: <DashboardOutlined />, label: "Tổng quan", href: "/host/dashboard" },
  { key: "properties", icon: <HomeOutlined />, label: "Cơ sở lưu trú", href: "/host/properties" },
  { key: "bookings", icon: <CalendarOutlined />, label: "Đặt phòng", href: "/host/bookings" },
  { key: "settings", icon: <SettingOutlined />, label: "Cài đặt", href: "/host/settings" },
];

export default function HostLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isHost, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [messageApi, contextHolder] = message.useMessage();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Close drawer when route changes (mobile)
  useEffect(() => {
    setDrawerVisible(false);
  }, [pathname]);

  const activeKey = menuItems.find(item => pathname.startsWith(item.href))?.key || "dashboard";
  const activeLabel = menuItems.find(item => item.key === activeKey)?.label || "";

  const handleLogout = async () => {
    try {
      await fetcher.post("/auth/logout");
    } finally {
      logout();
      messageApi.success("Đã đăng xuất thành công!");
      router.push("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Đang tải...</div>
      </div>
    );
  }

  if (!isLoggedIn || !isHost) {
    return (
      <>
        <Header />
        <div className="min-h-[calc(100vh-72px)] bg-[#f8f9fb] flex flex-col items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-[80px] md:text-[120px] font-bold text-[#2DD4A8] m-0 leading-none">404</h1>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-4 m-0">Không tìm thấy trang</h2>
            <p className="text-gray-500 mt-2 mb-6 text-sm md:text-base">
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

  const antdMenuItems = [
    ...menuItems.map(item => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
      onClick: () => router.push(item.href),
    })),
    { type: 'divider' as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
      danger: true,
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/host/properties?action=create")}
          className="w-full !bg-[#e6faf4] !text-[#2DD4A8] hover:!bg-[#d4f5ec] !border-none !rounded-xl !h-12 !font-semibold !shadow-none"
        >
          Tạo bài đăng
        </Button>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        items={antdMenuItems}
        className="border-none bg-transparent py-2 custom-host-menu"
      />
    </div>
  );

  return (
    <>
      {contextHolder}
      <Header />

      {/* Mobile Top Bar (Only visible on small screens) */}
      <div className="md:hidden sticky top-[72px] z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 m-0">{activeLabel}</h2>
        <Button 
          type="text" 
          icon={<MenuOutlined />} 
          onClick={() => setDrawerVisible(true)}
          className="!text-gray-600 !p-0"
        />
      </div>

      <div className="min-h-[calc(100vh-72px)] bg-[#f8f9fb] flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-[240px] bg-white border-r border-gray-200 flex-shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          {sidebarContent}
        </aside>

        {/* Mobile Sidebar Drawer */}
        <Drawer
          title={<span className="font-bold text-gray-900">Menu quản lý</span>}
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          size="default"
          styles={{ body: { padding: 0 } }}
        >
          {sidebarContent}
        </Drawer>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 w-full max-w-[1200px] mx-auto">
          {children}
        </main>
      </div>
    </>
  );
}
