"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DashboardOutlined,
  TeamOutlined,
  SolutionOutlined,
  HomeOutlined,
  AlertOutlined,
  DollarOutlined,
  LogoutOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { message, Drawer, Button, Avatar, Badge, Input, Tooltip } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/utils/fetcher";
import Link from "next/link";

const menuItems = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: "Tổng quan",
    href: "/admin/dashboard",
  },
  {
    key: "accounts",
    icon: <TeamOutlined />,
    label: "Tài khoản",
    href: "/admin/accounts",
  },
  {
    key: "host-applications",
    icon: <SolutionOutlined />,
    label: "Hồ sơ Host",
    href: "/admin/host-applications",
  },
  {
    key: "properties",
    icon: <HomeOutlined />,
    label: "Bài đăng",
    href: "/admin/properties",
  },
  {
    key: "disputes",
    icon: <AlertOutlined />,
    label: "Khiếu nại",
    href: "/admin/disputes",
  },
  {
    key: "payouts",
    icon: <DollarOutlined />,
    label: "Rút tiền",
    href: "/admin/payouts",
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoggedIn, isLoading, roles, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [messageApi, contextHolder] = message.useMessage();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const isAdmin = roles.includes("ROLE_ADMIN");

  useEffect(() => {
    setDrawerVisible(false);
  }, [pathname]);

  const activeKey =
    menuItems.find((item) => pathname.startsWith(item.href))?.key ||
    "dashboard";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="w-9 h-9 border-[3px] border-gray-200 border-t-[#2DD4A8] rounded-full animate-spin" />
        <span className="text-gray-500 font-medium">Đang tải...</span>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <h1 className="text-[80px] font-extrabold text-red-500 m-0 leading-none">403</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Truy cập bị từ chối</h2>
          <p className="text-gray-400 mt-2 mb-6">Bạn không có quyền truy cập trang quản trị.</p>
          <button 
            onClick={() => router.push("/")} 
            className="px-8 py-2.5 bg-[#2DD4A8] text-white font-semibold rounded-lg hover:bg-emerald-400 transition-colors border-none cursor-pointer text-sm"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const sidebarContent = (isDesktop = true) => (
    <div className="flex flex-col h-full bg-white select-none relative z-[51]">
      {/* Logo row */}
      <div className="flex items-center px-4.5 py-4.5 flex-1">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-[#2DD4A8] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          {!collapsed && <span className="text-lg font-bold text-[#2DD4A8] hidden sm:inline">
            Stayhub
          </span>}
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto w-full">
        {menuItems.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer text-sm mb-[2px] transition-all relative group
                ${isActive ? 'bg-[#e8f8f3] text-[#2DD4A8] font-semibold' : 'text-slate-500 font-medium hover:bg-slate-50 hover:text-[#1a1a2e]'}
              `}
              onClick={() => router.push(item.href)}
            >
              <div className={`absolute left-[-12px] top-1/2 -translate-y-1/2 w-[3px] rounded-r-sm bg-[#2DD4A8] transition-all duration-200 ${isActive ? 'h-6' : 'h-0'}`} />
              <span className={`text-[17px] flex items-center justify-center w-5 shrink-0 ${isActive ? 'text-[#2DD4A8]' : ''}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom — Logout only */}
      <div className="px-3 py-2 pb-4 border-t border-slate-100 mt-auto">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer text-sm font-medium text-red-500 transition-all hover:bg-red-50 hover:text-red-600 mb-[2px]"
          onClick={handleLogout}
        >
          <span className="text-[17px] flex items-center justify-center w-5 shrink-0"><LogoutOutlined /></span>
          {!collapsed && <span className="whitespace-nowrap overflow-hidden text-ellipsis">Đăng xuất</span>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <div className="flex min-h-screen bg-slate-50 transition-all w-full items-start justify-start">
        {/* Desktop Sidebar (Fixed) */}
        <aside
          className={`hidden md:flex flex-col bg-white border-r border-slate-100 flex-shrink-0 transition-all min-h-screen z-50 sticky top-0`}
          style={{ width: collapsed ? '72px' : '230px' }}
        >
          <div className="w-full h-full flex flex-col relative z-50 fixed-sidebar-content-wrapper">
             {sidebarContent(true)}
          </div>
        </aside>

        {/* Mobile Drawer */}
        <Drawer
          title={null}
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={250}
          closable={false}
          styles={{ body: { padding: 0 } }}
        >
          {sidebarContent(false)}
        </Drawer>

        {/* Main Content Wrapper */}
        <main
          className={`flex-1 min-h-screen flex flex-col transition-all duration-200 overflow-x-hidden`}
          style={{ width: '100%' }}
        >
          {/* Top Bar */}
          <div className="h-16 bg-white flex items-center justify-between px-4 md:px-7 border-b border-slate-100 sticky top-0 z-40 w-full shrink-0">
            <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                className="md:!hidden !text-slate-500 flex shrink-0"
              />
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="!hidden md:!inline-flex !text-slate-500 !text-base shrink-0"
              />
              <div className="flex-1 md:w-[360px]">
                <Input
                  placeholder="Tìm kiếm booking, host, bài đăng..."
                  prefix={<SearchOutlined className="text-slate-300" />}
                  className="rounded-lg bg-slate-50 border-slate-100 hover:border-[#2DD4A8] focus:border-[#2DD4A8] py-1.5 w-full"
                  variant="outlined"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 shrink-0 overflow-hidden ml-2">
              <Tooltip title="Thông báo">
                <Badge count={3} size="small" className="hidden sm:block mt-1">
                  <Button type="text" icon={<BellOutlined className="text-slate-500 text-lg" />} />
                </Badge>
              </Tooltip>
              <div className="flex items-center gap-2.5 cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="hidden sm:block text-right">
                  <div className="font-semibold text-[13px] text-[#1a1a2e] leading-tight flex justify-end">{user?.fullName || "Admin"}</div>
                  <div className="text-[11px] text-slate-400 leading-tight">Quản trị viên</div>
                </div>
                <Avatar src={user?.avatarUrl} className="bg-[#2DD4A8]" size={36}>
                  {user?.fullName?.charAt(0)}
                </Avatar>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 md:p-6 lg:p-7 max-w-[1400px] w-full mx-auto flex-1 overflow-x-hidden">
            {children}
          </div>

          {/* Footer */}
          <footer className="px-5 md:px-7 py-5 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3 bg-white mt-auto w-full shrink-0">
            <span className="text-slate-400 text-xs text-center md:text-left w-full md:w-auto">
              © 2024 StayHub Admin Console. All rights reserved.
            </span>
            <div className="flex gap-4 md:gap-5 mx-auto md:mx-0">
              <span className="text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer">Documentation</span>
              <span className="text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer">Support</span>
              <span className="text-slate-400 hover:text-slate-600 text-xs transition-colors cursor-pointer">Privacy Policy</span>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
