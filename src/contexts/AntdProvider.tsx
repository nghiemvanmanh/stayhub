"use client";

import { ConfigProvider } from "antd";

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2DD4A8",
          borderRadius: 8,
          fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
