"use client";

import React, { useState } from "react";
import { Modal, Rate, Input, Button, message, Upload } from "antd";
import type { UploadFile } from "antd";
import { StarFilled, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { fetcher } from "@/utils/fetcher";

const { TextArea } = Input;

// ── S3 upload helper (same pattern as DisputeModal) ──────────────────
function getFileInfo(file: File) {
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  return { extension: ext, contentType: file.type || "application/octet-stream" };
}

async function uploadFileToS3(file: File): Promise<string> {
  const fileInfo = getFileInfo(file);
  const { data } = await fetcher.post("/files/presigned-url", {
    files: [fileInfo],
  });
  const presigned = Array.isArray(data) ? data[0] : data;
  const presignedData = (presigned as any).data || presigned;

  await fetch(presignedData.presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return presignedData.publicUrl;
}

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  bookingCode: string;
  propertyName: string;
  onSuccess: () => void;
}

export default function ReviewModal({
  open,
  onClose,
  bookingCode,
  propertyName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setRating(5);
    setComment("");
    setFileList([]);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      message.warning("Vui lòng nhập nội dung đánh giá");
      return;
    }
    if (rating === 0) {
      message.warning("Vui lòng chọn số sao đánh giá");
      return;
    }

    setLoading(true);
    try {
      // Upload images to S3 first
      let imageUrls: string[] = [];
      if (fileList.length > 0) {
        const uploadedUrls = await Promise.all(
          fileList.map((f) => uploadFileToS3(f.originFileObj as File))
        );
        imageUrls = uploadedUrls.filter(Boolean);
      }

      const body: { rating: number; comment: string; imageUrls?: string[] } = {
        rating,
        comment: comment.trim(),
      };
      if (imageUrls.length > 0) {
        body.imageUrls = imageUrls;
      }

      await fetcher.post(`/reviews/guest/${bookingCode}`, body);
      message.success("Đánh giá của bạn đã được gửi thành công!");
      resetForm();
      onSuccess();
      onClose();
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ||
          err?.response?.data?.data ||
          "Gửi đánh giá thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    1: "Rất tệ",
    2: "Tệ",
    3: "Bình thường",
    4: "Tốt",
    5: "Tuyệt vời",
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        resetForm();
        onClose();
      }}
      title={null}
      footer={null}
      centered
      width={520}
      destroyOnHidden
      className="review-modal"
      styles={{ body: { padding: "8px 0 0" } }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-[#2DD4A8] to-[#22b892] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#2DD4A8]/20">
          <StarFilled className="text-white text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 m-0">Đánh giá chuyến đi</h3>
        <p className="text-sm text-gray-500 mt-1 m-0 line-clamp-1">{propertyName}</p>
      </div>

      {/* Rating */}
      <div className="text-center mb-6 bg-gray-50 rounded-2xl p-5">
        <Rate
          value={rating}
          onChange={setRating}
          className="text-3xl"
          style={{ color: "#fadb14" }}
        />
        <p className="text-sm font-semibold text-gray-700 mt-2 m-0">
          {ratingLabels[rating] || ""}
        </p>
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Chia sẻ trải nghiệm của bạn
        </label>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Hãy chia sẻ cảm nhận của bạn về chỗ ở, dịch vụ, chủ nhà..."
          rows={4}
          maxLength={1000}
          showCount
          className="!rounded-xl !border-gray-200 hover:!border-[#2DD4A8] focus:!border-[#2DD4A8]"
        />
      </div>

      {/* Image Upload (S3) */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Hình ảnh (tùy chọn)
        </label>
        <Upload
          listType="picture-card"
          fileList={fileList}
          beforeUpload={(file) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
              message.error("Chỉ được tải lên file hình ảnh!");
              return Upload.LIST_IGNORE;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
              message.error("Hình ảnh phải nhỏ hơn 5MB!");
              return Upload.LIST_IGNORE;
            }
            setFileList((prev) => [...prev, { ...file, uid: file.uid, originFileObj: file, status: "done" } as UploadFile]);
            return false;
          }}
          onRemove={(file) => {
            setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
          }}
          multiple
          accept="image/*"
          maxCount={5}
        >
          {fileList.length >= 5 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8, fontSize: 12 }}>Tải ảnh lên</div>
            </div>
          )}
        </Upload>
        <p className="text-[11px] text-gray-400 mt-1 m-0">
          Tải lên tối đa 5 ảnh. Hỗ trợ JPG, PNG, WEBP (tối đa 5MB/ảnh).
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          block
          size="large"
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="!rounded-xl !h-12 !font-semibold !text-gray-600"
        >
          Hủy
        </Button>
        <Button
          block
          size="large"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          disabled={!comment.trim() || rating === 0}
          className="!rounded-xl !h-12 !font-semibold !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
        >
          Gửi đánh giá
        </Button>
      </div>
    </Modal>
  );
}
