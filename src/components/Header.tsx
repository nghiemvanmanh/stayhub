"use client";

import Link from "next/link";
import { Button, Avatar, Badge, Dropdown } from "antd";
import {
  GlobalOutlined,
  UserOutlined,
  MenuOutlined,
  BellOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { MenuProps } from "antd";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loggedInItems: MenuProps["items"] = [
    {
      key: "profile",
      label: "Trang cá nhân",
      icon: <UserOutlined />,
    },
    {
      key: "bookings",
      label: "Đặt phòng của tôi",
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => setIsLoggedIn(false),
    },
  ];

  const loggedOutItems: MenuProps["items"] = [
    {
      key: "login",
      label: "Đăng nhập",
      icon: <LoginOutlined />,
      onClick: () => setIsLoggedIn(true),
    },
    {
      key: "register",
      label: "Đăng ký",
      icon: <UserAddOutlined />,
    },
  ];

  return (
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
                  icon={<UserOutlined />}
                  className={isLoggedIn ? "bg-[#2DD4A8]" : "bg-gray-500"}
                />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}

