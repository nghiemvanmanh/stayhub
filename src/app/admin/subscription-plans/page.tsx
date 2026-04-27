"use client";

import React, { useState } from "react";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { Button, Tag, Space, Tooltip, Modal, message } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import type { AdminSubscriptionPlan } from "@/interfaces/admin";

export default function AdminSubscriptionPlansPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AdminSubscriptionPlan | null>(null);

  // Note: the api endpoint returns the array of data directly inside `data` (or maybe `data.data`), let's assume it returns { data: AdminSubscriptionPlan[] } based on your other apis
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: async () => {
      const res = await fetcher.get("/properties/admin/subscription-plans");
      // Fallback in case the response is nested or an array directly
      return (res.data?.data || res.data || []) as AdminSubscriptionPlan[];
    },
  });

  const handleViewDetail = (record: AdminSubscriptionPlan) => {
    setSelectedPlan(record);
    setIsModalVisible(true);
  };

  const handleEdit = (record: AdminSubscriptionPlan) => {
    // Tương lai sẽ thêm form sửa
    messageApi.info("Tính năng Sửa đang được phát triển!");
  };

  const handleDelete = (record: AdminSubscriptionPlan) => {
    // Tương lai sẽ thêm xử lý xoá
    Modal.confirm({
      title: "Xác nhận xoá",
      content: `Bạn có chắc chắn muốn xoá gói cước "${record.name}" không?`,
      okText: "Xoá",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        messageApi.info("Tính năng Xoá đang được phát triển!");
      },
    });
  };

  const columns: ProColumns<AdminSubscriptionPlan>[] = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (_: any, record) => (
        <span style={{ fontSize: 13, fontFamily: "monospace", color: "#475569" }}>
          {record.id}
        </span>
      ),
    },
    {
      title: "Tên gói cước",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text: any, record) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{text}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: "Cấp độ (Tier)",
      dataIndex: "tier",
      key: "tier",
      width: 120,
      render: (tier: any) => {
        let color = "default";
        if (tier === "FREE") color = "success";
        if (tier === "PREMIUM") color = "gold";
        if (tier === "PRO") color = "blue";
        return (
          <Tag color={color} style={{ fontWeight: 500 }}>
            {tier}
          </Tag>
        );
      },
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price: any) => (
        <span style={{ fontWeight: 600, color: "#2DD4A8" }}>
          {price ? `${Number(price).toLocaleString("vi-VN")} đ` : "Miễn phí"}
        </span>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "durationMonths",
      key: "durationMonths",
      width: 120,
      render: (months: any) => (
        <span>{months} tháng</span>
      ),
    },
    {
      title: "Hoa hồng",
      dataIndex: "commissionRate",
      key: "commissionRate",
      width: 120,
      render: (rate: any) => (
        <span style={{ color: "#ef4444", fontWeight: 500 }}>{rate}%</span>
      ),
    },
    {
      title: "Giới hạn bài đăng",
      dataIndex: "maxListings",
      key: "maxListings",
      width: 140,
      render: (max: any) => (
        <span>{max === 1073741824 || max === -1 ? "Không giới hạn" : max}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_: unknown, record: AdminSubscriptionPlan) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              style={{ color: "#2563eb" }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: "#f59e0b" }}
            />
          </Tooltip>
          <Tooltip title="Xoá">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              style={{ color: "#ef4444" }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: "Quản lý gói cước",
        subTitle: "Xem và cấu hình các gói dịch vụ dành cho Host",
      }}
    >
      {contextHolder}

      <ProTable<AdminSubscriptionPlan>
        columns={columns}
        dataSource={data || []}
        rowKey="id"
        loading={isLoading}
        search={false}
        scroll={{ x: "max-content" }}
        cardBordered
        headerTitle="Danh sách các gói cước"
        options={{
          reload: () => refetch(),
          density: true,
          setting: true,
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => messageApi.info("Tính năng Thêm đang được phát triển!")}
            style={{ backgroundColor: "#2DD4A8" }}
          >
            Thêm gói cước
          </Button>,
        ]}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />

      <Modal
        title="Chi tiết gói cước"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedPlan && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <span style={{ fontWeight: 600, display: "inline-block", width: 150 }}>Tên gói cước:</span>
              <span>{selectedPlan.name}</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, display: "inline-block", width: 150 }}>Mô tả:</span>
              <span>{selectedPlan.description || "--"}</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, display: "inline-block", width: 150 }}>Cấp độ:</span>
              <Tag color="blue">{selectedPlan.tier}</Tag>
            </div>
            <div>
              <span style={{ fontWeight: 600, display: "inline-block", width: 150 }}>Giá:</span>
              <span style={{ fontWeight: 600, color: "#2DD4A8" }}>
                {selectedPlan.price ? `${Number(selectedPlan.price).toLocaleString("vi-VN")} đ` : "Miễn phí"}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 600, display: "inline-block", width: 150 }}>Thời lượng:</span>
              <span>{selectedPlan.durationMonths} tháng</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, display: "inline-block", width: 150 }}>Hoa hồng hệ thống:</span>
              <span>{selectedPlan.commissionRate}%</span>
            </div>
            <div>
              <span style={{ fontWeight: 600, display: "inline-block", width: 150 }}>Giới hạn bài đăng:</span>
              <span>
                {selectedPlan.maxListings === 1073741824 || selectedPlan.maxListings === -1
                  ? "Không giới hạn"
                  : selectedPlan.maxListings}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 600, display: "inline-block", width: 150 }}>Giới hạn tín dụng:</span>
              <span>{selectedPlan.creditLimit ? `${Number(selectedPlan.creditLimit).toLocaleString("vi-VN")} đ` : "0 đ"}</span>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
