"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Button,
  Space,
  Avatar,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  DownloadOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { PageContainer, ProTable, StatisticCard } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { DisputeDetailModal } from "@/components/admin/disputes/DisputeDetailModal";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import type { AdminDisputeItem, PaginatedResponse } from "@/interfaces/admin";
import dayjs from "dayjs";
import { ADMIN_DISPUTE_STATUS_MAP, ADMIN_DISPUTE_TAB_FILTERS } from "@/constants/dispute";
import { ROLES } from "@/constants/user";

export default function AdminDisputesPage() {
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  const [selectedDispute, setSelectedDispute] = useState<AdminDisputeItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusParam = activeTab === "ALL" ? undefined : activeTab;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-disputes", pageNo, pageSize, statusParam],
    queryFn: async () => {
      const params: Record<string, unknown> = { pageNo, pageSize };
      if (statusParam) params.status = statusParam;
      const res = await fetcher.get("/bookings/admin/disputes", { params });
      return res.data?.data as PaginatedResponse<AdminDisputeItem>;
    },
  });

  const allItems = data?.items || [];

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (!searchText) return true;
      const s = searchText.toLowerCase();
      return (
        item.bookingCode?.toLowerCase().includes(s) ||
        item.creatorName?.toLowerCase().includes(s) ||
        item.creatorEmail?.toLowerCase().includes(s) ||
        item.reason?.toLowerCase().includes(s)
      );
    });
  }, [allItems, searchText]);

  // Stats calculations
  const totalDisputes = data?.totalElements || 0;
  const openDisputes = allItems.filter((i) => i.status === "OPEN" || i.status === "PENDING").length;
  const resolvedDisputes = allItems.filter((i) => i.status === "RESOLVED").length;
  const rejectedDisputes = allItems.filter((i) => i.status === "REJECTED" || i.status === "CLOSED").length;

  const handleViewDetail = (record: AdminDisputeItem) => {
    setSelectedDispute(record);
    setIsModalOpen(true);
  };

  const columns: ProColumns<AdminDisputeItem>[] = [
    {
      title: "Mã Booking",
      dataIndex: "bookingCode",
      key: "bookingCode",
      width: 130,
      render: (_: any, record: AdminDisputeItem) => (
        <span style={{ fontWeight: 600, fontSize: 13, color: "#2563eb" }}>
          #{record.bookingCode}
        </span>
      ),
    },
    {
      title: "Người tạo",
      key: "creator",
      width: 200,
      render: (_: unknown, record: AdminDisputeItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar icon={<UserOutlined />} size={36} />
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Tooltip title={record.creatorName || record.creatorEmail}>
              <span style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {record.creatorName || record.creatorEmail || "--"}
              </span>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      key: "role",
      width: 80,
      render: (_: unknown, record: AdminDisputeItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Tag color={record.creatorRole === "HOST" ? "purple" : "cyan"} style={{ alignSelf: "flex-start", marginTop: 2, fontSize: 11, padding: "0 6px" }}>
              {ROLES[record.creatorRole] || ROLES['USER']}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Lý do khiếu nại / Nội dung",
      dataIndex: "reason",
      key: "reason",
      width: 300,
      render: (_: any, record: AdminDisputeItem) => {
        let urlsCount = 0;
        if (record.evidenceImageUrls) {
          try {
            if (record.evidenceImageUrls.startsWith("[")) {
              urlsCount = JSON.parse(record.evidenceImageUrls).length;
            } else {
              urlsCount = record.evidenceImageUrls.split(",").filter(Boolean).length;
            }
          } catch (e) {}
        }
        return (
          <div>
            <span style={{ fontSize: 13, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {record.reason || "--"}
            </span>
            {urlsCount > 0 && (
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <Tag color="default" style={{ fontSize: 11 }}>
                  {urlsCount} đính kèm
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Thời gian tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      sorter: true,
      render: (date: any) => (
        <span style={{ fontSize: 13, color: "#475569" }}>
          {date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "--"}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: any) => {
        const s = ADMIN_DISPUTE_STATUS_MAP[status] || { color: "default", label: status };
        return (
          <Tag color={s.color} style={{ borderRadius: 6, fontWeight: 500 }}>
            {s.label}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      fixed: "right",
      render: (_: unknown, record: AdminDisputeItem) => (
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
        </Space>
      ),
    },
  ];

  const tabItems = (ADMIN_DISPUTE_TAB_FILTERS as any[]).map((f: any) => ({
    key: typeof f === "string" ? f : f.value,
    label: typeof f === "string" ? f : f.label,
  }));

  return (
    <PageContainer
      header={{
        title: "Quản lý Khiếu nại",
        subTitle: "Danh sách khiếu nại tranh chấp từ khách hàng và chủ nhà.",
      }}
    >
      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tổng khiếu nại",
              value: totalDisputes,
              description: <span style={{ fontSize: 12, color: "#94a3b8" }}>Toàn hệ thống</span>,
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#e8f8f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ExclamationCircleOutlined style={{ fontSize: 20, color: "#2DD4A8" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Đang mở",
              value: String(openDisputes).padStart(2, "0"),
              description: <span style={{ fontSize: 12, color: "#f97316" }}>Cần xử lý ngay</span>,
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ClockCircleOutlined style={{ fontSize: 20, color: "#f97316" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Đã giải quyết",
              value: resolvedDisputes,
              description: <span style={{ fontSize: 12, color: "#22c55e" }}>Hoàn tất xử lý</span>,
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircleOutlined style={{ fontSize: 20, color: "#22c55e" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Bị từ chối / Đóng",
              value: rejectedDisputes,
              description: <span style={{ fontSize: 12, color: "#ef4444" }}>Không hợp lệ</span>,
              icon: (
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CloseCircleOutlined style={{ fontSize: 20, color: "#ef4444" }} />
                </div>
              ),
            }}
            style={{ borderRadius: 12, height: "100%" }}
          />
        </Col>
      </Row>

      <ProTable<AdminDisputeItem>
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={isLoading || isFetching}
        search={false}
        scroll={{ x: "max-content" }}
        cardBordered
        headerTitle="Danh sách khiếu nại"
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
            placeholder: "Tìm mã Booking, người tạo...",
            onSearch: (value: string) => setSearchText(value),
            allowClear: true,
          },
        }}
        toolBarRender={() => [
          <Button key="export" icon={<DownloadOutlined />}>
            Xuất dữ liệu
          </Button>,
        ]}
        pagination={{
          current: pageNo,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `Hiển thị ${range[0]} - ${range[1]} của ${total} khiếu nại`,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (page, size) => {
            setPageNo(page);
            setPageSize(size);
          },
        }}
      />

      <DisputeDetailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dispute={selectedDispute}
      />
    </PageContainer>
  );
}
