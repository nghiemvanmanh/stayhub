"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Button,
  Avatar,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  LockOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { PageContainer, ProTable, StatisticCard } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import dayjs from "dayjs";
import { ROLES } from "@/constants/user";

interface UserItem {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string;
  phoneNumber: string;
  roles: string[];
  status: string;
  lastLoginAt: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Hoạt động", color: "green" },
  UNVERIFIED: { label: "Chưa xác minh", color: "orange" },
  BANNED: { label: "Bị cấm", color: "red" },
  LOCKED: { label: "Bị khoá", color: "default" },
};

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "red",
  HOST: "purple",
  USER: "cyan",
  GUEST: "blue",
};

const TAB_FILTERS = [
  { key: "ALL", label: "Tất cả" },
  { key: "ACTIVE", label: "Hoạt động" },
  { key: "UNVERIFIED", label: "Chưa xác minh" },
  { key: "BANNED", label: "Bị cấm" },
  { key: "LOCKED", label: "Bị khoá" },
];

export default function AdminAccountsPage() {
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const statusParam = activeTab === "ALL" ? null : activeTab;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", pageNo, pageSize, statusParam],
    queryFn: async () => {
      const params: Record<string, any> = { pageNo, pageSize };
      if (statusParam) params.status = statusParam;
      const res = await fetcher.get("/auth/admin/users", { params });
      return res.data?.data ?? res.data;
    },
  });

  const allUsers: UserItem[] = data?.items || [];
  const totalElements = data?.totalElements || 0;

  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) return allUsers;
    const q = searchText.trim().toLowerCase();
    return allUsers.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phoneNumber?.includes(q)
    );
  }, [allUsers, searchText]);

  // Stats
  const totalActive = allUsers.filter((u) => u.status === "ACTIVE").length;
  const totalUnverified = allUsers.filter((u) => u.status === "UNVERIFIED").length;
  const totalBanned = allUsers.filter((u) => u.status === "BANNED").length;

  const columns: ProColumns<UserItem>[] = [
    {
      title: "Người dùng",
      key: "user",
      width: 280,
      render: (_: any, record: UserItem) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatarUrl}
            icon={<UserOutlined />}
            size={40}
            className="flex-shrink-0"
          />
          <div className="min-w-0">
            <Tooltip title={record.fullName}>
              <div className="font-semibold text-sm text-gray-900 truncate max-w-[180px]">
                {record.fullName || "--"}
              </div>
            </Tooltip>
            <Tooltip title={record.email}>
              <div className="text-xs text-gray-400 truncate max-w-[180px]">
                {record.email || "--"}
              </div>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 140,
      render: (phone: any) => (
        <span className="text-sm text-gray-600">{phone || "--"}</span>
      ),
    },
    {
      title: "Vai trò",
      key: "roles",
      width: 150,
      render: (_: any, record: UserItem) => (
        <div className="flex flex-wrap gap-1">
          {(record.roles || []).map((role) => (
            <Tag
              key={role}
              color={ROLE_COLOR[role] || "default"}
              style={{ borderRadius: 20, fontSize: 11, fontWeight: 500, border: 0, padding: "1px 8px" }}
            >
              {ROLES[role]}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: any) => {
        const s = STATUS_MAP[status] || { label: status, color: "default" };
        return (
          <Tag color={s.color} style={{ borderRadius: 20, fontSize: 12, fontWeight: 500, border: 0, padding: "2px 10px" }}>
            {s.label}
          </Tag>
        );
      },
    },
    {
      title: "Đăng nhập gần nhất",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      width: 150,
      render: (date: any) => (
        <span className="text-sm text-gray-500">
          {date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "--"}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: any) => (
        <span className="text-sm text-gray-500">
          {date ? dayjs(date).format("DD/MM/YYYY") : "--"}
        </span>
      ),
    },
  ];

  const tabItems = TAB_FILTERS.map((f) => ({ key: f.key, label: f.label }));

  return (
    <PageContainer
      header={{
        title: "Quản lý tài khoản",
        subTitle: "Quản lý tất cả tài khoản người dùng trên hệ thống",
      }}
      extra={[
        <Button key="export" icon={<DownloadOutlined />} style={{ borderRadius: 12, height: 40 }}>
          Xuất dữ liệu
        </Button>,
      ]}
    >
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tổng tài khoản",
              value: totalElements,
              description: <span style={{ fontSize: 12, color: "#94a3b8" }}>Toàn hệ thống</span>,
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e8f8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TeamOutlined style={{ fontSize: 20, color: "#2DD4A8" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Đang hoạt động",
              value: totalActive,
              description: <span style={{ fontSize: 12, color: "#2DD4A8" }}>Tài khoản active</span>,
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SafetyCertificateOutlined style={{ fontSize: 20, color: "#22c55e" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Chưa xác minh",
              value: totalUnverified,
              description: <span style={{ fontSize: 12, color: "#f97316" }}>Cần xác nhận email</span>,
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <StopOutlined style={{ fontSize: 20, color: "#f97316" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Bị cấm / Khoá",
              value: totalBanned,
              description: <span style={{ fontSize: 12, color: "#ef4444" }}>Vi phạm chính sách</span>,
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LockOutlined style={{ fontSize: 20, color: "#ef4444" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
      </Row>

      {/* ProTable */}
      <ProTable<UserItem>
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={isLoading}
        search={false}
        cardBordered
        headerTitle="Danh sách tài khoản"
        scroll={{ x: "max-content" }}
        options={{
          reload: () => refetch(),
          density: true,
          setting: true,
        }}
        toolbar={{
          menu: {
            type: "tab",
            activeKey: activeTab,
            items: tabItems,
            onChange: (key) => {
              setActiveTab(key as string);
              setPageNo(1);
            },
          },
          search: {
            placeholder: "Tìm tên, email, SĐT...",
            onSearch: (value: string) => setSearchText(value),
            allowClear: true,
          },
        }}
        pagination={{
          current: pageNo,
          pageSize,
          total: totalElements,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `Hiển thị ${range[0]} – ${range[1]} trong tổng số ${total} tài khoản`,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (page, size) => {
            setPageNo(page);
            setPageSize(size);
          },
        }}
      />
    </PageContainer>
  );
}
