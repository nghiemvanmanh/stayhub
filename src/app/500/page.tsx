"use client"; // Error boundaries must be Client Components

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Button } from "antd";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function ServerErrorPage() {

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mb-8 relative">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm border border-gray-100">
            <span className="text-xl font-bold text-gray-800">500</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Hệ thống gặp sự cố!
        </h1>
        
        <p className="text-lg text-gray-500 max-w-lg mb-8 leading-relaxed">
          Rất xin lỗi vì sự bất tiện này. Server của chúng tôi đang gặp chút trục trặc hoặc vừa xảy ra một lỗi bất ngờ. Xin vui lòng thử lại sau giây lát.
        </p>

        <div className="flex gap-4 items-center">
          <Button 
            type="primary" 
            size="large" 
            icon={<RotateCcw className="w-4 h-4 mr-1" />}
            onClick={() => window.location.reload()}
            className="bg-[#2DD4A8] hover:bg-[#25B891] border-none px-6 font-medium h-[48px] rounded-full shadow-md shadow-teal-500/20 flex items-center"
          >
            Thử Lại Ngay
          </Button>
          <Link href="/">
            <Button size="large" className="px-8 font-medium h-[48px] rounded-full border-gray-300 text-gray-700 hover:text-[#2DD4A8] hover:border-[#2DD4A8]">
              Về Trang Chủ
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
