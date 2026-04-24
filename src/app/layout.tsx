import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import AntdProvider from "@/contexts/AntdProvider";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Stayhub - Tìm nơi ở hoàn hảo",
  description: "Khám phá hàng ngàn homestay độc đáo, từ căn hộ hiện đại đến những ngôi nhà trên cây lãng mạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <ReactQueryProvider>
          <AntdProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </AntdProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
