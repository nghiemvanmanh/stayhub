"use client";

import React, { useState, useMemo } from "react";
import {
  Tag,
  Button,
  Avatar,
  Input,
  Modal,
  message,
  Rate,
  Image,
  Row,
  Col,
} from "antd";
import {
  StarFilled,
  MessageOutlined,
  SendOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { PageContainer, ProTable, ProColumns, StatisticCard } from "@ant-design/pro-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import relativeTime from "dayjs/plugin/relativeTime";
import { HostBookingReview } from "@/interfaces/review";
import { Users, Star, MessageSquare, Clock } from "lucide-react";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { TextArea } = Input;

interface HostBookingWithReview {
  bookingCode: string;
  guestName: string;
  propertyName: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  finalAmount: number;
  amountPaid: number;
  isFullyPaid: boolean;
  status: string;
  createdAt: string;
  review: HostBookingReview | null;
}

export default function HostReviews() {
  const queryClient = useQueryClient();
  const [replyModal, setReplyModal] = useState<{
    reviewId: number;
    guestName: string;
    comment: string;
    existingReply?: string;
  } | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch properties for the filter dropdown
  const { data: properties } = useQuery({
    queryKey: ["host-properties-for-filter"],
    queryFn: async () => {
      const res = await fetcher.get("/properties/host?pageNo=1&pageSize=100");
      return res.data?.data?.items || [];
    },
  });

  const propertyValueEnum = useMemo(() => {
    const enumObj: Record<string, { text: string }> = {};
    if (properties) {
      properties.forEach((p: any) => {
        enumObj[p.name] = { text: p.name };
      });
    }
    return enumObj;
  }, [properties]);

  // Fetch bookings and calculate stats
  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ["host-reviews-data"],
    queryFn: async () => {
      const res = await fetcher.get("/bookings/host", { params: { page: 1, size: 500 } });
      return res.data?.data?.items || [];
    },
  });

  const allBookingsWithReviews = useMemo(() => {
    return (apiResponse || []).filter((b: any) => b.review);
  }, [apiResponse]);

  const stats = useMemo(() => {
    const total = allBookingsWithReviews.length;
    const avgRating =
      total > 0
        ? (
            allBookingsWithReviews.reduce((sum: number, b: any) => sum + b.review.rating, 0) / total
          ).toFixed(1)
        : "0.0";
    const fiveStars = allBookingsWithReviews.filter((b: any) => b.review.rating === 5).length;
    const pendingReplies = allBookingsWithReviews.filter((b: any) => !b.review.hostReply).length;
    return { total, avgRating, fiveStars, pendingReplies };
  }, [allBookingsWithReviews]);

  const replyMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: number; reply: string }) => {
      const res = await fetcher.put(`/reviews/host/${reviewId}/reply`, { reply });
      return res.data;
    },
    onSuccess: () => {
      message.success("Đã lưu phản hồi thành công!");
      setReplyModal(null);
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["host-reviews-data"] });
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.data ||
          "Lưu phản hồi thất bại. Vui lòng thử lại."
      );
    },
  });

  const handleReply = () => {
    if (!replyText.trim()) {
      message.warning("Vui lòng nhập nội dung phản hồi");
      return;
    }
    if (!replyModal) return;
    replyMutation.mutate({ reviewId: replyModal.reviewId, reply: replyText.trim() });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "#22c55e";
    if (rating >= 3) return "#f59e0b";
    return "#ef4444";
  };

  const columns: ProColumns<HostBookingWithReview>[] = [
    {
      title: "Chỗ ở / Homestay",
      dataIndex: "propertyName",
      valueType: "select",
      valueEnum: propertyValueEnum,
      fieldProps: {
        showSearch: true,
        placeholder: "Chọn hoặc tìm chỗ ở",
      },
      render: (_, record) => (
        <div className="flex flex-col min-w-[150px]">
          <span className="font-semibold text-gray-800 line-clamp-2" title={record.propertyName}>{record.propertyName}</span>
          <span className="text-xs text-gray-400 mt-1">Mã: {record.bookingCode}</span>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      key: "guest",
      search: false,
      render: (_, record) => {
        const review = record.review!;
        return (
          <div className="flex items-center gap-3 min-w-[140px]">
            <Avatar src={review.guestAvatarUrl} size={40} className="flex-shrink-0">
              {review.guestName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 line-clamp-1" title={review.guestName}>{review.guestName}</span>
              <span className="text-xs text-gray-500">
                {review.createdAt ? dayjs(review.createdAt).format("DD/MM/YYYY HH:mm") : ""}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Nội dung đánh giá",
      key: "reviewContent",
      search: false,
      width: "35%",
      render: (_, record) => {
        const review = record.review!;
        return (
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: `${getRatingColor(review.rating)}15`, color: getRatingColor(review.rating) }}
              >
                <StarFilled className="text-xs" />
                <span className="font-bold text-xs">{review.rating}</span>
              </div>
              <Rate disabled defaultValue={review.rating} className="text-[10px]" style={{ color: "#fadb14" }} />
            </div>
            <p className="text-sm text-gray-700 m-0 line-clamp-3" title={review.comment}>{review.comment}</p>
            {review.imageUrls && review.imageUrls.length > 0 && (
              <div className="flex gap-2 mt-1">
                <Image.PreviewGroup>
                  {review.imageUrls.map((url, idx) => (
                    <Image
                      key={idx}
                      src={url}
                      alt={`Review image ${idx}`}
                      width={50}
                      height={50}
                      className="rounded-lg object-cover border border-gray-200"
                    />
                  ))}
                </Image.PreviewGroup>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Phản hồi của bạn",
      key: "hostReply",
      search: false,
      width: "25%",
      render: (_, record) => {
        const review = record.review!;
        if (review.hostReply) {
          return (
            <div className="bg-green-50 border-l-2 border-[#2DD4A8] p-3 rounded-r-lg min-w-[180px] relative group">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-green-800">Đã phản hồi</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">
                    {review.replyTime ? dayjs(review.replyTime).format("DD/MM/YYYY") : ""}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-700 m-0 line-clamp-3" title={review.hostReply}>
                {review.hostReply}
              </p>
            </div>
          );
        }
        return (
          <Button
            type="dashed"
            icon={<MessageOutlined />}
            onClick={() => {
              setReplyText("");
              setReplyModal({
                reviewId: review.id,
                guestName: review.guestName,
                comment: review.comment,
              });
            }}
            className="text-[#2DD4A8] border-[#2DD4A8] hover:text-[#25bc95] hover:border-[#25bc95]"
          >
            Viết phản hồi
          </Button>
        );
      },
    },
  ];

  return (
    <PageContainer
      header={{
        title: "Quản lý đánh giá",
        subTitle: "Xem và phản hồi đánh giá từ khách hàng của bạn.",
      }}
    >
      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Tổng đánh giá",
              value: stats.total,
              description: <span style={{ fontSize: 12, color: "#94a3b8" }}>Tất cả chỗ ở</span>,
              icon: <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E6FAF5", display: "flex", alignItems: "center", justifyContent: "center" }}><Users className="w-4 h-4 text-[#2DD4A8]" /></div>,
            }}
            style={{ borderRadius: 16 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Điểm trung bình",
              value: stats.avgRating,
              suffix: "/ 5",
              description: <span style={{ fontSize: 12, color: "#f59e0b" }}>Từ khách hàng</span>,
              icon: <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}><Star className="w-4 h-4 text-amber-500" /></div>,
            }}
            style={{ borderRadius: 16 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Đánh giá 5 sao",
              value: stats.fiveStars,
              description: <span style={{ fontSize: 12, color: "#94a3b8" }}>Đạt chất lượng tốt</span>,
              icon: <div style={{ width: 32, height: 32, borderRadius: 8, background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center" }}><StarFilled className="w-4 h-4 text-purple-500" /></div>,
            }}
            style={{ borderRadius: 16 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{
              title: "Chưa phản hồi",
              value: String(stats.pendingReplies).padStart(2, "0"),
              description: <span style={{ fontSize: 12, color: "#f97316" }}>Cần phản hồi ngay</span>,
              icon: <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}><Clock className="w-4 h-4 text-orange-500" /></div>,
            }}
            style={{ borderRadius: 16 }}
          />
        </Col>
      </Row>

      <ProTable<HostBookingWithReview>
        rowKey="bookingCode"
        columns={columns}
        cardBordered
        dataSource={allBookingsWithReviews}
        loading={isLoading}
        request={async (params) => {
          let filtered = allBookingsWithReviews;
          if (params.propertyName) {
            filtered = filtered.filter((b: any) => b.propertyName === params.propertyName);
          }
          return {
            data: filtered,
            success: true,
            total: filtered.length,
          };
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: "auto",
          searchText: "Lọc",
          resetText: "Xóa bộ lọc",
          collapsed: false,
          collapseRender: false,
        }}
        options={{
          reload: () => refetch(),
          setting: false,
          density: false,
        }}
        scroll={{ x: 'max-content' }}
      />

      {/* Reply Modal */}
      <Modal
        open={!!replyModal}
        onCancel={() => {
          setReplyModal(null);
          setReplyText("");
        }}
        title={null}
        footer={null}
        centered
        width={520}
        styles={{ body: { padding: "8px 0 0" } }}
      >
        {replyModal && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  background: "linear-gradient(135deg, #2DD4A8, #22b892)",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  boxShadow: "0 4px 14px rgba(45, 212, 168, 0.2)",
                }}
              >
                <MessageOutlined style={{ color: "#fff", fontSize: 22 }} />
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: 0,
                }}
              >
                {replyModal.existingReply ? "Sửa phản hồi đánh giá" : "Phản hồi đánh giá"}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                Trả lời đánh giá từ {replyModal.guestName}
              </p>
            </div>

            {/* Original review preview */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 20,
                borderLeft: "3px solid #e2e8f0",
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: 4,
                  margin: "0 0 4px 0",
                }}
              >
                Đánh giá gốc:
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "#475569",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                "{replyModal.comment}"
              </p>
            </div>

            {/* Reply input */}
            <div style={{ marginBottom: 20 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: 8,
                  display: "block",
                }}
              >
                Nội dung phản hồi
              </label>
              <TextArea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Viết phản hồi cảm ơn hoặc giải đáp thắc mắc cho khách..."
                rows={4}
                maxLength={500}
                showCount
                style={{ borderRadius: 12 }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                block
                size="large"
                onClick={() => {
                  setReplyModal(null);
                  setReplyText("");
                }}
                style={{ borderRadius: 12, height: 46, fontWeight: 600 }}
              >
                Hủy
              </Button>
              <Button
                block
                size="large"
                type="primary"
                icon={<SendOutlined />}
                loading={replyMutation.isPending}
                onClick={handleReply}
                disabled={!replyText.trim() || replyText.trim() === replyModal.existingReply}
                style={{
                  borderRadius: 12,
                  height: 46,
                  fontWeight: 600,
                  background: "#2DD4A8",
                  borderColor: "#2DD4A8",
                }}
              >
                {replyModal.existingReply ? "Lưu thay đổi" : "Gửi phản hồi"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </PageContainer>
  );
}
