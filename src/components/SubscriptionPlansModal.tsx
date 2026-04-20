import React from 'react';
import { Modal, Row, Col, Card, Button, Typography, Tag, Space, Spin, message } from 'antd';
import { CheckCircleOutlined, StarOutlined, RocketOutlined, CrownOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetcher } from "@/utils/fetcher";
import { formatCurrency } from "@/utils/format";

const { Title, Paragraph } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  tier: string;
  price: number;
  durationMonths: number;
  maxListings: number;
  commissionRate: number;
  creditLimit: number;
}

const planUIConfigs: Record<string, any> = {
  FREE: {
    title: 'Gói Cơ Bản',
    icon: <StarOutlined className="text-xl text-gray-500" />,
    color: 'gray',
    bgClass: 'bg-white',
    borderClass: 'border-gray-200',
    btnClass: 'bg-gray-800 text-white hover:bg-gray-700'
  },
  PREMIUM: {
    title: 'Gói Cao Cấp',
    icon: <CrownOutlined className="text-xl text-yellow-500" />,
    color: 'gold',
    bgClass: 'bg-gradient-to-b from-yellow-50 to-white',
    borderClass: 'border-yellow-400',
    btnClass: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 hover:opacity-90'
  },
  BUSINESS: {
    title: 'Gói Doanh Nghiệp',
    icon: <RocketOutlined className="text-xl text-blue-500" />,
    color: 'blue',
    bgClass: 'bg-gradient-to-b from-blue-50 to-white',
    borderClass: 'border-blue-400',
    btnClass: 'bg-gradient-to-r from-blue-500 to-blue-700 text-white border-0 hover:opacity-90'
  }
};



export default function SubscriptionPlansModal({ open, onClose }: Props) {
  const { isLoggedIn, isHost } = useAuth();
  
  const { data: mySubscriptionData } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      const res = await fetcher.get("/properties/host/my-subscription");
      return res.data?.data;
    },
    enabled: open && isLoggedIn && isHost,
  });

  const { data: plansData, isLoading: isPlansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const res = await fetcher.get("/properties/host/subscription-plans");
      return res.data?.data || [];
    },
    enabled: open,
  });

  const { mutate: handleSubscribe, isPending: isSubscribing } = useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      const returnUrl = `${window.location.origin}/payment-result`;
      // Sending GET request by default. We pass planId, returnUrl and amount as query params to support different backend conventions
      const res = await fetcher.get(`/payments/vnpay/subscription/create-url`, {
        params: {
          planId: plan.id,
          amount: plan.price,
          returnUrl: returnUrl
        }
      });
      return res.data;
    },
    onSuccess: (data) => {
      // Fallback strategies for different URL structures payload from API
      const url = typeof data === 'string' ? data : (data?.data?.url || data?.url || data?.data || data?.paymentUrl);
      if (url && typeof url === 'string' && url.startsWith('http')) {
        window.location.href = url;
      } else {
        message.error("Không thể tạo link thanh toán từ hệ thống. Vui lòng thử lại!");
      }
    },
    onError: (err) => {
      console.error("Payment error:", err);
      message.error("Đã xảy ra lỗi khi kết nối với cổng thanh toán VNPay");
    }
  });

  const currentPlan = mySubscriptionData?.tier || "FREE";

  return (
    <Modal
      title={<Title level={3} className="text-center m-0 mt-2 mb-4 text-gray-800">Nâng Cấp Gói Host</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      className="subscription-modal"
      classNames={{ body: "scrollbar-none" }}
      styles={{ body: { overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' } }}
    >
      <Paragraph className="text-center text-gray-500 mb-8 max-w-2xl mx-auto">
        Chọn gói phù hợp với quy mô kinh doanh của bạn để nhận thêm nhiều quyền lợi và ưu tiên hiển thị trên Stayhub.
      </Paragraph>
      {isPlansLoading ? (
        <div className="flex justify-center p-12"><Spin size="large" /></div>
      ) : (
        <Row gutter={[16, 16]} className="items-stretch pb-4 m-0">
          {plansData?.map((plan) => {
            console.log(plan)
            const uiConfig = planUIConfigs[plan.tier] || planUIConfigs.FREE;
            const isCurrent = currentPlan === plan.tier;
            
            const currentPlanData = plansData?.find(p => p.tier === currentPlan);
            const isLowerTier = currentPlanData ? plan.price < currentPlanData.price : false;

            const features = [
              plan.maxListings
                ? `Đăng tối đa ${plan.maxListings } cơ sở lưu trú`
                : 'Không giới hạn cơ sở lưu trú',
              `Phí hoa hồng: ${plan.commissionRate}%`,
              plan.description
            ].filter(Boolean);

            return (
              <Col xs={24} md={8} key={plan.id}>
                <Card 
                  className={`h-full rounded-2xl border-2 transition-all duration-300 hover:shadow-xl ${uiConfig.bgClass} ${isCurrent ? uiConfig.borderClass : 'border-gray-100'}`}
                  bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                      <Tag color="green" className="m-0 font-bold border-0 shadow-sm" icon={<CheckCircleOutlined />}>Đang dùng</Tag>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center bg-white shadow-sm mb-4 border border-gray-100`}>
                      {uiConfig.icon}
                    </div>
                    <Tag color={uiConfig.color} className="mb-2 font-bold px-3 py-1 rounded-full border-0">{plan.tier}</Tag>
                    <Title level={4} className="m-0 mt-2">{plan.name}</Title>
                    <div className="text-xl font-bold text-gray-800 mt-3">{plan.price === 0 ? 'Miễn phí' : `${formatCurrency(plan.price)} / tháng`}</div>
                  </div>

                  <div className="flex-grow">
                    <Space direction="vertical" size="middle" className="w-full">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircleOutlined className="text-[#2DD4A8] mt-1 flex-shrink-0" />
                          <span className="text-gray-600 text-sm leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </Space>
                  </div>

                  <div className="mt-8">
                    {isCurrent ? (
                      <Button block size="large" disabled className="bg-gray-100 text-gray-500 font-semibold border-0 rounded-xl">
                        Gói hiện tại
                      </Button>
                    ) : isLowerTier ? (
                      <Button block size="large" disabled className="bg-gray-50 text-gray-400 font-semibold border border-gray-100 rounded-xl">
                        Không khả dụng
                      </Button>
                    ) : (
                      <Button 
                        block 
                        size="large" 
                        loading={isSubscribing}
                        onClick={() => handleSubscribe(plan)}
                        className={`font-semibold rounded-xl ${uiConfig.btnClass}`}
                      >
                        Nâng cấp ngay
                      </Button>
                    )}
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Modal>
  );
}
