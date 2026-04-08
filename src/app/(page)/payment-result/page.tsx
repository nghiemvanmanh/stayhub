"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, Spin, Typography, Divider, Space } from "antd";
import { CheckCircleFilled, CloseCircleFilled, HomeOutlined, LoadingOutlined } from "@ant-design/icons";
import Link from "next/link";

import { Suspense } from "react";

const { Title, Text, Paragraph } = Typography;

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  
  const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
  const vnp_OrderInfo = searchParams.get("vnp_OrderInfo");
  const vnp_Amount = searchParams.get("vnp_Amount");
  const vnp_TxnRef = searchParams.get("vnp_TxnRef");

  useEffect(() => {
    // If VNPay params exist
    if (vnp_ResponseCode) {
      if (vnp_ResponseCode === "00") {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } else {
      // Timeout or generic error if no params
      const timer = setTimeout(() => {
        setStatus("error");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [vnp_ResponseCode]);

  const amountFormatted = vnp_Amount 
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseInt(vnp_Amount) / 100)
    : "";

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center p-4 py-16">
      <Card className="w-full max-w-lg shadow-xl border-0 rounded-2xl overflow-hidden">
        {status === "loading" ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#2DD4A8' }} spin />} />
            <Title level={4} className="mt-6 text-gray-600">Đang xử lý kết quả thanh toán...</Title>
          </div>
        ) : status === "success" ? (
          <div className="text-center p-6">
            <CheckCircleFilled className="text-6xl text-green-500 mb-6" />
            <Title level={3} className="text-gray-800 m-0">Thanh toán thành công!</Title>
            <Paragraph className="text-gray-500 mt-2 mb-8">
              Cảm ơn bạn đã sử dụng dịch vụ. Giao dịch của bạn đã được xử lý thành công. Hệ thống đang cập nhật trạng thái...
            </Paragraph>

            <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 border border-gray-100">
              <Space direction="vertical" className="w-full text-base">
                <div className="flex justify-between">
                  <Text type="secondary">Mã giao dịch</Text>
                  <Text strong>{vnp_TxnRef || "N/A"}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Nội dung</Text>
                  <Text strong className="max-w-[200px] truncate">{vnp_OrderInfo || "N/A"}</Text>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between">
                  <Text type="secondary">Tổng thanh toán</Text>
                  <Text className="text-[#2DD4A8] text-xl font-bold">{amountFormatted}</Text>
                </div>
              </Space>
            </div>

            <Space size="middle" className="flex justify-center">
              <Link 
                href="/" 
                className="bg-[#2DD4A8] hover:bg-[#20b890] text-white px-8 py-3 rounded-full flex items-center font-medium transition-colors"
              >
                <HomeOutlined className="mr-2" /> Về trang chủ
              </Link>
            </Space>
          </div>
        ) : (
          <div className="text-center p-6">
            <CloseCircleFilled className="text-6xl text-red-500 mb-6" />
            <Title level={3} className="text-gray-800 m-0">Thanh toán thất bại</Title>
            <Paragraph className="text-gray-500 mt-2 mb-8">
              Rất tiếc, giao dịch của bạn không thành công hoặc đã bị hủy. {vnp_ResponseCode ? `Lỗi VNPay Code: ${vnp_ResponseCode}` : ''} Vui lòng thử lại sau.
            </Paragraph>

            <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 border border-gray-100">
              <Space direction="vertical" className="w-full text-base">
                <div className="flex justify-between">
                  <Text type="secondary">Mã giao dịch</Text>
                  <Text strong>{vnp_TxnRef || "N/A"}</Text>
                </div>
                <div className="flex justify-between">
                  <Text type="secondary">Nội dung</Text>
                  <Text strong className="max-w-[200px] truncate">{vnp_OrderInfo || "N/A"}</Text>
                </div>
              </Space>
            </div>

            <Space size="middle" className="flex justify-center">
              <button 
                onClick={() => router.back()} 
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
              >
                Quay lại
              </button>
              <Link 
                href="/" 
                className="bg-[#2DD4A8] hover:bg-[#20b890] text-white px-8 py-3 rounded-full flex items-center font-medium transition-colors"
              >
                <HomeOutlined className="mr-2" /> Về trang chủ
              </Link>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#2DD4A8' }} spin />} />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
