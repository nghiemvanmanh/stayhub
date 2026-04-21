"use client";

import React, { useState } from "react";
import { Modal, Input, Button, message, Upload } from "antd";
import type { UploadFile } from "antd";
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
  const [reasonType, setReasonType] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const finalReason = reasonType === "Khác" ? customReason : reasonType;
    if (!finalReason.trim()) {
      message.warning("Vui lòng chọn hoặc nhập lý do khiếu nại");
      return;
    }
    if (!description.trim()) {
      message.warning("Vui lòng mô tả chi tiết vấn đề");
      return;
    }

    setLoading(true);
    try {
      let finalUrls = "";
      if (fileList.length > 0) {
        const uploadedUrls = await Promise.all(
          fileList.map((f) => uploadFileToS3(f.originFileObj as File))
        );
        finalUrls = uploadedUrls.filter(Boolean).join(",");
      }

      await fetcher.post(`/bookings/${bookingCode}/disputes`, {
        reason: finalReason.trim(),
        description: description.trim(),
        evidenceImageUrls: finalUrls || undefined,
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
    setReasonType("");
    setCustomReason("");
    setDescription("");
    setFileList([]);
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
                onClick={() => setReasonType(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  reasonType === r
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {reasonType === "Khác" && (
            <Input
              placeholder="Nhập lý do khác..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
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
            Ảnh minh chứng (nếu có)
          </label>
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={(file) => {
              setFileList((prev) => [...prev, { ...file, originFileObj: file, status: "done" }]);
              return false; // prevent default upload action so we upload on submit
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
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            )}
          </Upload>
          <p className="text-[11px] text-gray-400 mt-1 m-0">
            Tải lên tối đa 5 ảnh minh chứng để hỗ trợ quá trình xử lý khiếu nại.
          </p>
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
