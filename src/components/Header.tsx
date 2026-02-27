"use client";

import Link from "next/link";
import { Button, Avatar, Badge, Dropdown, message } from "antd";
import {
  GlobalOutlined,
  UserOutlined,
  MenuOutlined,
  BellOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { MenuProps } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import { logoutApi } from "@/app/services/authService";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      logout();
      messageApi.success("Đã đăng xuất thành công!");
    }
  };

  const loggedInItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div className="py-1">
          <p className="font-semibold text-gray-900 m-0">{user?.name}</p>
          <p className="text-xs text-gray-500 m-0">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      label: "Trang cá nhân",
      icon: <UserOutlined />,
    },
    {
      key: "bookings",
      label: "Đặt phòng của tôi",
      icon: <BookOutlined />,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  const loggedOutItems: MenuProps["items"] = [
    {
      key: "login",
      label: <span className="font-medium">Đăng nhập</span>,
      icon: <LoginOutlined />,
      onClick: () => setLoginOpen(true),
    },
    {
      key: "register",
      label: <span className="font-medium">Đăng ký</span>,
      icon: <UserAddOutlined />,
      onClick: () => setRegisterOpen(true),
    },
  ];

  return (
    <>
      {contextHolder}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 no-underline">
              <div className="w-8 h-8 bg-[#2DD4A8] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-lg font-bold text-[#2DD4A8] hidden sm:inline">
                Stayhub
              </span>
            </Link>

            {/* Center Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-sm font-semibold text-gray-900 no-underline hover:text-[#2DD4A8] transition-colors"
              >
                Khám phá
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-gray-500 no-underline hover:text-[#2DD4A8] transition-colors"
              >
                Trải nghiệm
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-gray-500 no-underline hover:text-[#2DD4A8] transition-colors"
              >
                Trải nghiệm trực tuyến
              </Link>
            </nav>

            {/* Right */}
            <div className="flex items-center gap-3">
              <Button
                type="text"
                className="hidden md:inline-flex text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-full"
              >
                Trở thành chủ nhà
              </Button>
              <Button
                type="text"
                shape="circle"
                icon={<GlobalOutlined className="text-gray-600" />}
                className="hidden md:inline-flex"
              />
              <Badge dot offset={[-2, 2]} color="#2DD4A8">
                <Button
                  type="text"
                  shape="circle"
                  icon={<BellOutlined className="text-gray-600" />}
                />
              </Badge>
              <Dropdown
                menu={{ items: isLoggedIn ? loggedInItems : loggedOutItems }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <div className="flex items-center gap-2 border border-gray-200 rounded-full py-1 px-2 hover:shadow-md transition-shadow cursor-pointer">
                  <MenuOutlined className="text-gray-600 text-xs" />
                  <Avatar
                    size={30}
                    icon={!user?.avatar ? <UserOutlined /> : undefined}
                    src={user?.avatar}
                    className={isLoggedIn ? "bg-[#2DD4A8]" : "bg-gray-500"}
                  >
                    {isLoggedIn && !user?.avatar
                      ? user?.name?.charAt(0).toUpperCase()
                      : undefined}
                  </Avatar>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }}
      />
    </>
  );
}

