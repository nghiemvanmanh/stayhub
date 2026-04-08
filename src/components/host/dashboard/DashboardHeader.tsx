import React from 'react';
import { Button } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface DashboardHeaderProps {
  userName: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 m-0">Chào mừng trở lại, {userName}!</h1>
        <p className="text-gray-500 mt-2 m-0 text-base">Dưới đây là tóm tắt hoạt động kinh doanh của bạn hôm nay.</p>
      </div>
      <div className="flex space-x-3 mt-4 md:mt-0">
        <Button size="large" icon={<CalendarOutlined />} className="font-medium rounded-lg">
          Lịch biểu
        </Button>
        <Link href="/host/properties">
          <Button type="primary" size="large" icon={<PlusOutlined />} className="font-medium rounded-lg bg-teal-500 hover:bg-teal-600 border-none">
            Thêm chỗ nghỉ mới
          </Button>
        </Link>
      </div>
    </div>
  );
};
