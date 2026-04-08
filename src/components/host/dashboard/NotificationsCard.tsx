import React from 'react';
import { Card, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import Link from 'next/link';

export const NotificationsCard: React.FC = () => {
  return (
    <Card 
      className="rounded-2xl border-none shadow-sm relative overflow-hidden" 
      styles={{ body: { padding: '24px', position: 'relative', zIndex: 1 } }}
      style={{ background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)' }}
    >
      <div className="absolute -right-6 -bottom-6 text-white/20">
        <BellOutlined style={{ fontSize: '120px' }} />
      </div>
      
      <h3 className="text-xl font-bold text-white m-0 mb-2">Thông báo mới</h3>
      <p className="text-white/90 text-sm mb-6 max-w-[80%]">
        Bạn có 3 lượt đặt phòng mới đang chờ xác nhận trong hôm nay.
      </p>
      
      <Link href="/host/bookings?status=pending">
        <Button block size="large" className="rounded-xl font-bold text-teal-600 bg-white border-none hover:bg-teal-50">
          Kiểm tra ngay
        </Button>
      </Link>
    </Card>
  );
};
