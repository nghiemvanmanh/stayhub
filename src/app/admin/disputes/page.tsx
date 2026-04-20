"use client";

import React from "react";
import { Card, Typography, Empty } from "antd";

const { Title, Text } = Typography;

export default function AdminDisputesPage() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Quản lý khiếu nại
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Xử lý các khiếu nại từ khách hàng và chủ nhà
        </Text>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <Empty
          description={
            <div style={{ textAlign: "center" }}>
              <Text
                type="secondary"
                style={{ fontSize: 16, display: "block", marginBottom: 8 }}
              >
                🚧 Đang hoàn thiện
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Tính năng quản lý khiếu nại đang được phát triển.
                <br />
                Bạn sẽ có thể xem, phân loại và xử lý các khiếu nại tại đây.
              </Text>
            </div>
          }
          style={{ padding: "80px 0" }}
        />
      </Card>
    </div>
  );
}
