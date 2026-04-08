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
  CrownOutlined,
  RocketOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { MenuProps } from "antd";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import SubscriptionPlansModal from "@/components/SubscriptionPlansModal";
import { fetcher } from "../../utils/fetcher";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { user, isLoggedIn, isHost, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await fetcher.post("/auth/logout");
    } finally {
      logout();
      messageApi.success("Đã đăng xuất thành công!");
    }
  };
  const handleBecomeHost = () => {
    if (!isLoggedIn) {
      messageApi.warning("Vui lòng đăng nhập để trở thành đối tác homestay.");
      setLoginOpen(true);
    } else if (isHost) {
      router.push("/host/dashboard");
    } else {
      router.push("/become-host");
    }
  };

  const { data: mySubscription } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      const res = await fetcher.get("/properties/host/my-subscription");
      return res.data?.data;
    },
    enabled: isLoggedIn && isHost,
  });

  const subscriptionTier = mySubscription?.tier || "FREE";

  const renderSubscriptionBadge = () => {
    if (!isLoggedIn || !isHost) return null;
    
    let config = { 
      bg: 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50', 
      icon: <StarOutlined className="text-gray-400 text-[14px]" />, 
      label: 'FREE' 
    };
    if (subscriptionTier === 'PREMIUM') {
      config = { 
        bg: 'bg-amber-50/50 border-amber-200 text-amber-700 hover:bg-amber-50', 
        icon: <CrownOutlined className="text-amber-500 text-[14px]" />, 
        label: 'PREMIUM' 
      };
    } else if (subscriptionTier === 'BUSINESS') {
      config = { 
        bg: 'bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-50', 
        icon: <RocketOutlined className="text-blue-500 text-[14px]" />, 
        label: 'BUSINESS' 
      };
    }
    
    return (
      <div 
        onClick={() => setSubscriptionModalOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.bg} text-[11px] font-bold cursor-pointer transition-colors duration-200`}
      >
        <span className="flex items-center justify-center leading-none">{config.icon}</span>
        <span className="tracking-wide hidden sm:inline-block leading-none mt-[1px]">{config.label}</span>
      </div>
    );
  };
  const loggedInItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div className="py-1">
          <p className="font-semibold text-gray-900 m-0">{user?.fullName}</p>
          <p className="text-xs text-gray-500 m-0">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: "divider", className: "md:hidden" },
    {
      key: "host-action-mobile",
      label: isHost ? "Cơ sở lưu trú của tôi" : "Trở thành đối tác",
      icon: <RocketOutlined />,
      className: "md:hidden",
      onClick: handleBecomeHost,
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
    { type: "divider", className: "md:hidden" },
    {
      key: "host-action-mobile",
      label: "Trở thành đối tác",
      className: "md:hidden",
      onClick: handleBecomeHost,
    }
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

            {/* Center Nav
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className="text-sm font-medium text-gray-500 no-underline hover:text-[#2DD4A8] transition-colors"
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
            </nav> */}

            {/* Right */}
            <div className="flex items-center gap-3">
              <Button
                type="text"
                className="!hidden md:!inline-flex text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-full"
                onClick={handleBecomeHost}
              >
                {isLoggedIn && isHost ? "Cơ sở lưu trú của tôi" : "Trở thành đối tác homestay"}
              </Button>
              {renderSubscriptionBadge()}
              <Button
                type="text"
                shape="circle"
                icon={<GlobalOutlined className="text-gray-600" />}
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
                    icon={!user?.avatarUrl ? <UserOutlined /> : undefined}
                    src={user?.avatarUrl}
                    className={isLoggedIn ? "bg-[#2DD4A8]" : "bg-gray-500"}
                  >
                    {isLoggedIn && !user?.avatarUrl
                      ? user?.fullName?.charAt(0).toUpperCase()
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
      <SubscriptionPlansModal 
        open={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </>
  );
}

