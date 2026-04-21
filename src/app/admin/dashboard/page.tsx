"use client";

import React from "react";
import { Row, Col, Empty, Typography } from "antd";
import {
  TeamOutlined,
  HomeOutlined,
  DollarOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { PageContainer, StatisticCard, ProCard } from "@ant-design/pro-components";

const { Text } = Typography;

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Tổng người dùng",
      value: "--",
      icon: <TeamOutlined />,
      color: "#2DD4A8",
      bg: "#e8f8f3",
      sub: "Đang cập nhật",
    },
    {
      title: "Host chờ duyệt",
      value: "--",
      icon: <SolutionOutlined />,
      color: "#faad14",
      bg: "#fff8e6",
      sub: "Cần xử lý ngay",
    },
    {
      title: "Bài đăng Homestay",
      value: "--",
      icon: <HomeOutlined />,
      color: "#1677ff",
      bg: "#e6f4ff",
      sub: "Trên nền tảng",
    },
    {
      title: "Doanh thu hệ thống",
      value: "--",
      icon: <DollarOutlined />,
      color: "#722ed1",
      bg: "#f9f0ff",
      sub: "30 ngày qua",
    },
  ];

  return (
    <PageContainer
      header={{
        title: "Tổng quan hệ thống",
        subTitle: "Theo dõi các chỉ số quan trọng của StayHub",
      }}
    >
      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={12} lg={6} key={index}>
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

      {/* Content */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <ProCard
            title="Biểu đồ doanh thu"
            bordered={false}
            headerBordered
            style={{ borderRadius: 12 }}
          >
            <Empty
              description={
                <div>
                  <Text style={{ color: "#94a3b8", fontSize: 14, display: "block" }}>
                    🚧 Đang hoàn thiện
                  </Text>
                  <Text style={{ color: "#cbd5e1", fontSize: 12 }}>
                    Biểu đồ doanh thu sẽ được cập nhật sau khi API sẵn sàng
                  </Text>
                </div>
              }
              style={{ padding: "60px 0" }}
            />
          </ProCard>
        </Col>
        <Col xs={24} lg={8}>
          <ProCard
            title="Hoạt động gần đây"
            bordered={false}
            headerBordered
            style={{ borderRadius: 12 }}
          >
            <Empty
              description={
                <div>
                  <Text style={{ color: "#94a3b8", fontSize: 14, display: "block" }}>
                    🚧 Đang hoàn thiện
                  </Text>
                  <Text style={{ color: "#cbd5e1", fontSize: 12 }}>
                    Lịch sử hoạt động sẽ được cập nhật sau
                  </Text>
                </div>
              }
              style={{ padding: "60px 0" }}
            />
          </ProCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ProCard
            title="Top Homestay nổi bật"
            bordered={false}
            headerBordered
            style={{ borderRadius: 12 }}
          >
            <Empty
              description={
                <Text style={{ color: "#94a3b8" }}>🚧 Đang hoàn thiện</Text>
              }
              style={{ padding: "40px 0" }}
            />
          </ProCard>
        </Col>
        <Col xs={24} lg={12}>
          <ProCard
            title="Thông báo hệ thống"
            bordered={false}
            headerBordered
            style={{ borderRadius: 12 }}
          >
            <Empty
              description={
                <Text style={{ color: "#94a3b8" }}>🚧 Đang hoàn thiện</Text>
              }
              style={{ padding: "40px 0" }}
            />
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  );
}
