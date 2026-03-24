"use client";

import { useMemo } from "react";
import { Input, Select, Upload } from "antd";
import type { UploadFile } from "antd";
import {
  BankOutlined,
  CreditCardOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { bankOptions, currencyOptions, type BankData } from "./registrationData";

interface BankInfoStepProps {
  data: BankData;
  onChange: (data: Partial<BankData>) => void;
}

function BankProofPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-[#1890ff] bg-blue-50 max-h-[200px] flex items-center justify-center">
      <img src={url} alt="Minh chứng ngân hàng" className="w-full h-full min-h-[180px] max-h-[200px] object-cover block" />
      <button
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 border-none text-white text-sm cursor-pointer flex items-center justify-center transition-colors hover:bg-red-500/90 z-[2]"
        onClick={onRemove}
      >
        <DeleteOutlined />
      </button>
    </div>
  );
}

export default function BankInfoStep({ data, onChange }: BankInfoStepProps) {
  const handleProofChange = (info: { fileList: UploadFile[] }) => {
    if (info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj as File;
      onChange({ proofFile: file });
    } else {
      onChange({ proofFile: null });
    }
  };

  const accountMismatch =
    data.accountNumber && data.accountNumberConfirm && data.accountNumber !== data.accountNumberConfirm;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* Left Column */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin thanh toán</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Thiết lập tài khoản ngân hàng để nhận tiền thanh toán từ các lượt
            đặt phòng của bạn. Vui lòng đảm bảo thông tin chính xác để tránh
            chậm trễ trong việc thanh toán.
          </p>
        </div>

        {/* Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 flex items-center gap-2.5 text-[13px] text-gray-600">
          <InfoCircleOutlined className="text-base text-gray-400 shrink-0" />
          <span>
            Tên chủ tài khoản phải khớp hoàn toàn với tên trên giấy tờ tùy thân bạn đã cung cấp ở bước trước.
          </span>
        </div>

        {/* Primary Account */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCardOutlined className="text-lg text-[#1890ff]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Tài khoản chính</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Tên chủ tài khoản <span className="text-red-500">*</span>
                </label>
                <Input size="large" placeholder="Nhập tên như trên thẻ/ứng dụng" value={data.accountHolder} onChange={(e) => onChange({ accountHolder: e.target.value })} />
                <span className="text-xs text-gray-400 mt-0.5">Ví dụ: NGUYEN VAN A (Viết hoa không dấu)</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Ngân hàng <span className="text-red-500">*</span>
                </label>
                <Select size="large" placeholder="Chọn ngân hàng của bạn" options={bankOptions} value={data.bankCode || undefined} onChange={(v) => onChange({ bankCode: v })} showSearch filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Số tài khoản <span className="text-red-500">*</span>
                </label>
                <Input size="large" placeholder="Nhập số tài khoản" value={data.accountNumber} onChange={(e) => onChange({ accountNumber: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">
                  Xác nhận số tài khoản <span className="text-red-500">*</span>
                </label>
                <Input size="large" placeholder="Nhập lại số tài khoản để xác nhận" value={data.accountNumberConfirm} onChange={(e) => onChange({ accountNumberConfirm: e.target.value })} status={accountMismatch ? "error" : undefined} />
                {accountMismatch && <span className="text-xs text-red-500">Số tài khoản không khớp</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <SettingOutlined className="text-lg text-[#1890ff]" />
            <h3 className="text-base font-semibold text-gray-900 m-0">Thông tin bổ sung (Tùy chọn)</h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Chi nhánh (Optional)</label>
                <Input size="large" placeholder="Ví dụ: Chi nhánh TP.HCM" value={data.branch} onChange={(e) => onChange({ branch: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Đơn vị tiền tệ</label>
                <Select size="large" value={data.currency} options={currencyOptions} onChange={(v) => onChange({ currency: v })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Mã SWIFT/BIC</label>
                <Input size="large" placeholder="Nhập mã SWIFT (8 hoặc 11 ký tự)" value={data.swift} onChange={(e) => onChange({ swift: e.target.value })} />
                <span className="text-xs text-gray-400 mt-0.5">Cần thiết nếu bạn nhận thanh toán quốc tế</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">IBAN (Nếu có)</label>
                <Input size="large" placeholder="Mã số tài khoản quốc tế" value={data.iban} onChange={(e) => onChange({ iban: e.target.value })} />
              </div>
            </div>
          </div>
        </div>

        {/* Bank Proof */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-900 m-0">Minh chứng tài khoản</h3>
          <p className="text-[13px] text-gray-500 mb-2">
            Việc cung cấp ảnh chụp thông tin tài khoản giúp chúng tôi xác minh nhanh hơn và tránh lỗi chuyển khoản.
          </p>
          {data.proofFile ? (
            <BankProofPreview file={data.proofFile} onRemove={() => onChange({ proofFile: null })} />
          ) : (
            <Upload.Dragger
              showUploadList={false}
              maxCount={1}
              accept="image/*,.pdf"
              beforeUpload={() => false}
              onChange={handleProofChange}
              className="upload-dragger-custom"
            >
              <div className="flex flex-col items-center text-center gap-1">
                <div className="text-4xl text-gray-300 mb-2"><UploadOutlined /></div>
                <p className="text-sm font-semibold text-gray-700 m-0">Tải lên minh chứng ngân hàng</p>
                <p className="text-xs text-gray-400 m-0 leading-relaxed">
                  Ảnh chụp mặt trước thẻ, sao kê hoặc app ngân hàng (PDF, JPG, PNG)
                </p>
              </div>
            </Upload.Dragger>
          )}
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="flex flex-col gap-5 sticky top-[100px] max-lg:static">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <BankOutlined className="text-lg text-amber-400" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Mẹo về Thông tin Ngân hàng</h4>
          </div>
          <ul className="list-none p-0 m-0">
            {[
              'Sử dụng tài khoản cá nhân chính chủ để quá trình xác minh diễn ra nhanh nhất.',
              'Đảm bảo số tài khoản không chứa khoảng trắng hoặc ký tự đặc biệt.',
              'Nếu bạn là hộ kinh doanh, hãy sử dụng tài khoản doanh nghiệp tương ứng với giấy phép đã tải lên.',
              'Chúng tôi bảo mật thông tin tài chính của bạn theo tiêu chuẩn quốc tế và chỉ sử dụng cho mục đích chi trả doanh thu.',
              'Thông thường, tiền sẽ được chuyển vào tài khoản của bạn trong vòng 24-48h sau khi khách trả phòng.',
            ].map((tip, i) => (
              <li key={i} className="text-[13px] text-gray-600 leading-relaxed py-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#1890ff] before:font-bold">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
