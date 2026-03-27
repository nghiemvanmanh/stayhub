"use client";

import Link from "next/link";
import { Avatar, Button } from "antd";
import {
  QuestionCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";

export default function RegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoggedIn } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[64px]">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-[#2DD4A8] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-lg font-bold text-[#2DD4A8]">
              StayHub
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              className="text-sm text-gray-600 hover:text-[#2DD4A8]"
            >
              Hỗ trợ & FAQ
            </Button>
            <Avatar
              size={36}
              icon={!isLoggedIn ? <UserOutlined /> : undefined}
              src={user?.avatarUrl}
              className={isLoggedIn ? "bg-[#2DD4A8]" : "bg-gray-400"}
            >
              {isLoggedIn && !user?.avatarUrl
                ? user?.fullName?.charAt(0).toUpperCase()
                : undefined}
            </Avatar>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
