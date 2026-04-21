"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Button,
  Space,
  Avatar,
  Tooltip,
  message,
  Row,
  Col,
  Empty,
  Dropdown,
  Modal,
  Input,
  Drawer,
  Descriptions,
  Typography,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  AppstoreOutlined,
  AlertOutlined,
  StarOutlined,
  ArrowUpOutlined,
  MoreOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { PageContainer, ProTable, StatisticCard } from "@ant-design/pro-components";
import type { ProColumns } from "@ant-design/pro-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import type { AdminPropertyItem, PaginatedResponse } from "@/interfaces/admin";
import dayjs from "dayjs";
import {
  PROPERTY_STATUS_MAP,
  ALL_ADMIN_PROPERTY_STATUSES as ALL_STATUSES,
  ADMIN_PROPERTY_TAB_FILTERS as TAB_FILTERS,
} from "@/constants/property";

const { Text } = Typography;
const { TextArea } = Input;

export default function AdminPropertiesPage() {
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();

  const [selectedProperty, setSelectedProperty] =
    useState<AdminPropertyItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<string>("PUBLISHED");
  const [reviewPropertyId, setReviewPropertyId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const statusParam = activeTab === "ALL" ? undefined : activeTab;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-properties", pageNo, pageSize, statusParam],
    queryFn: async () => {
      const params: Record<string, unknown> = { pageNo, pageSize };
      if (statusParam) params.status = statusParam;
      const res = await fetcher.get("/properties/admin", { params });
      return res.data?.data as PaginatedResponse<AdminPropertyItem>;
    },
  });

  // Status change mutation
  const reviewMutation = useMutation({
    mutationFn: async (d: {
      propertyId: number;
      status: string;
      reason: string;
    }) => {
      return fetcher.put(`/properties/admin/${d.propertyId}/review`, {
        status: d.status,
        reason: d.reason,
      });
    },
    onSuccess: () => {
      const label =
        ALL_STATUSES.find((s) => s.value === reviewAction)?.label ||
        reviewAction;
      messageApi.success(`Đã cập nhật trạng thái: ${label}`);
      setReviewModalOpen(false);
      setReviewNote("");
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
    onError: (error: any) => {
      messageApi.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật trạng thái"
      );
    },
  });

  const handleViewDetail = (record: AdminPropertyItem) => {
    setSelectedProperty(record);
    setDetailDrawerOpen(true);
  };

  const handleOpenReview = (
    record: AdminPropertyItem,
    targetStatus: string
  ) => {
    setReviewPropertyId(record.id);
    setReviewAction(targetStatus);
    setReviewNote("");
    setReviewModalOpen(true);
  };

  const handleSubmitReview = () => {
    if (!reviewPropertyId) return;
    reviewMutation.mutate({
      propertyId: reviewPropertyId,
      status: reviewAction,
      reason: reviewNote.trim(),
    });
  };

  const filteredItems = useMemo(() => {
    return (data?.items || []).filter((item) => {
      if (!searchText) return true;
      const s = searchText.toLowerCase();
      return (
        item.name?.toLowerCase().includes(s) ||
        item.hostName?.toLowerCase().includes(s) ||
        item.hostEmail?.toLowerCase().includes(s) ||
        item.province?.toLowerCase().includes(s) ||
        item.district?.toLowerCase().includes(s)
      );
    });
  }, [data?.items, searchText]);

  const totalProperties = data?.totalElements || 0;
  const pendingReview = (data?.items || []).filter(
    (i) => i.status === "PENDING_REVIEW"
  ).length;

  const columns: ProColumns<AdminPropertyItem>[] = [
    {
      title: "Tên Homestay & Vị trí",
      key: "property",
      width: 340,
      render: (_: unknown, record: AdminPropertyItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 68,
              height: 52,
              borderRadius: 8,
              overflow: "hidden",
              flexShrink: 0,
              background: "#f5f5f5",
              border: "1px solid #f0f0f0",
            }}
          >
            {record.thumbnailUrl ? (
              <img
                src={record.thumbnailUrl}
                alt={record.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HomeOutlined style={{ color: "#d9d9d9", fontSize: 18 }} />
              </div>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <Tooltip title={record.name}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#1a1a2e",
                  lineHeight: 1.3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {record.name}
              </div>
            </Tooltip>
            <Tooltip
              title={
                [record.district, record.province].filter(Boolean).join(", ") ||
                "--"
              }
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                  marginTop: 3,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <EnvironmentOutlined
                  style={{ marginRight: 4, fontSize: 11 }}
                />
                {[record.district, record.province].filter(Boolean).join(", ") ||
                  "--"}
              </div>
            </Tooltip>
            {record.categoryName && (
              <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>
                {record.categoryName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Chủ nhà",
      key: "host",
      width: 190,
      render: (_: unknown, record: AdminPropertyItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            src={record.hostAvatarUrl}
            icon={<UserOutlined />}
            size={34}
          />
          <div style={{ minWidth: 0 }}>
            <Tooltip title={record.hostName || "--"}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: 13,
                  color: "#1a1a2e",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {record.hostName || "--"}
              </div>
            </Tooltip>
            <Tooltip title={record.hostEmail || "--"}>
              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {record.hostEmail || "--"}
              </div>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 155,
      render: (status: any) => {
        const s = PROPERTY_STATUS_MAP[status] || {
          color: "default",
          label: status,
        };
        return (
          <Tag
            color={s.color}
            style={{ borderRadius: 6, fontWeight: 500, padding: "2px 10px" }}
          >
            {s.label}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      sorter: true,
      render: (date: any) => (
        <span style={{ fontSize: 13, color: "#475569" }}>
          {date ? dayjs(date).format("DD/MM/YYYY") : "--"}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 90,
      fixed: "right",
      render: (_: unknown, record: AdminPropertyItem) => {
        const statusMenuItems = ALL_STATUSES.filter(
          (s) => s.value !== record.status
        ).map((s) => ({
          key: `status-${s.value}`,
          label: <span style={{ color: s.color }}>{s.label}</span>,
          onClick: () => handleOpenReview(record, s.value),
        }));

        return (
          <Space size={4}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
                style={{ color: "#2DD4A8" }}
              />
            </Tooltip>
            <Dropdown
              menu={{ items: statusMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                size="small"
                icon={<MoreOutlined />}
                style={{ color: "#94a3b8" }}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const tabItems = (TAB_FILTERS as any[]).map((f: any) => ({
    key: typeof f === "string" ? f : f.value,
    label: typeof f === "string" ? f : f.label,
  }));

  return (
    <PageContainer
      header={{
        title: "Quản lý Danh sách Lưu trú",
        subTitle:
          "Giám sát, phê duyệt và quản lý tất cả các homestay trên nền tảng.",
      }}
      extra={[
        <Button key="export" icon={<DownloadOutlined />}>
          Xuất báo cáo
        </Button>,
        <Button
          key="reload"
          icon={<ReloadOutlined />}
          onClick={() =>
            queryClient.invalidateQueries({ queryKey: ["admin-properties"] })
          }
        >
          Làm mới
        </Button>,
      ]}
    >
      {contextHolder}

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          {
            title: "Tổng danh sách",
            value: totalProperties,
            icon: <HomeOutlined />,
            iconBg: "#e8f8f3",
            iconColor: "#2DD4A8",
          },
          {
            title: "Chờ duyệt",
            value: pendingReview,
            icon: <AlertOutlined />,
            iconBg: "#fff8e6",
            iconColor: "#faad14",
          },
          {
            title: "Đã đăng công khai",
            value: (data?.items || []).filter((i) => i.status === "PUBLISHED")
              .length,
            icon: <AppstoreOutlined />,
            iconBg: "#e6f4ff",
            iconColor: "#1677ff",
          },
          {
            title: "Bị ẩn / Cấm",
            value: (data?.items || []).filter(
              (i) => i.status === "HIDDEN" || i.status === "BANNED"
            ).length,
            icon: <StarOutlined />,
            iconBg: "#fff1f0",
            iconColor: "#ff4d4f",
          },
        ].map((stat, i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <StatisticCard
              statistic={{
                title: stat.title,
                value: stat.value,
                icon: (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: stat.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      color: stat.iconColor,
                    }}
                  >
                    {stat.icon}
                  </div>
                ),
              }}
              style={{ borderRadius: 12, height: "100%" }}
            />
          </Col>
        ))}
      </Row>

      {/* ProTable */}
      <ProTable<AdminPropertyItem>
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        loading={isLoading || isFetching}
        search={false}
        scroll={{ x: 900 }}
        cardBordered
        headerTitle="Danh sách lưu trú"
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
            placeholder: "Tìm theo tên, địa chỉ hoặc chủ nhà...",
            onSearch: (value: string) => setSearchText(value),
            allowClear: true,
          },
        }}
        pagination={{
          current: pageNo,
          pageSize,
          total: data?.totalElements || 0,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `Đang hiển thị ${range[0]}-${range[1]} trên ${total} kết quả`,
          pageSizeOptions: ["10", "20", "50"],
          onChange: (page, size) => {
            setPageNo(page);
            setPageSize(size);
          },
        }}
      />

      {/* ============ DETAIL DRAWER ============ */}
      <Drawer
        title={null}
        placement="right"
        width={520}
        open={detailDrawerOpen}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedProperty(null);
        }}
        styles={{ body: { padding: 0 } }}
        extra={
          selectedProperty &&
          selectedProperty.status !== "PUBLISHED" && (
            <Dropdown
              menu={{
                items: ALL_STATUSES.filter(
                  (s) => s.value !== selectedProperty.status
                ).map((s) => ({
                  key: s.value,
                  label: <span style={{ color: s.color }}>{s.label}</span>,
                  onClick: () => {
                    handleOpenReview(selectedProperty, s.value);
                    setDetailDrawerOpen(false);
                  },
                })),
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button icon={<MoreOutlined />} style={{ borderRadius: 8 }}>
                Thay đổi trạng thái
              </Button>
            </Dropdown>
          )
        }
      >
        {selectedProperty ? (
          <>
            {/* Thumbnail Banner */}
            <div
              style={{
                height: 200,
                overflow: "hidden",
                position: "relative",
                background: "#f5f5f5",
              }}
            >
              {selectedProperty.thumbnailUrl ? (
                <>
                  <img
                    src={selectedProperty.thumbnailUrl}
                    alt={selectedProperty.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.65))",
                      padding: "40px 20px 16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                        lineHeight: 1.3,
                      }}
                    >
                      {selectedProperty.name}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.8)",
                        marginTop: 4,
                      }}
                    >
                      <EnvironmentOutlined style={{ marginRight: 4 }} />
                      {[selectedProperty.district, selectedProperty.province]
                        .filter(Boolean)
                        .join(", ") || "--"}
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HomeOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                </div>
              )}
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Status & Category */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <Tag
                  color={
                    PROPERTY_STATUS_MAP[selectedProperty.status]?.color ||
                    "default"
                  }
                  style={{
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: "4px 14px",
                    fontSize: 13,
                  }}
                >
                  {PROPERTY_STATUS_MAP[selectedProperty.status]?.label ||
                    selectedProperty.status}
                </Tag>
                {selectedProperty.categoryName && (
                  <Tag
                    style={{
                      borderRadius: 6,
                      padding: "4px 12px",
                      fontSize: 13,
                    }}
                  >
                    {selectedProperty.categoryName}
                  </Tag>
                )}
              </div>

              {/* Info Descriptions */}
              <Descriptions
                bordered
                size="small"
                column={1}
                labelStyle={{
                  fontWeight: 600,
                  width: 140,
                  background: "#fafafa",
                  fontSize: 13,
                }}
                contentStyle={{ fontSize: 13 }}
              >
                <Descriptions.Item
                  label={
                    <>
                      <UserOutlined style={{ marginRight: 6 }} />
                      Chủ nhà
                    </>
                  }
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Avatar
                      src={selectedProperty.hostAvatarUrl}
                      icon={<UserOutlined />}
                      size={28}
                    />
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {selectedProperty.hostName || "--"}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {selectedProperty.hostEmail || "--"}
                      </div>
                    </div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <EnvironmentOutlined style={{ marginRight: 6 }} />
                      Tỉnh / TP
                    </>
                  }
                >
                  {selectedProperty.province || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Quận / Huyện">
                  {selectedProperty.district || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                  {selectedProperty.categoryName || "--"}
                </Descriptions.Item>
                <Descriptions.Item label="Slug">
                  <Text copyable code style={{ fontSize: 12 }}>
                    {selectedProperty.slug || "--"}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <CalendarOutlined style={{ marginRight: 6 }} />
                      Ngày tạo
                    </>
                  }
                >
                  {selectedProperty.createdAt
                    ? dayjs(selectedProperty.createdAt).format(
                        "DD/MM/YYYY HH:mm"
                      )
                    : "--"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </>
        ) : (
          <Empty
            description="Không có dữ liệu"
            style={{ padding: "80px 0" }}
          />
        )}
      </Drawer>

      {/* ============ REVIEW MODAL ============ */}
      <Modal
        title={
          <Space>
            <span>
              {ALL_STATUSES.find((s) => s.value === reviewAction)?.label ||
                reviewAction}
            </span>
          </Space>
        }
        open={reviewModalOpen}
        onCancel={() => setReviewModalOpen(false)}
        onOk={handleSubmitReview}
        confirmLoading={reviewMutation.isPending}
        okText="Xác nhận"
        okButtonProps={{
          danger:
            reviewAction === "REJECTED" || reviewAction === "BANNED",
          style:
            reviewAction === "PUBLISHED"
              ? { background: "#2DD4A8", borderColor: "#2DD4A8" }
              : {},
        }}
        cancelText="Hủy"
        styles={{ body: { paddingTop: 16 } }}
      >
        <div>
          <p style={{ marginBottom: 12, color: "#475569" }}>
            Chuyển trạng thái sang:{" "}
            <strong
              style={{
                color: ALL_STATUSES.find((s) => s.value === reviewAction)
                  ?.color,
              }}
            >
              {PROPERTY_STATUS_MAP[reviewAction]?.label || reviewAction}
            </strong>
          </p>
          <Text
            style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
          >
            Ghi chú / Lý do
          </Text>
          <TextArea
            rows={4}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Nhập ghi chú cho thao tác này (không bắt buộc)..."
            style={{ borderRadius: 8 }}
          />
        </div>
      </Modal>
    </PageContainer>
  );
}
