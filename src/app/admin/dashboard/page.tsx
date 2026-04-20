"use client";

import React from "react";
import { Card, Row, Col, Typography, Empty, Tag, Avatar } from "antd";
import {
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  SolutionOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const stats = [
    { title: "Tổng người dùng", value: "--", icon: <TeamOutlined />, color: "#2DD4A8", bg: "#e8f8f3", change: null, sub: "Đang cập nhật" },
    { title: "Host chờ duyệt", value: "--", icon: <SolutionOutlined />, color: "#faad14", bg: "#fff8e6", change: null, sub: "Cần xử lý ngay" },
    { title: "Bài đăng Homestay", value: "--", icon: <HomeOutlined />, color: "#1677ff", bg: "#e6f4ff", change: null, sub: "Trên nền tảng" },
    { title: "Doanh thu hệ thống", value: "--", icon: <DollarOutlined />, color: "#722ed1", bg: "#f9f0ff", change: null, sub: "30 ngày qua" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#1a1a2e" }}>
          Tổng quan hệ thống
        </Title>
        <Text style={{ color: "#94a3b8", fontSize: 14 }}>
          Theo dõi các chỉ số quan trọng của StayHub
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={12} lg={6} key={index}>
            <Card bordered={false} style={{ borderRadius: 12, height: "100%" }} styles={{ body: { padding: "20px" } }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{stat.title}</Text>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2, marginTop: 4 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{stat.sub}</div>
                  {stat.change && (
                    <div style={{ fontSize: 12, color: "#2DD4A8", marginTop: 4, fontWeight: 500 }}>
                      <ArrowUpOutlined style={{ fontSize: 10, marginRight: 4 }} />{stat.change}
                    </div>
                  )}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={<Text strong style={{ fontSize: 15 }}>Biểu đồ doanh thu</Text>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Empty
              description={
                <div>
                  <Text style={{ color: "#94a3b8", fontSize: 14, display: "block" }}>🚧 Đang hoàn thiện</Text>
                  <Text style={{ color: "#cbd5e1", fontSize: 12 }}>Biểu đồ doanh thu sẽ được cập nhật sau khi API sẵn sàng</Text>
                </div>
              }
              style={{ padding: "60px 0" }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={<Text strong style={{ fontSize: 15 }}>Hoạt động gần đây</Text>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Empty
              description={
                <div>
                  <Text style={{ color: "#94a3b8", fontSize: 14, display: "block" }}>🚧 Đang hoàn thiện</Text>
                  <Text style={{ color: "#cbd5e1", fontSize: 12 }}>Lịch sử hoạt động sẽ được cập nhật sau</Text>
                </div>
              }
              style={{ padding: "60px 0" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={<Text strong style={{ fontSize: 15 }}>Top Homestay nổi bật</Text>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Empty description={<Text style={{ color: "#94a3b8" }}>🚧 Đang hoàn thiện</Text>} style={{ padding: "40px 0" }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<Text strong style={{ fontSize: 15 }}>Thông báo hệ thống</Text>}
            bordered={false}
            style={{ borderRadius: 12 }}
          >
            <Empty description={<Text style={{ color: "#94a3b8" }}>🚧 Đang hoàn thiện</Text>} style={{ padding: "40px 0" }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
