"use client";

import React from "react";
import { Row, Col, Typography } from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  RiseOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { PageContainer, StatisticCard, ProCard, ProTable } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { useAuth } from "@/contexts/AuthContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/format";
import dayjs from "dayjs";
import Link from "next/link";
import { Tag } from "antd";
import { BOOKING_STATUS_MAP } from "@/constants/booking";

const { Text } = Typography;

export default function HostDashboardPage() {
  const { user } = useAuth();

  // Fetch Wallet Data (For Revenue)
  const { data: wallet } = useQuery({
    queryKey: ["host-wallet-dashboard"],
    queryFn: async () => {
      const res = await fetcher.get("/payments/host/wallet");
      return res.data?.data ?? res.data;
    },
  });

  // Fetch Bookings Data
  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ["host-bookings-dashboard"],
    queryFn: async () => {
      const res = await fetcher.get("/bookings/host", { params: { pageNo: 1, pageSize: 10 } });
      return res.data?.data ?? res.data;
    },
  });

  // Fetch Transactions Data for Chart
  const { data: txnsResponse } = useQuery({
    queryKey: ["host-transactions-dashboard"],
    queryFn: async () => {
      const res = await fetcher.get("/payments/host/transactions", { params: { pageNo: 1, pageSize: 100 } });
      return res.data?.data ?? res.data;
    },
  });
  const recentBookings : any = bookingsData?.items || [] ;
  const newGuest = new Set(recentBookings.map((item: any) => item.guestName))
  console.log(newGuest)
  const totalBookings = bookingsData?.totalElements || 0;
  const totalIncome = (wallet?.availableBalance || 0) + (wallet?.pendingBalance || 0);

  const getStatusTag = (status: string) => {
    const config = BOOKING_STATUS_MAP[status] || { label: status, color: "default" };
    return (
      <Tag color={config.color} style={{ borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 500, border: 0 }}>
        {config.label}
      </Tag>
    );
  };

  // Calculate real-time chart data from transactions
  const chartData = React.useMemo(() => {
    const transactions = txnsResponse?.items || [];
    console.log({txnsResponse})
    // Generate the last 6 months (including current month)
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      return dayjs().subtract(5 - i, 'month').format('MM/YYYY');
    });

    const dataMap: Record<string, number> = {};
    last6Months.forEach(m => dataMap[m] = 0);

    transactions.forEach((txn: any) => {
      console.log({txn})
      if (txn.type === "BOOKING_INCOME") {
        const monthStr = dayjs(txn.createdAt).format('MM/YYYY');
        if (dataMap[monthStr] !== undefined) {
          dataMap[monthStr] += Math.abs(txn.amount);
        }
      }
    });

    return last6Months.map(m => ({
      month: `T${m.split('/')[0]}`,
      revenue: dataMap[m],
    }));
  }, [txnsResponse]);

  const bookingColumns: ProColumns<any>[] = [
    {
      title: "Mã Booking",
      dataIndex: "bookingCode",
      key: "bookingCode",
      render: (_: any, record: any) => <span className="text-[#2DD4A8] font-bold text-sm">{record.bookingCode}</span>,
    },
    { 
      title: "Khách hàng", 
      dataIndex: "guestName", 
      key: "guestName" 
    },
    { 
      title: "Chỗ ở", 
      dataIndex: "propertyName", 
      key: "propertyName", 
      ellipsis: true 
    },
    { 
      title: "Ngày đến", 
      key: "checkInDate",
      render: (_: any, record: any) => dayjs(record.checkInDate).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: any) => getStatusTag(status),
    },
    {
      title: "Số tiền",
      key: "amount",
      align: "right",
      render: (_: any, record: any) => (
        <span style={{ fontWeight: 700, color: record.finalAmount > 0 ? "#2DD4A8" : "#94a3b8" }}>
          {formatCurrency(record.finalAmount || 0)}
        </span>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: `Xin chào, ${user?.fullName || "Host"} 👋`,
        subTitle: "Chào mừng trở lại! Đây là tổng quan hoạt động của bạn.",
      }}
    >
      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tổng thu nhập",
              value: formatCurrency(totalIncome),
              description: (
                <StatisticCard.Statistic title="Tổng trong hệ thống ví" value="-" trend="up" />
              ),
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e8f8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DollarOutlined style={{ fontSize: 20, color: "#2DD4A8" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Lượt đặt phòng",
              value: totalBookings,
              description: (
                <StatisticCard.Statistic title="Khách đặt" value="Hoạt động" />
              ),
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e8f8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CalendarOutlined style={{ fontSize: 20, color: "#2DD4A8" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Khách hàng mới",
              value: newGuest.size,
              description: (
                <StatisticCard.Statistic title="Gần đây" value="-" trend="up" />
              ),
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e8f8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UsergroupAddOutlined style={{ fontSize: 20, color: "#2DD4A8" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tỷ lệ lấp đầy",
              value: totalBookings > 0 ? "Khá Tốt" : "Chưa có",
              description: (
                <StatisticCard.Statistic title="Phân tích chung" value="-" trend="up" />
              ),
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e8f8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <RiseOutlined style={{ fontSize: 20, color: "#2DD4A8" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12 }}
          />
        </Col>
      </Row>

      {/* Charts row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <StatisticCard
            title="Doanh thu 6 tháng gần nhất"
            chart={
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4A8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2DD4A8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis hide />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [formatCurrency(value as number), "Doanh thu"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2DD4A8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            }
            style={{ borderRadius: 12 }}
          />
        </Col>
        <Col xs={24} lg={8}>
          <ProCard
            title="Truy cập nhanh"
            bordered={false}
            headerBordered
            style={{ borderRadius: 12, marginBottom: 16 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Quản lý bài đăng", href: "/host/properties" },
                { label: "Xem đặt phòng", href: "/host/bookings" },
                { label: "Thanh toán & Ví", href: "/host/payout" },
                { label: "Cài đặt tài khoản", href: "/host/settings" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#f8fafc",
                    color: "#475569",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    display: "block",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e8f8f3";
                    e.currentTarget.style.color = "#2DD4A8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#f8fafc";
                    e.currentTarget.style.color = "#475569";
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </ProCard>
        </Col>
      </Row>

      {/* Recent Bookings ProTable */}
      <ProTable<any>
        headerTitle="Đặt phòng gần đây"
        columns={bookingColumns}
        dataSource={recentBookings}
        rowKey="bookingCode"
        loading={loadingBookings}
        search={false}
        options={false}
        pagination={false}
        cardBordered
        scroll={{ x: 'max-content' }}
      />
    </PageContainer>
  );
}
