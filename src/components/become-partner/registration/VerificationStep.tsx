"use client";

import { useMemo } from "react";
import { Button, Checkbox, Upload } from "antd";
import type { UploadFile } from "antd";
import {
  CameraOutlined,
  IdcardOutlined,
  UserSwitchOutlined,
  QuestionCircleOutlined,
  LockOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { VerificationData } from "./registrationData";

interface VerificationStepProps {
  data: VerificationData;
  onChange: (data: Partial<VerificationData>) => void;
  accountType: "personal" | "business";
}

function ImagePreview({
  file,
  onRemove,
  label,
}: {
  file: File;
  onRemove: () => void;
  label: string;
}) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-[#1890ff] bg-blue-50 min-h-[180px] flex items-center justify-center">
      <img src={url} alt={label} className="w-full h-full min-h-[180px] max-h-[240px] object-cover block" />
      <button
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 border-none text-white text-sm cursor-pointer flex items-center justify-center transition-colors hover:bg-red-500/90 z-[2]"
        onClick={onRemove}
      >
        <DeleteOutlined />
      </button>
    </div>
  );
}

export default function VerificationStep({
  data,
  onChange,
  accountType,
}: VerificationStepProps) {
  const handleFileChange = (
    key: "frontCCCD" | "backCCCD" | "selfie",
    info: { fileList: UploadFile[] }
  ) => {
    if (info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj as File;
      onChange({ [key]: file });
    } else {
      onChange({ [key]: null });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
      {/* Left Column */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Xác minh danh tính</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Để đảm bảo an toàn cho cộng đồng HomestayBooking, chúng tôi cần xác
            nhận danh tính của bạn. Thông tin này được bảo mật và chỉ dùng cho
            mục đích xác thực.
          </p>
        </div>

        {/* Account type notice */}
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <UserSwitchOutlined className="text-xl text-[#1890ff]" />
            <div>
              <span className="text-[13px] text-gray-500 mr-1">Bạn đang đăng ký với tư cách:</span>
              <span className="text-[13px] font-semibold text-gray-900">
                Tài khoản {accountType === "personal" ? "Cá nhân" : "Doanh nghiệp"}
              </span>
            </div>
          </div>
          <Button className="text-[13px] font-medium !rounded-lg">
            Đổi sang {accountType === "personal" ? "Doanh nghiệp" : "Cá nhân"}
          </Button>
        </div>

        {/* CCCD Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IdcardOutlined className="text-lg text-[#1890ff]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">Giấy tờ tùy thân (CCCD/CMND)</h3>
            </div>
            <span className="text-xs font-medium text-[#1890ff]">Bắt buộc</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.frontCCCD ? (
              <ImagePreview file={data.frontCCCD} onRemove={() => onChange({ frontCCCD: null })} label="Mặt trước CCCD" />
            ) : (
              <Upload.Dragger
                showUploadList={false}
                maxCount={1}
                accept="image/*,.pdf"
                beforeUpload={() => false}
                onChange={(info) => handleFileChange("frontCCCD", info)}
                className="upload-dragger-custom"
              >
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="text-4xl text-gray-300 mb-2"><IdcardOutlined /></div>
                  <p className="text-sm font-semibold text-gray-700 m-0">Mặt trước CCCD</p>
                  <p className="text-xs text-gray-400 m-0 leading-relaxed max-w-[200px]">
                    Ảnh chụp rõ ràng mặt trước, thấy rõ ảnh và thông tin
                  </p>
                  <p className="text-[13px] text-[#1890ff] font-medium mt-1 m-0">Nhấp để tải lên</p>
                </div>
              </Upload.Dragger>
            )}

            {data.backCCCD ? (
              <ImagePreview file={data.backCCCD} onRemove={() => onChange({ backCCCD: null })} label="Mặt sau CCCD" />
            ) : (
              <Upload.Dragger
                showUploadList={false}
                maxCount={1}
                accept="image/*,.pdf"
                beforeUpload={() => false}
                onChange={(info) => handleFileChange("backCCCD", info)}
                className="upload-dragger-custom"
              >
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="text-4xl text-gray-300 mb-2"><CameraOutlined /></div>
                  <p className="text-sm font-semibold text-gray-700 m-0">Mặt sau CCCD</p>
                  <p className="text-xs text-gray-400 m-0 leading-relaxed max-w-[200px]">
                    Ảnh chụp rõ ràng mặt sau, thấy rõ mã vạch/chip
                  </p>
                  <p className="text-[13px] text-[#1890ff] font-medium mt-1 m-0">Nhấp để tải lên</p>
                </div>
              </Upload.Dragger>
            )}
          </div>
        </div>

        {/* Selfie Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserSwitchOutlined className="text-lg text-[#1890ff]" />
              <h3 className="text-base font-semibold text-gray-900 m-0">Ảnh Selfie xác thực</h3>
            </div>
            <span className="text-xs font-medium text-[#1890ff]">Bắt buộc</span>
          </div>

          {data.selfie ? (
            <ImagePreview file={data.selfie} onRemove={() => onChange({ selfie: null })} label="Ảnh selfie" />
          ) : (
            <Upload.Dragger
              showUploadList={false}
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
              onChange={(info) => handleFileChange("selfie", info)}
              className="upload-dragger-custom"
            >
              <div className="flex flex-col items-center text-center gap-1">
                <div className="text-[40px] text-gray-300 mb-2"><UserSwitchOutlined /></div>
                <p className="text-sm font-semibold text-gray-700 m-0">Ảnh chân dung kèm CCCD</p>
                <p className="text-xs text-gray-400 m-0 leading-relaxed max-w-[200px]">
                  Chụp khuôn mặt bạn đang cầm mặt trước CCCD.
                </p>
                <p className="text-[13px] text-[#1890ff] font-medium mt-1 m-0">Nhấp để tải lên</p>
              </div>
            </Upload.Dragger>
          )}
        </div>

        {/* Consent */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <Checkbox checked={data.agreed} onChange={(e) => onChange({ agreed: e.target.checked })}>
            <span className="text-[13px] text-gray-700 leading-relaxed">
              Tôi đồng ý để HomestayBooking thu thập, xử lý và lưu trữ thông
              tin định danh cá nhân của tôi theo{" "}
              <a href="/" className="text-[#1890ff] font-medium no-underline hover:underline">Chính sách bảo mật</a>.
            </span>
          </Checkbox>
          <p className="text-xs text-gray-400 mt-2 ml-6 italic m-0">
            * Thông tin của bạn được mã hóa AES-256 và bảo vệ nghiêm ngặt.
          </p>
        </div>
      </div>

      {/* Right Column - Sidebar */}
      <div className="flex flex-col gap-5 sticky top-[100px] max-lg:static">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <QuestionCircleOutlined className="text-lg text-amber-400" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Yêu cầu hình ảnh</h4>
          </div>
          <ul className="list-none p-0 m-0">
            {[
              'Ảnh chụp phải rõ nét, không bị lóa sáng bởi đèn flash.',
              'Định dạng cho phép: JPG, PNG, PDF.',
              'Dung lượng tối đa: 10MB cho mỗi tệp.',
              'Đảm bảo 4 góc của giấy tờ nằm trong khung hình.',
              'Ảnh Selfie cần rõ mặt, không đeo kính râm hoặc đội mũ che khuất.',
              'Giấy tờ phải còn hạn sử dụng ít nhất 3 tháng.',
            ].map((tip, i) => (
              <li key={i} className="text-[13px] text-gray-600 leading-relaxed py-1 pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-[#1890ff] before:font-bold">
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3.5">
            <LockOutlined className="text-lg text-[#1890ff]" />
            <h4 className="text-[15px] font-semibold text-gray-900 m-0">Bảo mật tuyệt đối</h4>
          </div>
          <p className="text-[13px] text-gray-600 leading-relaxed m-0">
            Chúng tôi cam kết không chia sẻ dữ liệu xác thực của bạn với bất kỳ
            bên thứ ba nào ngoại trừ cơ quan chức năng khi có yêu cầu pháp lý.
          </p>
        </div>
      </div>
    </div>
  );
}
