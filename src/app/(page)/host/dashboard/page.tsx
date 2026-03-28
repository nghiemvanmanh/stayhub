"use client";

import { DashboardOutlined } from "@ant-design/icons";

export default function HostDashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 m-0">Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-1 m-0">
          Xem tổng quan hoạt động kinh doanh homestay của bạn.
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <DashboardOutlined className="text-5xl text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 m-0">Trang tổng quan</h3>
        <p className="text-sm text-gray-400 mt-2 m-0 max-w-md">
          Tính năng đang được phát triển. Bạn sẽ sớm có thể xem thống kê chi tiết về doanh thu, lượt đặt phòng và đánh giá tại đây.
        </p>
      </div>
    </div>
  );
}
