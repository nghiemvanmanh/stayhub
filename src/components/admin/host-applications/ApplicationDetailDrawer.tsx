import React from "react";
import {
  Drawer,
  Button,
  Dropdown,
  Avatar,
  Typography,
  Tag,
  Tabs,
  Descriptions,
  Divider,
  Row,
  Col,
  Image,
  Empty,
  Card,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  FileProtectOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { HostApplicationDetail } from "@/interfaces/admin";
import {
  ALL_HOST_STATUSES,
  HOST_APPLICATION_STATUS_MAP,
} from "@/constants/host-application";

const { Title, Text } = Typography;

interface ApplicationDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  detailLoading: boolean;
  detailData: HostApplicationDetail | null;
  onOpenApproval: (hostCode: string, status: string) => void;
}

export const ApplicationDetailDrawer: React.FC<ApplicationDetailDrawerProps> = ({
  open,
  onClose,
  detailLoading,
  detailData,
  onOpenApproval,
}) => {
  return (
    <Drawer
      title={null}
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: 0 } }}
      extra={
        detailData && (
          <Dropdown
            menu={{
              items: ALL_HOST_STATUSES
                .filter((s) => s.value !== detailData.onboardingStatus)
                .map((s) => ({
                  key: s.value,
                  label: <span style={{ color: s.color }}>{s.label}</span>,
                  onClick: () => {
                    onOpenApproval(detailData.hostCode, s.value);
                    onClose();
                  },
                })),
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button style={{ borderRadius: 8 }}>Thay đổi trạng thái</Button>
          </Dropdown>
        )
      }
    >
      {detailLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
           <div style={{ width: 32, height: 32, borderRadius: "50%", border: "4px solid #e5e7eb", borderTopColor: "#2DD4A8" }} className="animate-spin" />
        </div>
      ) : detailData ? (
        <>
          {/* Drawer Header */}
          <div style={{ padding: "24px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Avatar src={detailData.hostAvatarUrl} icon={<UserOutlined />} size={64} />
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ margin: 0, color: "#1a1a2e" }}>
                  {detailData.fullName}
                </Title>
                <Text style={{ color: "#94a3b8", fontSize: 13 }}>Mã: {detailData.hostCode}</Text>
                <div style={{ marginTop: 6 }}>
                  <Tag
                    color={
                      HOST_APPLICATION_STATUS_MAP[detailData.onboardingStatus]?.color || "default"
                    }
                    style={{ borderRadius: 6, fontWeight: 500 }}
                  >
                    {HOST_APPLICATION_STATUS_MAP[detailData.onboardingStatus]?.label ||
                      detailData.onboardingStatus}
                  </Tag>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "20px 24px" }}>
            <Tabs
              defaultActiveKey="info"
              items={[
                {
                  key: "info",
                  label: "Thông tin cá nhân",
                  children: (
                    <div>
                      <Descriptions
                        bordered
                        size="small"
                        column={1}
                        labelStyle={{ fontWeight: 600, width: 180, background: "#fafafa", fontSize: 13 }}
                        contentStyle={{ fontSize: 13 }}
                      >
                        <Descriptions.Item label={<><MailOutlined style={{ marginRight: 6 }} /> Email</>}>
                          {detailData.email || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label={<><PhoneOutlined style={{ marginRight: 6 }} /> SĐT kinh doanh</>}>
                          {detailData.businessPhone || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label={<><MailOutlined style={{ marginRight: 6 }} /> Email hỗ trợ</>}>
                          {detailData.supportEmail || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label={<><IdcardOutlined style={{ marginRight: 6 }} /> Số CMND/CCCD</>}>
                          {detailData.identityCardNumber || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label={<><FileProtectOutlined style={{ marginRight: 6 }} /> Số GPKD</>}>
                          {detailData.businessLicenseNumber || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label={<><CalendarOutlined style={{ marginRight: 6 }} /> Ngày đăng ký</>}>
                          {detailData.createdAt
                            ? dayjs(detailData.createdAt).format("DD/MM/YYYY HH:mm")
                            : "--"}
                        </Descriptions.Item>
                        {detailData.reviewNote && (
                          <Descriptions.Item label="Ghi chú thẩm định">
                            <Text type="secondary">{detailData.reviewNote}</Text>
                          </Descriptions.Item>
                        )}
                      </Descriptions>

                      {/* Identity Images */}
                      <Divider titlePlacement="left" style={{ fontSize: 14 }}>
                        <IdcardOutlined /> Ảnh CMND/CCCD
                      </Divider>
                      <Row gutter={16}>
                        {[
                          { label: "Mặt trước", url: detailData.identityCardFrontUrl },
                          { label: "Mặt sau", url: detailData.identityCardBackUrl },
                        ].map((side) => (
                          <Col span={12} key={side.label}>
                            <div style={{ textAlign: "center" }}>
                              <Text type="secondary" style={{ display: "block", marginBottom: 8, fontSize: 12 }}>
                                {side.label}
                              </Text>
                              {side.url ? (
                                <Image
                                  src={side.url}
                                  alt={side.label}
                                  style={{ borderRadius: 8, maxHeight: 180, objectFit: "cover" }}
                                />
                              ) : (
                                <div style={{ background: "#fafafa", borderRadius: 8, padding: "40px 0", border: "1px dashed #d9d9d9" }}>
                                  <Text type="secondary">Chưa có ảnh</Text>
                                </div>
                              )}
                            </div>
                          </Col>
                        ))}
                      </Row>

                      {detailData.businessLicenseUrl && (
                        <>
                          <Divider titlePlacement="left" style={{ fontSize: 14 }}>
                            <FileProtectOutlined /> Giấy phép kinh doanh
                          </Divider>
                          <div style={{ textAlign: "center" }}>
                            <Image
                              src={detailData.businessLicenseUrl}
                              alt="GPKD"
                              style={{ borderRadius: 8, maxHeight: 300, objectFit: "contain" }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ),
                },
                {
                  key: "property",
                  label: "Bất động sản",
                  children: detailData.propertyDetailResponse ? (
                    <div>
                      {detailData.propertyDetailResponse.imageUrls?.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <Image.PreviewGroup>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              {detailData.propertyDetailResponse.imageUrls.map((url, idx) => (
                                <Image
                                  key={idx}
                                  src={url}
                                  alt={`Property ${idx + 1}`}
                                  width={110}
                                  height={82}
                                  style={{ borderRadius: 8, objectFit: "cover" }}
                                />
                              ))}
                            </div>
                          </Image.PreviewGroup>
                        </div>
                      )}
                      <Descriptions
                        bordered
                        size="small"
                        column={2}
                        labelStyle={{ fontWeight: 600, background: "#fafafa", fontSize: 13 }}
                        contentStyle={{ fontSize: 13 }}
                      >
                        <Descriptions.Item label="Tên" span={2}>
                          <Text strong>{detailData.propertyDetailResponse.name || "--"}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Loại hình">
                          {detailData.propertyDetailResponse.rentalTypeName || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Danh mục">
                          {detailData.propertyDetailResponse.categoryName || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>} span={2}>
                          {[
                            detailData.propertyDetailResponse.addressDetail,
                            detailData.propertyDetailResponse.ward,
                            detailData.propertyDetailResponse.district,
                            detailData.propertyDetailResponse.province,
                          ]
                            .filter(Boolean)
                            .join(", ") || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng">
                          {detailData.propertyDetailResponse.roomCount ?? "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách tối đa">
                          {detailData.propertyDetailResponse.maxGuests ?? "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng ngủ">
                          {detailData.propertyDetailResponse.numBedrooms ?? "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Giường">
                          {detailData.propertyDetailResponse.numBeds ?? "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng tắm">
                          {detailData.propertyDetailResponse.numBathrooms ?? "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phí dọn dẹp">
                          {detailData.propertyDetailResponse.cleaningFee != null
                            ? `${detailData.propertyDetailResponse.cleaningFee.toLocaleString("vi-VN")}đ`
                            : "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Check-in">
                          {detailData.propertyDetailResponse.checkInAfter || "--"} -{" "}
                          {detailData.propertyDetailResponse.checkInBefore || "--"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Check-out">
                          {detailData.propertyDetailResponse.checkOutAfter || "--"} -{" "}
                          {detailData.propertyDetailResponse.checkOutBefore || "--"}
                        </Descriptions.Item>
                      </Descriptions>
                      {detailData.propertyDetailResponse.rooms?.length > 0 && (
                        <>
                          <Divider titlePlacement="left" style={{ fontSize: 14 }}>
                            <HomeOutlined /> Phòng ({detailData.propertyDetailResponse.rooms.length})
                          </Divider>
                          {detailData.propertyDetailResponse.rooms.map((room) => (
                            <Card key={room.id} size="small" style={{ marginBottom: 10, borderRadius: 8 }}>
                              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                {room.thumbnailUrl && (
                                  <Image
                                    src={room.thumbnailUrl}
                                    alt={room.name}
                                    width={80}
                                    height={60}
                                    style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                                  />
                                )}
                                <div>
                                  <Text strong>{room.name}</Text>
                                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                    {room.maxGuests} khách • {room.numBeds} giường • {room.numBathrooms} phòng tắm
                                  </div>
                                  <Text strong style={{ color: "#2DD4A8" }}>
                                    {room.pricePerNight?.toLocaleString("vi-VN")}đ
                                  </Text>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    {" "}
                                    / đêm
                                  </Text>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </>
                      )}
                    </div>
                  ) : (
                    <Empty description="Chưa có thông tin bất động sản" />
                  ),
                },
              ]}
            />
          </div>
        </>
      ) : (
        <Empty description="Không tìm thấy dữ liệu" style={{ padding: "80px 0" }} />
      )}
    </Drawer>
  );
};
