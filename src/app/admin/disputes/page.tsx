"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Space,
  Typography,
  Avatar,
  Tooltip,
  Segmented,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { DisputeDetailModal } from "@/components/admin/disputes/DisputeDetailModal";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import type { ColumnsType } from "antd/es/table";
import type { AdminDisputeItem, PaginatedResponse } from "@/interfaces/admin";
import dayjs from "dayjs";
import { ADMIN_DISPUTE_STATUS_MAP, ADMIN_DISPUTE_TAB_FILTERS } from "@/constants/dispute";

const { Title, Text } = Typography;

export default function AdminDisputesPage() {
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  // Detail Modal State
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

  const filteredItems = useMemo(() => {
    return (data?.items || []).filter((item) => {
      if (!searchText) return true;
      const s = searchText.toLowerCase();
      return (
        item.bookingCode?.toLowerCase().includes(s) ||
        item.creatorName?.toLowerCase().includes(s) ||
        item.creatorEmail?.toLowerCase().includes(s) ||
        item.reason?.toLowerCase().includes(s)
      );
    });
  }, [data?.items, searchText]);

  const handleViewDetail = (record: AdminDisputeItem) => {
    setSelectedDispute(record);
    setIsModalOpen(true);
  };



  const columns: ColumnsType<AdminDisputeItem> = [
    {
      title: "Mã Booking",
      dataIndex: "bookingCode",
      key: "bookingCode",
      width: 130,
      render: (code: string) => (
        <Text strong style={{ fontSize: 13, color: "#2563eb" }}>
          #{code}
        </Text>
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
              <Text strong style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {record.creatorName || record.creatorEmail || "--"}
              </Text>
            </Tooltip>
            <Tag color={record.creatorRole === "HOST" ? "purple" : "cyan"} style={{ alignSelf: "flex-start", marginTop: 2, fontSize: 11, padding: "0 6px" }}>
              {record.creatorRole || "USER"}
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
      render: (reason: string, record: AdminDisputeItem) => {
        let urlsCount = 0;
        if (record.evidenceImageUrls) {
           try {
              if (record.evidenceImageUrls.startsWith("[")) {
                 urlsCount = JSON.parse(record.evidenceImageUrls).length;
              } else {
                 urlsCount = record.evidenceImageUrls.split(",").filter(Boolean).length;
              }
           } catch(e) {}
        }
        return (
          <div>
            <Text style={{ fontSize: 13, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {reason || "--"}
            </Text>
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
      render: (date: string) => (
        <Text style={{ fontSize: 13, color: "#475569" }}>
          {date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "--"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => {
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



  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#1a1a2e" }}>
          Quản lý Khiếu nại
        </Title>
        <Text style={{ color: "#94a3b8", fontSize: 14 }}>
          Danh sách khiếu nại tranh chấp từ khách hàng và chủ nhà.
        </Text>
      </div>

      {/* Main Table Card */}
      <Card bordered={false} style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flex: "1 1 200px", flexWrap: "wrap" }}>
            <Input
              placeholder="Tìm mã Booking, người tạo..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1, minWidth: 200, maxWidth: 300, borderRadius: 8, height: 38 }}
              allowClear
            />
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", maxWidth: "100%" }}>
            <div style={{ maxWidth: "100%", overflowX: "auto" }}>
              <Segmented
                options={ADMIN_DISPUTE_TAB_FILTERS}
                value={activeTab}
                onChange={(val) => { setActiveTab(val as string); setPageNo(1); }}
                style={{ borderRadius: 8 }}
              />
            </div>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()} 
              loading={isFetching}
              style={{ borderRadius: 8, height: 38 }}
            />
            <Button icon={<DownloadOutlined />} style={{ borderRadius: 8, height: 38 }}>
              Xuất dữ liệu
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredItems}
          rowKey="id"
          loading={isLoading || isFetching}
          scroll={{ x: 900 }}
          pagination={{
            current: pageNo,
            pageSize,
            total: data?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total, range) => `Hiển thị ${range[0]} - ${range[1]} của ${total} khiếu nại`,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (page, size) => { setPageNo(page); setPageSize(size); },
            style: { padding: "0 20px" },
          }}
        />
      </Card>

      {/* Detail Modal */}
      <DisputeDetailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dispute={selectedDispute}
      />
    </div>
  );
}
