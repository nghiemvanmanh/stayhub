"use client";

import React, { useState } from "react";
import { 
  Row, 
  Col, 
  Menu, 
  Card, 
  Avatar, 
  Typography, 
  Button, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Switch, 
  List, 
  Badge, 
  Progress,
  Divider,
  Modal,
  message,
  Space
} from "antd";
import { 
  UserOutlined, 
  SafetyCertificateOutlined, 
  CreditCardOutlined, 
  HeartOutlined, 
  CrownOutlined,
  EditOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  DeleteOutlined,
  StarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  ScheduleOutlined
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Link from "next/link";
import { useRouter } from "next/navigation";

dayjs.locale("vi");

const { Title, Text, Paragraph } = Typography;

export default function UserProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("personal");
  const [form] = Form.useForm();

  // Load initial value
  const initialValues = {
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    gender: "male",
    nationality: "VN",
    address: ""
  };

  const handleUpdateInfo = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      message.success("Cập nhật thông tin thành công!");
    });
  };

  const handleDeleteAccount = () => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xoá tài khoản?",
      content: "Hành động này không thể hoàn tác. Toàn bộ dữ liệu đặt phòng và điểm thưởng sẽ bị xoá.",
      okText: "Xoá tài khoản",
      okType: "danger",
      cancelText: "Hủy bỏ",
      onOk: () => message.success("Đã xoá tài khoản"),
    });
  };

  const menuItems = [
    { key: "personal", icon: <UserOutlined />, label: "Thông tin cá nhân" },
    { key: "security", icon: <SafetyCertificateOutlined />, label: "Bảo mật & Đăng nhập" },
    { key: "payments", icon: <CreditCardOutlined />, label: "Thanh toán & Giao dịch" },
    { key: "trips", icon: <ScheduleOutlined />, label: "Chuyến đi của tôi" },
    { key: "wishlist", icon: <HeartOutlined />, label: "Danh sách đã lưu" },
    { key: "reviews", icon: <StarOutlined />, label: "Đánh giá của tôi" },
  ];

  /* ───── 1. THÔNG TIN CÁ NHÂN ───── */
  const renderPersonalInfo = () => (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Thông tin cá nhân</Title>} 
      bordered={false}
      className="shadow-sm rounded-xl"
    >
      <Text type="secondary" className="block mb-6">
        Cập nhật thông tin cơ bản và cách chúng tôi có thể liên lạc với bạn.
      </Text>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Họ và Tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
              <Input size="large" prefix={<UserOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Địa chỉ Email" name="email">
              <Input size="large" disabled prefix={<MailOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Số điện thoại" name="phone">
              <Input size="large" placeholder="Ví dụ: 0912345678" prefix={<PhoneOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Ngày sinh" name="dob">
              <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Giới tính" name="gender">
              <Select size="large">
                <Select.Option value="male">Nam</Select.Option>
                <Select.Option value="female">Nữ</Select.Option>
                <Select.Option value="other">Khác / Không tiết lộ</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Quốc tịch" name="nationality">
              <Select size="large">
                <Select.Option value="VN">
                  <Space><GlobalOutlined /> Việt Nam</Space>
                </Select.Option>
                <Select.Option value="US">
                  <Space><GlobalOutlined /> United States</Space>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Địa chỉ hiện tại" name="address">
              <Input size="large" placeholder="Số nhà, Đường, Phường, Quận..." prefix={<EnvironmentOutlined />} />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider />
        <div style={{ textAlign: "right" }}>
          <Button type="primary" size="large" onClick={handleUpdateInfo} className="bg-[#2DD4A8] border-none hover:bg-[#25bc95] rounded-lg">
            Lưu thay đổi
          </Button>
        </div>
      </Form>
    </Card>
  );

  /* ───── 2. BẢO MẬT & ĐĂNG NHẬP ───── */
  const renderSecurity = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card 
        title={<Title level={4} style={{ margin: 0 }}>Mật khẩu & Xác thực</Title>} 
        bordered={false}
        className="shadow-sm rounded-xl"
      >
        <List
          itemLayout="horizontal"
          dataSource={[
            {
              title: "Đổi mật khẩu",
              description: "Luôn sử dụng mật khẩu mạnh để bảo vệ tài khoản.",
              action: <Button>Cập nhật mật khẩu mới</Button>
            },
            {
              title: "Đăng nhập bằng Sinh trắc học (Passkeys)",
              description: "Đăng nhập an toàn & nhanh chóng bằng Touch ID, Face ID.",
              action: <Switch defaultChecked />
            },
            {
              title: "Xác thực 2 yếu tố (2FA)",
              description: "Thêm một lớp bảo mật khi đăng nhập từ thiết bị lạ.",
              action: <Button>Thiết lập 2FA</Button>
            }
          ]}
          renderItem={(item) => (
            <List.Item actions={[item.action]}>
              <List.Item.Meta
                title={<span className="font-semibold">{item.title}</span>}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card bordered={false} className="shadow-sm rounded-xl border border-red-200 bg-red-50">
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={5} type="danger" style={{ margin: 0 }}>Vùng Nguy Hiểm</Title>
            <Text type="danger">Xoá hoàn toàn tài khoản và dữ liệu liên quan.</Text>
          </Col>
          <Col>
            <Button danger type="primary" onClick={handleDeleteAccount}>Yêu cầu xoá tài khoản</Button>
          </Col>
        </Row>
      </Card>
    </Space>
  );

  /* ───── 3. THANH TOÁN ───── */
  const renderPayments = () => (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Thanh toán & Giao dịch</Title>} 
      bordered={false}
      className="shadow-sm rounded-xl"
      extra={<Button type="primary" className="bg-[#2DD4A8] border-none hover:bg-[#25bc95]">Thêm thẻ mới</Button>}
    >
      <div className="py-12 text-center">
        <CreditCardOutlined className="text-4xl text-gray-300 mb-4" />
        <Title level={5} className="text-gray-500 m-0">Bạn chưa lưu phương thức thanh toán nào</Title>
        <Text type="secondary">Mọi thông tin thanh toán đều được mã hoá bảo mật theo tiêu chuẩn.</Text>
      </div>
    </Card>
  );

  /* ───── 4. CHUYẾN ĐI ───── */
  const renderTrips = () => (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Chuyến đi của tôi</Title>} 
      bordered={false}
      className="shadow-sm rounded-xl"
      extra={<Button type="primary" onClick={() => router.push("/my-bookings")} className="bg-[#2DD4A8] border-none hover:bg-[#25bc95]">Đi tới Đặt phòng</Button>}
    >
      <div className="py-12 text-center">
        <ScheduleOutlined className="text-4xl text-gray-300 mb-4" />
        <Title level={5} className="text-gray-500 m-0">Xem toàn bộ đặt phòng tại trang riêng</Title>
      </div>
    </Card>
  );

  /* ───── 5. WISHLIST ───── */
  const renderWishlist = () => (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Danh sách đã lưu</Title>} 
      bordered={false}
      className="shadow-sm rounded-xl"
    >
      <div className="py-12 text-center">
        <HeartOutlined className="text-4xl text-gray-300 mb-4" />
        <Title level={5} className="text-gray-500 m-0">Bạn chưa lưu Homestay nào</Title>
        <Button className="mt-4" onClick={() => router.push("/")}>Khám phá ngay</Button>
      </div>
    </Card>
  );

  /* ───── 6. REVIEWS ───── */
  const renderReviews = () => (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Đánh giá của tôi</Title>} 
      bordered={false}
      className="shadow-sm rounded-xl"
    >
      <div className="py-12 text-center">
        <EditOutlined className="text-4xl text-gray-300 mb-4" />
        <Title level={5} className="text-gray-500 m-0">Chưa có đánh giá nào</Title>
        <Text type="secondary">Những đánh giá của bạn sẽ hiển thị tại đây.</Text>
      </div>
    </Card>
  );

  const getActiveContent = () => {
    switch (activeMenu) {
      case "personal": return renderPersonalInfo();
      case "security": return renderSecurity();
      case "payments": return renderPayments();
      case "trips": return renderTrips();
      case "wishlist": return renderWishlist();
      case "reviews": return renderReviews();
      default: return renderPersonalInfo();
    }
  };

  return (
    <div className="bg-[#f0f2f5] min-h-[calc(100vh-72px)] py-10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} lg={7}>
            {/* User Badge Card */}
            <Card bordered={false} className="shadow-sm rounded-xl mb-6 text-center">
              <div className="relative inline-block mb-4 group">
                <Avatar 
                  size={100} 
                  src={user?.avatarUrl} 
                  icon={<UserOutlined />} 
                  className="border-4 border-white shadow-sm"
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex justify-center items-center cursor-pointer shadow border border-gray-100 hover:bg-gray-50">
                  <CameraOutlined className="text-gray-600" />
                </div>
              </div>
              <Title level={4} style={{ margin: 0 }}>{user?.fullName || "Người dùng Stayhub"}</Title>
              <Text type="secondary" className="block mb-4">{user?.email}</Text>
              
              <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg p-3 border border-amber-200 text-left">
                <Space align="center" className="mb-2">
                  <CrownOutlined className="text-amber-500 text-lg" />
                  <Text strong className="text-amber-700">Hạng Genius 2</Text>
                </Space>
                <Progress percent={60} showInfo={false} strokeColor="#f59e0b" size="small" />
                <Text className="text-xs text-amber-600">3/5 chuyến đi để lên cấp Genius 3</Text>
              </div>
            </Card>

            {/* Sidebar Navigation */}
            <Card bordered={false} className="shadow-sm rounded-xl" bodyStyle={{ padding: '8px 0' }}>
              <Menu
                mode="inline"
                selectedKeys={[activeMenu]}
                onClick={(e) => setActiveMenu(e.key)}
                items={menuItems}
                className="border-none"
                style={{ fontSize: '15px', fontWeight: 500 }}
              />
            </Card>
          </Col>

          <Col xs={24} md={16} lg={17}>
            {getActiveContent()}
          </Col>
        </Row>

      </div>
    </div>
  );
}
