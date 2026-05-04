"use client";

import React from "react";
import { Row, Col, Tag, Avatar, Tooltip } from "antd";
import {
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  SolutionOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  WalletOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { PageContainer, StatisticCard, ProCard, ProTable } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/format";
import { ADMIN_DISPUTE_STATUS_MAP } from "@/constants/dispute";
import { ADMIN_PAYOUT_STATUS_MAP } from "@/constants/payment";
import { PROPERTY_STATUS_MAP } from "@/constants/property";
import dayjs from "dayjs";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { ROLES } from "@/constants/user";

export default function AdminDashboardPage() {
  // 1. Fetch Users
  const { data: usersData } = useQuery({
    queryKey: ["admin-dashboard-users"],
    queryFn: async () => {
      const res = await fetcher.get("/auth/admin/users", { params: { pageNo: 1, pageSize: 100 } });
      return res.data?.data ?? res.data;
    },
  });

  // 2. Fetch Host Applications
  const { data: hostAppsData } = useQuery({
    queryKey: ["admin-dashboard-host-apps"],
    queryFn: async () => {
      const res = await fetcher.get("/auth/admin/host-applications", { params: { pageNo: 1, pageSize: 100 } });
      return res.data?.data ?? res.data;
    },
  });

  // 3. Fetch Properties
  const { data: propertiesData } = useQuery({
    queryKey: ["admin-dashboard-properties"],
    queryFn: async () => {
      const res = await fetcher.get("/properties/admin", { params: { pageNo: 1, pageSize: 100 } });
      return res.data?.data ?? res.data;
    },
  });

  // 4. Fetch Payouts
  const { data: payoutsData } = useQuery({
    queryKey: ["admin-dashboard-payouts"],
    queryFn: async () => {
      const res = await fetcher.get("/payments/admin/payouts", { params: { pageNo: 1, pageSize: 100 } });
      return res.data?.data ?? res.data;
    },
  });

  // 5. Fetch Disputes
  const { data: disputesData } = useQuery({
    queryKey: ["admin-dashboard-disputes"],
    queryFn: async () => {
      const res = await fetcher.get("/bookings/admin/disputes", { params: { pageNo: 1, pageSize: 100 } });
      return res.data?.data ?? res.data;
    },
  });

  // ─── Calculations ────────────────────
  const totalUsers = usersData?.totalElements || 0;
  const pendingHosts = (hostAppsData?.items || []).filter(
    (h: any) => h.onboardingStatus === "PENDING_REVIEW" || h.onboardingStatus === "UNVERIFIED"
  ).length;
  const totalProperties = propertiesData?.totalElements || 0;
  const pendingProperties = (propertiesData?.items || []).filter(
    (p: any) => p.status === "PENDING_REVIEW"
  ).length;

  const payoutItems = payoutsData?.items || [];
  const totalPayoutCompleted = payoutItems
    .filter((p: any) => p.status === "COMPLETED")
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const pendingPayouts = payoutItems.filter((p: any) => p.status === "REQUESTED" || p.status === "PROCESSING").length;

  const disputeItems = disputesData?.items || [];
  const pendingDisputes = disputeItems.filter((d: any) => d.status === "OPEN" || d.status === "PENDING").length;

  // Chart: Payouts completed per month (last 6 months)
  const chartData = React.useMemo(() => {
    const last6 = Array.from({ length: 6 }).map((_, i) =>
      dayjs().subtract(5 - i, "month").format("MM/YYYY")
    );
    const map: Record<string, number> = {};
    last6.forEach((m) => (map[m] = 0));

    (payoutsData?.items || []).forEach((p: any) => {
      if (p.status === "COMPLETED") {
        const key = dayjs(p.createdAt).format("MM/YYYY");
        if (map[key] !== undefined) {
          map[key] += Math.abs(p.amount || 0);
        }
      }
    });

    return last6.map((m) => ({
      month: `T${m.split("/")[0]}`,
      revenue: map[m],
    }));
  }, [payoutsData]);

  // Recent disputes for table
  const recentDisputes = (disputesData?.items || []).slice(0, 5);

  const disputeColumns: ProColumns<any>[] = [
    {
      title: "Mã Booking",
      dataIndex: "bookingCode",
      key: "bookingCode",
      width: 130,
      render: (_: any, r: any) => (
        <span className="font-bold text-sm text-blue-600">#{r.bookingCode}</span>
      ),
    },
    {
      title: "Người tạo",
      key: "creator",
      width: 180,
      render: (_: any, r: any) => (
        <div className="flex items-center gap-2">
          <Avatar icon={<UserOutlined />} size={30} />
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {r.creatorName || r.creatorEmail || "--"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      key: "role",
      width: 80,
      render: (_: any, r: any) => (
        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <Tag
              color={r.creatorRole === "HOST" ? "purple" : "cyan"}
              style={{ fontSize: 10, padding: "0 5px", borderRadius: 10, border: 0 }}
            >
              {ROLES[r.creatorRole] || ROLES['USER']}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: any) => {
        const s = ADMIN_DISPUTE_STATUS_MAP[status] || { label: status, color: "default" };
        return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11, fontWeight: 500, border: 0 }}>{s.label}</Tag>;
      },
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (d: any) => (
        <span className="text-xs text-gray-500">{d ? dayjs(d).format("DD/MM/YYYY HH:mm") : "--"}</span>
      ),
    },
  ];

  // Recent payouts for table
  const recentPayouts = (payoutsData?.items || []).slice(0, 5);

  const payoutColumns: ProColumns<any>[] = [
    {
      title: "Host",
      key: "host",
      width: 180,
      render: (_: any, r: any) => (
        <div className="flex items-center gap-2">
          <Avatar src={r.hostAvatarUrl} icon={<UserOutlined />} size={30} />
          <Tooltip title={r.hostName}>
            <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{r.hostName || "--"}</span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 140,
      render: (_: any, r: any) => (
        <span className="font-bold text-sm text-[#2DD4A8]">{formatCurrency(r.amount || 0)}</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: any) => {
        const s = ADMIN_PAYOUT_STATUS_MAP[status] || { label: status, color: "default" };
        return <Tag color={s.color} style={{ borderRadius: 20, fontSize: 11, fontWeight: 500, border: 0 }}>{s.label}</Tag>;
      },
    },
    {
      title: "Ngày",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      render: (d: any) => (
        <span className="text-xs text-gray-500">{d ? dayjs(d).format("DD/MM/YYYY") : "--"}</span>
      ),
    },
  ];

  const stats = [
    {
      title: "Tổng người dùng",
      value: totalUsers,
      icon: <TeamOutlined />,
      color: "#2DD4A8",
      bg: "#e8f8f3",
      sub: `${pendingHosts} host chờ duyệt`,
    },
    {
      title: "Homestay đăng ký",
      value: totalProperties,
      icon: <HomeOutlined />,
      color: "#1677ff",
      bg: "#e6f4ff",
      sub: `${pendingProperties} chờ duyệt`,
    },
    {
      title: "Tổng chi trả",
      value: formatCurrency(totalPayoutCompleted),
      icon: <DollarOutlined />,
      color: "#722ed1",
      bg: "#f9f0ff",
      sub: `${pendingPayouts} yêu cầu đang đợi`,
    },
    {
      title: "Khiếu nại",
      value: disputeItems.length,
      icon: <ExclamationCircleOutlined />,
      color: "#faad14",
      bg: "#fff8e6",
      sub: `${pendingDisputes} đang mở`,
    },
  ];

  return (
    <PageContainer
      header={{
        title: "Tổng quan hệ thống",
        subTitle: "Theo dõi các chỉ số quan trọng của StayHub — dữ liệu thời gian thực",
      }}
    >
      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatisticCard
              statistic={{
                title: stat.title,
                value: stat.value,
                description: (
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {stat.sub}
                  </span>
                ),
                icon: (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: stat.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </div>
                ),
              }}
              style={{ borderRadius: 12 }}
            />
          </Col>
        ))}
      </Row>

      {/* Chart + Quick Links */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <StatisticCard
            title="Chi trả cho Host — 6 tháng gần nhất"
            chart={
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="adminColorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#722ed1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#722ed1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    formatter={(value: any) => [formatCurrency(value as number), "Chi trả"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#722ed1" strokeWidth={3} fillOpacity={1} fill="url(#adminColorRevenue)" />
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
            style={{ borderRadius: 12 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Quản lý tài khoản", href: "/admin/accounts", icon: <TeamOutlined /> },
                { label: "Hồ sơ chủ nhà", href: "/admin/host-applications", icon: <SolutionOutlined /> },
                { label: "Danh sách Homestay", href: "/admin/properties", icon: <HomeOutlined /> },
                { label: "Quản lý gói cước", href: "/admin/subcription-plans", icon: <TagsOutlined /> },
                { label: "Yêu cầu rút tiền", href: "/admin/payouts", icon: <WalletOutlined /> },
                { label: "Khiếu nại", href: "/admin/disputes", icon: <ExclamationCircleOutlined /> },
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
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
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
                  <span style={{ fontSize: 16, opacity: 0.6 }}>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </ProCard>
        </Col>
      </Row>

      {/* Recent Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ProTable<any>
            headerTitle="Khiếu nại gần đây"
            columns={disputeColumns}
            dataSource={recentDisputes}
            rowKey="id"
            search={false}
            options={false}
            pagination={false}
            cardBordered
            scroll={{ x: "max-content" }}
          />
        </Col>
        <Col xs={24} lg={12}>
          <ProTable<any>
            headerTitle="Yêu cầu rút tiền gần đây"
            columns={payoutColumns}
            dataSource={recentPayouts}
            rowKey="id"
            search={false}
            options={false}
            pagination={false}
            cardBordered
            scroll={{ x: "max-content" }}
          />
        </Col>
      </Row>
    </PageContainer>
  );
}
