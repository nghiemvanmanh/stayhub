import React from 'react';
import { Card, Button } from 'antd';
import { HomeOutlined, CalendarOutlined, CreditCardOutlined, SettingOutlined } from '@ant-design/icons';
import Link from 'next/link';

export const QuickLinks: React.FC = () => {
  const links = [
    { title: 'Quản lý chỗ nghỉ', icon: <HomeOutlined className="text-teal-500" />, href: '/host/properties' },
    { title: 'Lịch đặt phòng', icon: <CalendarOutlined className="text-teal-500" />, href: '/host/bookings' },
    { title: 'Cài đặt thanh toán', icon: <CreditCardOutlined className="text-teal-500" />, href: '/host/settings?tab=payment' },
    { title: 'Cấu hình tài khoản', icon: <SettingOutlined className="text-teal-500" />, href: '/host/settings' },
  ];

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm" styles={{ body: { padding: '24px' } }}>
      <h3 className="text-lg font-bold text-gray-900 m-0 mb-4">Lối tắt nhanh</h3>
      <div className="flex flex-col space-y-3">
        {links.map((link, idx) => (
          <Link href={link.href} key={idx}>
            <Button block size="large" className="flex !justify-start rounded-xl h-12 text-gray-700 font-medium hover:text-teal-600 hover:border-teal-500 hover:bg-teal-50">
              <span className="mr-3 text-lg flex">{link.icon}</span>
              {link.title}
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  );
};
