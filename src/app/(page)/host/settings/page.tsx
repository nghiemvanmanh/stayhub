"use client";

import { SettingOutlined } from "@ant-design/icons";

export default function HostSettingsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 m-0">Cài đặt</h1>
        <p className="text-sm text-gray-500 mt-1 m-0">
          Cấu hình tài khoản và cài đặt kinh doanh của bạn.
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <SettingOutlined className="text-5xl text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 m-0">Cài đặt tài khoản</h3>
        <p className="text-sm text-gray-400 mt-2 m-0 max-w-md">
          Tính năng đang được phát triển. Bạn sẽ sớm có thể tùy chỉnh thông tin cá nhân, thanh toán và thông báo tại đây.
        </p>
      </div>
    </div>
  );
}
