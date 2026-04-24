"use client";

import { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  DashboardOutlined,
  TeamOutlined,
  SolutionOutlined,
  HomeOutlined,
  AlertOutlined,
  DollarOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { message, Badge, Tooltip, Dropdown } from "antd";
import { ProLayout } from "@ant-design/pro-components";
import { useAuth } from "@/contexts/AuthContext";
import { fetcher } from "@/utils/fetcher";
import Link from "next/link";

const adminRoute = {
  path: "/admin",
  routes: [
    { path: "/admin/dashboard", name: "Tổng quan", icon: <DashboardOutlined /> },
    { path: "/admin/accounts", name: "Tài khoản", icon: <TeamOutlined /> },
    { path: "/admin/host-applications", name: "Hồ sơ Host", icon: <SolutionOutlined /> },
    { path: "/admin/properties", name: "Bài đăng", icon: <HomeOutlined /> },
    { path: "/admin/disputes", name: "Khiếu nại", icon: <AlertOutlined /> },
    { path: "/admin/payouts", name: "Rút tiền", icon: <DollarOutlined /> },
  ],
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isLoggedIn, isLoading, roles, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [messageApi, contextHolder] = message.useMessage();

  const isAdmin = roles.includes("ROLE_ADMIN");

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
  return (
    <>
      {contextHolder}
      <div id="admin-pro-layout" style={{ height: "100vh", overflow: "auto" }}>
        <ProLayout
          title="StayHub"
          logo={
            <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>H</span>
              </div>
            </Link>
          }
          layout="side"
          fixSiderbar
          route={adminRoute}
          location={{ pathname }}
          navTheme="light"
          contentWidth="Fluid"
          token={{
            colorPrimary: "#2DD4A8",
            bgLayout: "#f8fafc",
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
            title: user?.fullName || "Admin",
            size: "small",
            render: (_props, dom) => (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "info",
                      label: (
                        <div style={{ padding: "4px 0" }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>
                            {user?.fullName || "Admin"}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>Quản trị viên</div>
                        </div>
                      ),
                      disabled: true,
                    },
                    { type: "divider" as const },
                    {
                      key: "homepage",
                      icon: <HomeOutlined />,
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
            <Tooltip title="Thông báo" key="notifications">
              <Badge count={3} size="small">
                <BellOutlined
                  style={{ fontSize: 18, color: "#64748b", cursor: "pointer" }}
                />
              </Badge>
            </Tooltip>,
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
          footerRender={() => (
            <footer
              style={{
                padding: "20px 28px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                backgroundColor: "#fff",
              }}
            >
              <span style={{ color: "#94a3b8", fontSize: 12 }}>
                © 2026 StayHub Admin Console. All rights reserved.
              </span>
              <div style={{ display: "flex", gap: 20 }}>
                <span style={{ color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
                  Documentation
                </span>
                <span style={{ color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
                  Support
                </span>
                <span style={{ color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
                  Privacy Policy
                </span>
              </div>
            </footer>
          )}
        >
          {children}
        </ProLayout>
      </div>
    </>
  );
}
