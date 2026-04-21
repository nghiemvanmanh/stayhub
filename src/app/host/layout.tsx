"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  PlusOutlined,
  HomeOutlined,
  DashboardOutlined,
  CalendarOutlined,
  WalletOutlined,
  SettingOutlined,
  LogoutOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { message, Button, Dropdown } from "antd";
import { ProLayout } from "@ant-design/pro-components";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/utils/fetcher";
import Link from "next/link";

const hostRoute = {
  path: "/host",
  routes: [
    { path: "/host/dashboard", name: "Tổng quan", icon: <DashboardOutlined /> },
    { path: "/host/properties", name: "Cơ sở lưu trú", icon: <HomeOutlined /> },
    { path: "/host/bookings", name: "Đặt phòng", icon: <CalendarOutlined /> },
    { path: "/host/payout", name: "Thanh toán", icon: <WalletOutlined /> },
    { path: "/host/settings", name: "Cài đặt", icon: <SettingOutlined /> },
  ],
};

export default function HostLayout({ children }: { children: ReactNode }) {
  const { user, isLoggedIn, isHost, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [messageApi, contextHolder] = message.useMessage();

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

  if (!isLoggedIn || !isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] p-6">
        <div className="text-center">
          <h1 className="text-[80px] md:text-[120px] font-bold text-[#2DD4A8] m-0 leading-none">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-4 m-0">
            Không tìm thấy trang
          </h2>
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
    );
  }

  return (
    <>
      {contextHolder}
      <div id="host-pro-layout" style={{ height: "100vh", overflow: "auto" }}>
        <ProLayout
          title="StayHub Host"
          logo={
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "#2DD4A8",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                  H
                </span>
              </div>
            </Link>
          }
          layout="side"
          fixSiderbar
          route={hostRoute}
          location={{ pathname }}
          navTheme="light"
          contentWidth="Fluid"
          token={{
            colorPrimary: "#2DD4A8",
            bgLayout: "#f8f9fb",
            sider: {
              colorMenuBackground: "#ffffff",
              colorBgMenuItemSelected: "#e8f8f3",
              colorTextMenuSelected: "#2DD4A8",
              colorTextMenuItemHover: "#2DD4A8",
              colorTextMenuActive: "#2DD4A8",
              colorBgMenuItemHover: "rgba(45, 212, 168, 0.04)",
            },
            header: {
              colorBgHeader: "#ffffff",
              colorHeaderTitle: "#1a1a2e",
              heightLayoutHeader: 56,
            },
          }}
          menuItemRender={(item, dom) => (
            <a
              onClick={() => item.path && router.push(item.path)}
              style={{ textDecoration: "none" }}
            >
              {dom}
            </a>
          )}
          avatarProps={{
            src: user?.avatarUrl,
            title: user?.fullName || "Host",
            size: "small",
            render: (_props, dom) => (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "info",
                      label: (
                        <div style={{ padding: "4px 0" }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: "#1a1a2e",
                            }}
                          >
                            {user?.fullName || "Host"}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            Chủ nhà
                          </div>
                        </div>
                      ),
                      disabled: true,
                    },
                    { type: "divider" as const },
                    {
                      key: "homepage",
                      icon: <GlobalOutlined />,
                      label: "Về trang chủ",
                      onClick: () => router.push("/"),
                    },
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: "Đăng xuất",
                      danger: true,
                      onClick: handleLogout,
                    },
                  ],
                }}
                placement="bottomRight"
              >
                {dom}
              </Dropdown>
            ),
          }}
          actionsRender={() => [
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/host/properties?action=create")}
              style={{
                background: "#2DD4A8",
                borderColor: "#2DD4A8",
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              Tạo bài đăng
            </Button>,
          ]}
          menuFooterRender={(props) => {
            if (props?.collapsed) return undefined;
            return (
              <div
                style={{
                  padding: "8px 16px 16px",
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#ef4444",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <LogoutOutlined style={{ fontSize: 16 }} />
                  <span>Đăng xuất</span>
                </div>
              </div>
            );
          }}
        >
          {children}
        </ProLayout>
      </div>
    </>
  );
}
