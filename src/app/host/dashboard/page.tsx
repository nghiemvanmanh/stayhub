"use client";

import React from "react";
import { Row, Col, Empty, Typography } from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  RiseOutlined,
  UsergroupAddOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { PageContainer, StatisticCard, ProCard, ProTable } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { useAuth } from "@/contexts/AuthContext";

const { Text } = Typography;

interface BookingData {
  id: string;
  customerName: string;
  propertyName: string;
  arrivalDate: string;
  status: string;
  amount: number;
}

const statusEnum: Record<string, { text: string; status: string }> = {
  COMPLETED: { text: "Hoàn thành", status: "Success" },
  PENDING: { text: "Chờ xử lý", status: "Warning" },
  PAID: { text: "Đã thanh toán", status: "Processing" },
  CANCELLED: { text: "Đã huỷ", status: "Error" },
};

export default function HostDashboardPage() {
  const { user } = useAuth();

  const placeholderBookings: BookingData[] = [
    { id: "1", customerName: "Nguyễn Văn An", propertyName: "Biệt thự Ven Biển", arrivalDate: "12/06/2024", status: "COMPLETED", amount: 450 },
    { id: "2", customerName: "Lê Thị Bình", propertyName: "Căn hộ Studio Q1", arrivalDate: "14/06/2024", status: "PENDING", amount: 120 },
    { id: "3", customerName: "Trần Minh Tâm", propertyName: "Nhà gỗ Đà Lạt", arrivalDate: "15/06/2024", status: "PAID", amount: 300 },
    { id: "4", customerName: "Phạm Hồng Hạnh", propertyName: "Biệt thự Ven Biển", arrivalDate: "18/06/2024", status: "CANCELLED", amount: 0 },
    { id: "5", customerName: "Hoàng Anh Tuấn", propertyName: "Căn hộ Studio Q1", arrivalDate: "20/06/2024", status: "PAID", amount: 240 },
  ];

  const bookingColumns: ProColumns<BookingData>[] = [
    { title: "Khách hàng", dataIndex: "customerName", key: "customerName" },
    { title: "Chỗ ở", dataIndex: "propertyName", key: "propertyName", ellipsis: true },
    { title: "Ngày đến", dataIndex: "arrivalDate", key: "arrivalDate" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      valueType: "select",
      valueEnum: statusEnum,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (_: any, record: BookingData) => (
        <span style={{ fontWeight: 700, color: record.amount > 0 ? "#2DD4A8" : "#94a3b8" }}>
          ${record.amount}
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
        <Col xs={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tổng thu nhập",
              value: 12450,
              prefix: "$",
              description: (
                <StatisticCard.Statistic title="So với tháng trước" value="12.5%" trend="up" />
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
        <Col xs={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Lượt đặt phòng",
              value: 48,
              description: (
                <StatisticCard.Statistic title="So với tháng trước" value="8.2%" trend="up" />
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
        <Col xs={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tỷ lệ lấp đầy",
              value: 84,
              suffix: "%",
              description: (
                <StatisticCard.Statistic title="So với tháng trước" value="2.4%" trend="down" />
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
        <Col xs={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Khách hàng mới",
              value: 12,
              description: (
                <StatisticCard.Statistic title="So với tháng trước" value="15%" trend="up" />
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
      </Row>

      {/* Charts row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <ProCard
            title="Doanh thu 6 tháng gần nhất"
            bordered={false}
            headerBordered
            style={{ borderRadius: 12 }}
          >
            <Empty
              description={
                <Text style={{ color: "#94a3b8" }}>
                  🚧 Biểu đồ doanh thu sẽ hiển thị khi có dữ liệu API
                </Text>
              }
              style={{ padding: "40px 0" }}
            />
          </ProCard>
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
                <a
                  key={link.href}
                  onClick={() => window.location.href = link.href}
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
                </a>
              ))}
            </div>
          </ProCard>
        </Col>
      </Row>

      {/* Recent Bookings ProTable */}
      <ProTable<BookingData>
        headerTitle="Đặt phòng gần đây"
        columns={bookingColumns}
        dataSource={placeholderBookings}
        rowKey="id"
        search={false}
        options={false}
        pagination={false}
        cardBordered
      />
    </PageContainer>
  );
}
