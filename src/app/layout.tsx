import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/contexts/ReactQueryProvider";
import AntdProvider from "@/contexts/AntdProvider";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
