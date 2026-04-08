"use client";

import React from "react";
import { DollarOutlined, CalendarOutlined, RiseOutlined, UsergroupAddOutlined } from '@ant-design/icons';
// import { useQuery } from '@tanstack/react-query';
// import { fetcher } from '@/utils/fetcher';

import { DashboardHeader } from "@/components/host/dashboard/DashboardHeader";
import { StatCards, StatData } from "@/components/host/dashboard/StatCards";
import { RevenueChart, RevenueData } from "@/components/host/dashboard/RevenueChart";
import { QuickLinks } from "@/components/host/dashboard/QuickLinks";
import { NotificationsCard } from "@/components/host/dashboard/NotificationsCard";
import { RecentBookingsTable, BookingData } from "@/components/host/dashboard/RecentBookingsTable";
import { useAuth } from "@/contexts/AuthContext";

export default function HostDashboardPage() {
  // NOTE: Uncomment and update the following hooks when the API is ready

  // const { data: statsData } = useQuery({
  //   queryKey: ['host-dashboard-stats'],
  //   queryFn: () => fetcher.get('/host/dashboard/stats').then(res => res.data),
  // });

  // const { data: revenueData } = useQuery({
  //   queryKey: ['host-dashboard-revenue'],
  //   queryFn: () => fetcher.get('/host/dashboard/revenue').then(res => res.data),
  // });

  // const { data: recentBookingsData } = useQuery({
  //   queryKey: ['host-dashboard-recent-bookings'],
  //   queryFn: () => fetcher.get('/host/dashboard/recent-bookings').then(res => res.data),
  // });

  // Placeholder data mimicking the design
  const placeholderStats: StatData[] = [
    { title: 'Tổng thu nhập', value: '12,450', prefix: '$', change: 12.5, icon: <DollarOutlined />, iconBgColor: 'bg-teal-50', iconColor: 'text-teal-500' },
    { title: 'Lượt đặt phòng', value: 48, change: 8.2, icon: <CalendarOutlined />, iconBgColor: 'bg-teal-50', iconColor: 'text-teal-500' },
    { title: 'Tỷ lệ lấp đầy', value: '84', suffix: '%', change: -2.4, icon: <RiseOutlined />, iconBgColor: 'bg-teal-50', iconColor: 'text-teal-500' },
    { title: 'Khách hàng mới', value: 12, change: 15, icon: <UsergroupAddOutlined />, iconBgColor: 'bg-teal-50', iconColor: 'text-teal-500' },
  ];

  const placeholderRevenue: RevenueData[] = [
    { month: 'Tháng 1', revenue: 4500 },
    { month: 'Tháng 2', revenue: 5200 },
    { month: 'Tháng 3', revenue: 4800 },
    { month: 'Tháng 4', revenue: 6100 },
    { month: 'Tháng 5', revenue: 5900 },
    { month: 'Tháng 6', revenue: 7200 },
  ];

  const placeholderBookings: BookingData[] = [
    { id: '1', customerName: 'Nguyễn Văn An', propertyName: 'Biệt thự Ven Biển', arrivalDate: '12/06/2024', status: 'COMPLETED', amount: 450 },
    { id: '2', customerName: 'Lê Thị Bình', propertyName: 'Căn hộ Studio Q1', arrivalDate: '14/06/2024', status: 'PENDING', amount: 120 },
    { id: '3', customerName: 'Trần Minh Tâm', propertyName: 'Nhà gỗ Đà Lạt', arrivalDate: '15/06/2024', status: 'PAID', amount: 300 },
    { id: '4', customerName: 'Phạm Hồng Hạnh', propertyName: 'Biệt thự Ven Biển', arrivalDate: '18/06/2024', status: 'CANCELLED', amount: 0 },
    { id: '5', customerName: 'Hoàng Anh Tuấn', propertyName: 'Căn hộ Studio Q1', arrivalDate: '20/06/2024', status: 'PAID', amount: 240 },
  ];

  // TODO: Get actual username from UserContext or Auth state
  const { user } = useAuth();

  return (
    <div className="max-w-[1200px] mx-auto pb-10">
      <DashboardHeader userName={user?.fullName || ''} />
      
      <StatCards data={placeholderStats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={placeholderRevenue} />
        
        <div className="col-span-1 flex flex-col gap-6">
          <QuickLinks />
          <NotificationsCard />
        </div>
      </div>

      <RecentBookingsTable data={placeholderBookings} />
    </div>
  );
}
