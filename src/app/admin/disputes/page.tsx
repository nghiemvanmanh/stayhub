"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Button,
  Space,
  Avatar,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { PageContainer, ProTable } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { DisputeDetailModal } from "@/components/admin/disputes/DisputeDetailModal";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import type { AdminDisputeItem, PaginatedResponse } from "@/interfaces/admin";
import dayjs from "dayjs";
import { ADMIN_DISPUTE_STATUS_MAP, ADMIN_DISPUTE_TAB_FILTERS } from "@/constants/dispute";

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
      <ProTable<AdminDisputeItem>
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={isLoading || isFetching}
        search={false}
        scroll={{ x: 900 }}
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
