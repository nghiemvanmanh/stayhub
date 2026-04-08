"use client";

import React from 'react';
import { Card, Table, Avatar, Tag, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import Link from 'next/link';

export interface BookingData {
  id: string;
  customerName: string;
  customerAvatar?: string;
  propertyName: string;
  arrivalDate: string;
  status: 'COMPLETED' | 'PENDING' | 'PAID' | 'CANCELLED';
  amount: number;
}

interface RecentBookingsTableProps {
  data: BookingData[];
}

export const RecentBookingsTable: React.FC<RecentBookingsTableProps> = ({ data }) => {
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Tag color="default" className="rounded-md border-gray-200 text-gray-600 bg-transparent px-2 py-0.5">Hoàn thành</Tag>;
      case 'PENDING':
        return <Tag color="warning" className="rounded-md border-orange-200 text-orange-600 bg-transparent px-2 py-0.5">Chờ xác nhận</Tag>;
      case 'PAID':
        return <Tag color="success" className="rounded-md border-green-200 text-green-600 bg-transparent px-2 py-0.5">Đã thanh toán</Tag>;
      case 'CANCELLED':
        return <Tag color="error" className="rounded-md border-red-200 text-red-600 bg-red-500 px-2 py-0.5" style={{ color: 'white', border: 'none' }}>Hủy bỏ</Tag>;
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (_: any, record: BookingData) => (
        <div className="flex items-center space-x-3">
          <Avatar src={record.customerAvatar} size={32}>
            {record.customerName.charAt(0)}
          </Avatar>
          <span className="font-semibold text-gray-900">{record.customerName}</span>
        </div>
      ),
    },
    {
      title: 'Chỗ nghỉ',
      dataIndex: 'propertyName',
      key: 'propertyName',
      render: (text: string) => <span className="text-gray-600 font-medium">{text}</span>,
    },
    {
      title: 'Ngày đến',
      dataIndex: 'arrivalDate',
      key: 'arrivalDate',
      render: (text: string) => <span className="text-gray-600 font-medium">{text}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => <span className="font-bold text-gray-900">${amount}</span>,
    },
  ];

  return (
    <Card className="rounded-2xl border-gray-100 shadow-sm mt-6 mb-8" styles={{ body: { padding: '24px' } }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 m-0">Đặt phòng gần đây</h3>
          <p className="text-gray-500 text-sm mt-1 m-0">Xem danh sách 5 lượt đặt phòng mới nhất của bạn</p>
        </div>
        <Link href="/host/bookings">
          <Button type="text" className="text-teal-500 hover:text-teal-600 font-semibold px-0 hover:bg-transparent">
            Xem tất cả <RightOutlined className="text-[10px]" />
          </Button>
        </Link>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="id" 
        pagination={false}
        className="w-full"
        rowClassName="hover:bg-gray-50 border-b border-gray-100 last:border-0"
      />
    </Card>
  );
};
