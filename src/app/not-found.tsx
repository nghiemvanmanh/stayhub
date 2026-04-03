import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Button } from "antd";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center mb-8 relative">
          <Compass className="w-16 h-16 text-[#2DD4A8] animate-pulse" />
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-sm">
            <span className="text-xl font-bold text-gray-800">404</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Lạc đường rồi bạn ơi!
        </h1>
        
        <p className="text-lg text-gray-500 max-w-lg mb-8 leading-relaxed">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc tạm thời không thể truy cập. Hãy thử về trang chủ và khám phá các homestay tuyệt vời khác nhé!
        </p>

        <div className="flex gap-4 items-center">
          <Link href="/">
            <Button type="primary" size="large" className="bg-[#2DD4A8] hover:bg-[#25B891] border-none px-8 font-medium h-[48px] rounded-full shadow-md shadow-teal-500/20">
              Vào Trang Chủ
            </Button>
          </Link>
          <Link href="/search">
            <Button size="large" className="px-8 font-medium h-[48px] rounded-full border-gray-300 text-gray-700 hover:text-[#2DD4A8] hover:border-[#2DD4A8]">
              Tìm Homestay
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
