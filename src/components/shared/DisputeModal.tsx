"use client";

import React, { useState } from "react";
import { Modal, Input, Button, message, Upload } from "antd";
import {
  ExclamationCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { fetcher } from "@/utils/fetcher";

const { TextArea } = Input;

interface DisputeModalProps {
  open: boolean;
  onClose: () => void;
  bookingCode: string;
  onSuccess?: () => void;
}

const DISPUTE_REASONS = [
  "Phòng không sạch sẽ",
  "Phòng không đúng mô tả",
  "Thiếu tiện nghi đã cam kết",
  "Khách gây hư hại tài sản",
  "Khách vi phạm nội quy",
  "Vấn đề thanh toán",
  "Khác",
];

export default function DisputeModal({
  open,
  onClose,
  bookingCode,
  onSuccess,
}: DisputeModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      message.warning("Vui lòng chọn hoặc nhập lý do khiếu nại");
      return;
    }
    if (!description.trim()) {
      message.warning("Vui lòng mô tả chi tiết vấn đề");
      return;
    }

    setLoading(true);
    try {
      await fetcher.post(`/bookings/${bookingCode}/disputes`, {
        reason: reason.trim(),
        description: description.trim(),
        evidenceImageUrls: imageUrl.trim() || undefined,
      });
      message.success("Gửi khiếu nại thành công!");
      handleReset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.data ||
        "Gửi khiếu nại thất bại. Vui lòng thử lại.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReason("");
    setDescription("");
    setImageUrl("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={560}
      centered
      destroyOnHidden
      className="dispute-modal"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <ExclamationCircleOutlined className="text-red-500 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 m-0">
              Gửi khiếu nại
            </h3>
            <p className="text-xs text-gray-400 m-0">
              Mã booking: <span className="font-semibold text-gray-600">{bookingCode}</span>
            </p>
          </div>
        </div>

        {/* Reason Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Lý do khiếu nại <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {DISPUTE_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  reason === r
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {reason === "Khác" && (
            <Input
              placeholder="Nhập lý do khác..."
              value={reason === "Khác" ? "" : reason}
              onChange={(e) => setReason(e.target.value || "Khác")}
              className="!rounded-lg mt-2"
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </label>
          <TextArea
            rows={4}
            placeholder="Mô tả chi tiết tình trạng để chúng tôi hỗ trợ bạn tốt hơn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            showCount
            className="!rounded-lg"
          />
        </div>

        {/* Evidence Image URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Link ảnh minh chứng
          </label>
          <Input
            placeholder="https://example.com/evidence.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="!rounded-lg"
          />
          <p className="text-[11px] text-gray-400 mt-1 m-0">
            Dán đường link ảnh minh chứng (nếu có) để hỗ trợ quá trình xử lý khiếu nại.
          </p>
          {imageUrl && (
            <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={imageUrl}
                alt="Evidence preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                onClick={() => setImageUrl("")}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] cursor-pointer border-none"
              >
                <DeleteOutlined />
              </button>
            </div>
          )}
        </div>

        {/* Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <p className="text-xs text-amber-700 m-0 leading-relaxed">
            ⚠️ Khiếu nại sẽ được đội ngũ quản trị xem xét trong vòng 24-48 giờ.
            Kết quả xử lý sẽ được thông báo qua email và trang quản lý.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button
            onClick={handleClose}
            className="!rounded-lg !h-10 !px-6 !font-medium"
          >
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            danger
            className="!rounded-lg !h-10 !px-6 !font-semibold"
          >
            Gửi khiếu nại
          </Button>
        </div>
      </div>
    </Modal>
  );
}
