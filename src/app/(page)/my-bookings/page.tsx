import Footer from "@/components/Footer";
import MyBookings from "@/components/my-bookings/MyBookings";
import { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Chuyến đi của tôi | Stayhub",
  description: "Quản lý các đặt phòng và hành trình của bạn.",
};

export default function BookingsPage() {
  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-[1024px] mx-auto px-4 sm:px-6">
        <MyBookings />
      </div>
    </div>
    <Footer />
    </>
  );
}
