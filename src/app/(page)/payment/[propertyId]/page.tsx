"use client";

import React, { useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Button,
    Input,
    Radio,
    Checkbox,
    Collapse,
    Divider,
    ConfigProvider,
    message,
} from "antd";
import {
    ArrowLeftOutlined,
    StarFilled,
    CreditCardOutlined,
    SafetyCertificateOutlined,
    LockOutlined,
    EditOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";
import { Shield, Banknote, Smartphone, ChevronDown } from "lucide-react";
import locale from "antd/locale/vi_VN";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PropertyPaymentType } from "@/interfaces/enums";
import { fetcher } from "@/utils/fetcher";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PropertyDetail } from "@/interfaces/property";

const { TextArea } = Input;

/* ───── helpers ───── */
const fmt = (n: number) => n.toLocaleString("vi-VN");

const cancellationPolicyText: Record<string, { title: string; desc: string }> = {
    FLEXIBLE: {
        title: "Hoàn tiền 100% khi hủy trước 24 giờ.",
        desc: "Để nhận được tiền hoàn lại đầy đủ, khách phải hủy ít nhất 24 giờ trước giờ nhận phòng của danh sách. Sau thời gian đó, phí dịch vụ không được hoàn lại.",
    },
    MODERATE: {
        title: "Hoàn tiền 100% khi hủy trước 48 giờ.",
        desc: "Để nhận được tiền hoàn lại đầy đủ, khách phải hủy ít nhất 48 giờ trước giờ nhận phòng của danh sách. Sau thời gian đó, phí dịch vụ không được hoàn lại và 50% tiền phòng sẽ được tính.",
    },
    STRICT: {
        title: "Hoàn tiền 50% khi hủy trước 7 ngày.",
        desc: "Để nhận được 50% tiền hoàn lại, khách phải hủy ít nhất 7 ngày trước giờ nhận phòng. Sau thời gian đó, không hoàn lại bất kỳ khoản nào.",
    },
};

const paymentTypeLabel: Record<PropertyPaymentType, { name: string; desc: string; icon: React.ReactNode }> = {
    [PropertyPaymentType.PAY_IN_FULL]: {
        name: "Thanh toán online toàn bộ (VNPAY)",
        desc: "Thanh toán 100% qua cổng VNPAY. Nhanh chóng, an toàn.",
        icon: <CreditCardOutlined className="text-lg text-[#2DD4A8]" />,
    },
    [PropertyPaymentType.PAY_AT_CHECKIN]: {
        name: "Thanh toán khi nhận phòng",
        desc: "Thanh toán khoản cọc qua VNPAY. Phần còn lại thanh toán trực tiếp khi nhận phòng.",
        icon: <Banknote size={18} className="text-[#2DD4A8]" />,
    },
};

export default function PaymentPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    const slug = params?.propertyId as string;
    const checkin = searchParams.get("checkin") || "";
    const checkout = searchParams.get("checkout") || "";
    const roomIdsParam = searchParams.get("roomIds") || "";
    const guestsParam = searchParams.get("guests") || "2";

    /* ── resolve property ── */
    const { data: property, isLoading } = useQuery({
        queryKey: ["property-checkout", slug],
        queryFn: async () => {
            const res = await fetcher.get(`/properties/${slug}`);
            return (res.data?.data || res.data) as PropertyDetail;
        },
        enabled: !!slug,
    });

    const isEntirePlace = property?.rentalTypeSlug === "toan-bo-cho-o";
    const rooms = property?.rooms || [];

    const selectedRooms = useMemo(() => {
        if (!rooms.length) return [];
        if (isEntirePlace) return [rooms[0]];
        const ids = roomIdsParam.split(",").map(Number);
        return rooms.filter(r => ids.includes(r.id));
    }, [rooms, isEntirePlace, roomIdsParam]);

    const thumbnail = useMemo(() => {
        if (!property) return "";
        return property.imageUrls?.[0] || "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80";
    }, [property]);

    const hostProfile = property?.host;

    /* ── derived booking values ── */
    const nights = useMemo(() => {
        if (!checkin || !checkout) return 0;
        const d1 = new Date(checkin);
        const d2 = new Date(checkout);
        return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000));
    }, [checkin, checkout]);

    const guests = parseInt(guestsParam, 10) || 2;
    
    const pricePerNight = useMemo(() => {
        if (isEntirePlace && property?.rooms?.[0]) return property.rooms[0].pricePerNight;
        if (selectedRooms.length > 0) return selectedRooms.reduce((sum, r) => sum + r.pricePerNight, 0);
        return property?.rooms?.[0]?.pricePerNight || 0;
    }, [selectedRooms, isEntirePlace, property]);

    // ── Calculate Price API ─────────────────────────────────────────────
    const calculatePricePayload = useMemo(() => {
        if (!checkin || !checkout) return null;
        const roomIds = isEntirePlace ? null : selectedRooms.map(r => r.id);
        return {
            slug,
            checkInDate: checkin,
            checkOutDate: checkout,
            roomIds,
        };
    }, [checkin, checkout, isEntirePlace, selectedRooms, slug]);

    const { data: calculatedPriceData } = useQuery({
        queryKey: ["calculate-price-payment", calculatePricePayload],
        queryFn: async () => {
            if (!calculatePricePayload) return null;
            const params = new URLSearchParams();
            params.append("checkInDate", calculatePricePayload.checkInDate);
            params.append("checkOutDate", calculatePricePayload.checkOutDate);
            if (calculatePricePayload.roomIds) {
                calculatePricePayload.roomIds.forEach((id: number) => params.append("roomIds", id.toString()));
            }

            const res = await fetcher.get(
                `/properties/${calculatePricePayload.slug}/calculate-price?${params.toString()}`
            );
            return res.data?.data ?? res.data;
        },
        enabled: !!calculatePricePayload,
        staleTime: 30000,
    });

    const apiTotal = useMemo(() => {
        if (!calculatedPriceData || !Array.isArray(calculatedPriceData)) return null;
        return calculatedPriceData.reduce(
            (sum: number, item: any) => sum + (item.calculatedTotalPrice || 0),
            0
        );
    }, [calculatedPriceData]);

    const cleaningFee = property?.cleaningFee ?? 0;
    const subtotalFallback = pricePerNight * nights;
    const totalFallback = subtotalFallback + cleaningFee;

    const subtotal = apiTotal !== null ? apiTotal : subtotalFallback;
    const total = apiTotal !== null ? (apiTotal + cleaningFee) : totalFallback;

    const allowedPaymentTypes = useMemo(() => {
        if (!property) return [PropertyPaymentType.PAY_IN_FULL];
        const types = [PropertyPaymentType.PAY_IN_FULL];
        if (property.isPayAtCheckinAllowed) types.push(PropertyPaymentType.PAY_AT_CHECKIN);
        return types;
    }, [property]);

    /* ── form state ── */
    const [selectedPaymentType, setSelectedPaymentType] = useState<PropertyPaymentType>(PropertyPaymentType.PAY_IN_FULL);
    
    // Default to ONLINE_FULL when allowedPaymentTypes changes
    React.useEffect(() => {
        if (allowedPaymentTypes.length > 0 && !allowedPaymentTypes.includes(selectedPaymentType)) {
            setSelectedPaymentType(allowedPaymentTypes[0]);
        }
    }, [allowedPaymentTypes, selectedPaymentType]);

    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [email, setEmail] = useState("");
    const [note, setNote] = useState("");
    const [agreed, setAgreed] = useState(false);

    const bookingMutation = useMutation({
        mutationFn: async () => {
            const paymentOption = selectedPaymentType === PropertyPaymentType.PAY_AT_CHECKIN 
                ? PropertyPaymentType.PAY_AT_CHECKIN 
                : PropertyPaymentType.PAY_IN_FULL;
            
            const payload = {
                propertyId: property?.id || 0,
                checkInDate: checkin,
                checkOutDate: checkout,
                roomIds: selectedRooms.map(r => r.id),
                totalGuests: guests,
                paymentOption,
                note: note
            };
            
            const res = await fetcher.post("/bookings", payload);
            return res.data;
        },
        onSuccess: async (data) => {
            const bookingCode = data?.data;
            if (!bookingCode) {
                message.error("Lỗi: Không nhận được mã booking.");
                return;
            }
            // We removed the manual redirect for cash because PAY_AT_CHECKIN now requires an online deposit via VNPAY
            try {
                const returnUrl = `${window.location.origin}/payment-result`;
                const vnpayRes = await fetcher.get("/payments/vnpay/booking/create-url", {
                    params: { bookingCode, returnUrl }
                });
                if (vnpayRes.data?.data) {
                    window.location.href = vnpayRes.data.data;
                } else {
                    message.error("Không lấy được đường dẫn thanh toán");
                }
            } catch (err) {
                message.error("Lỗi khi tạo giao dịch thanh toán.");
            }
        },
        onError: (err: any) => {
            if (err?.response?.status === 500) {
                message.error("Chủ nhà không thể tự đặt phòng của chính mình, hoặc phòng không đủ sức chứa/đã bị khóa.");
                return;
            }
            message.error(err?.response?.data?.message || "Có lỗi xảy ra khi tạo đặt phòng, vui lòng thử lại.");
        }
    });

    const handleBookingSubmit = () => {
        if (!lastName || !firstName || !email) {
            message.warning("Vui lòng điền đủ thông tin khách hàng!");
            return;
        }
        bookingMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Đang tải thông tin phòng...</h2>
                </div>
                <Footer />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-[1200px] mx-auto px-4 py-20 text-center">
                    <h2 className="text-xl font-semibold text-gray-700">Không tìm thấy thông tin phòng</h2>
                    <Link href="/" className="text-[#2DD4A8] font-medium mt-4 inline-block">
                        ← Quay về trang chủ
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
    };

    const depositPercent = property.depositPercentage ?? 0;
    const depositAmount = Math.round(total * (depositPercent / 100));
    const remainingAmount = total - depositAmount;

    const isOnlineMethod = true; // Both methods require VNPAY now

    const categoryName = property.categoryName || "CHỖ Ở";

    return (
        <ConfigProvider locale={locale}>
            <div className="min-h-screen bg-white">
                <Header />

                <main className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-6 py-5 sm:py-8">
                    {/* ── Back + Title ── */}
                    <div className="flex items-center gap-3 mb-5 sm:mb-8">
                        <Link
                            href={`/homestay/${property.slug}`}
                            className="text-gray-800 hover:text-[#2DD4A8] transition-colors"
                        >
                            <ArrowLeftOutlined className="text-base sm:text-lg" />
                        </Link>
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 m-0">
                            Xác nhận và thanh toán
                        </h1>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
                        {/* ═══════ RIGHT COLUMN – Sidebar (mobile: on top, desktop: right) ═══════ */}
                        <div className="w-full lg:w-[400px] flex-shrink-0 order-first lg:order-last">
                            <div className="lg:sticky lg:top-24 border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                                {/* Property card */}
                                <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200">
                                    <div className="w-20 h-16 sm:w-28 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
                                        <img
                                            src={thumbnail}
                                            alt={property.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 m-0 mb-0.5">
                                            {categoryName}
                                        </p>
                                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 m-0 leading-snug line-clamp-2">
                                            {property.name}
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-gray-500 m-0 mt-0.5 sm:mt-1">
                                            {property.district}, {property.province}
                                        </p>
                                        <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                                            <StarFilled className="text-yellow-400 text-[10px] sm:text-xs" />
                                            <span className="text-[11px] sm:text-xs font-semibold">{property.ratingAvg}</span>
                                            <span className="text-[11px] sm:text-xs text-gray-400">
                                                ({property.reviewCount} đánh giá)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price breakdown */}
                                <div className="mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-200">
                                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">
                                        Chi tiết giá
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                                            <span>{fmt(pricePerNight)} đ x {nights} đêm</span>
                                            <span>{fmt(subtotal)} đ</span>
                                        </div>
                                        {cleaningFee > 0 && (
                                            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                                                <span className="underline cursor-pointer">Phí vệ sinh</span>
                                                <span>{fmt(cleaningFee)} đ</span>
                                            </div>
                                        )}
                                    </div>
                                    <Divider className="!my-2 sm:!my-3" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm sm:text-base font-bold text-gray-900">Tổng cộng (VND)</span>
                                        <span className="text-base sm:text-lg font-bold text-[#2DD4A8]">{fmt(total)} đ</span>
                                    </div>
                                    
                                    {selectedPaymentType === PropertyPaymentType.PAY_AT_CHECKIN && depositAmount > 0 && (
                                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <div className="flex justify-between text-xs text-amber-700 mb-1.5">
                                                <span>Yêu cầu thanh toán cọc ({depositPercent}%)</span>
                                                <span className="font-bold">{fmt(depositAmount)} đ</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-amber-600">
                                                <span>Còn lại thanh toán tại chỗ ở</span>
                                                <span>{fmt(remainingAmount)} đ</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* AirCover */}
                                <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 bg-[#F0FDFB] rounded-xl mb-3 sm:mb-4">
                                    <Shield size={18} className="text-[#2DD4A8] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs sm:text-sm font-bold text-[#2DD4A8] m-0">Bảo vệ AirCover</p>
                                        <p className="text-[10px] sm:text-[11px] text-gray-500 m-0 mt-0.5 leading-relaxed">
                                            Mỗi đơn đặt phòng đều bao gồm sự bảo vệ miễn phí khỏi những vấn đề về chỗ ở.
                                        </p>
                                    </div>
                                </div>

                                {/* Help */}
                                <div className="text-center">
                                    <a className="text-[11px] sm:text-xs text-gray-500 hover:text-[#2DD4A8] underline cursor-pointer inline-flex items-center gap-1">
                                        <QuestionCircleOutlined className="text-[10px]" />
                                        Cần trợ giúp? Liên hệ trung tâm hỗ trợ
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* ═══════ LEFT COLUMN ═══════ */}
                        <div className="flex-1 min-w-0 order-last lg:order-first">

                            {/* ── Chuyến đi của bạn ── */}
                            <section className="mb-5 sm:mb-8 pb-5 sm:pb-8 border-b border-gray-200">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                                    Chuyến đi của bạn
                                </h2>
                                <div className="space-y-2.5 sm:space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-xs sm:text-sm text-gray-900 m-0">Ngày</p>
                                            <p className="text-xs sm:text-sm text-gray-600 m-0">
                                                {formatDate(checkin)} - {formatDate(checkout)}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/homestay/${property.slug}`}
                                            className="text-xs sm:text-sm font-semibold text-gray-900 underline hover:text-[#2DD4A8]"
                                        >
                                            Chỉnh sửa
                                        </Link>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-xs sm:text-sm text-gray-900 m-0">Khách</p>
                                            <p className="text-xs sm:text-sm text-gray-600 m-0">{guests} khách</p>
                                        </div>
                                        <Link
                                            href={`/homestay/${property.slug}`}
                                            className="text-xs sm:text-sm font-semibold text-gray-900 underline hover:text-[#2DD4A8]"
                                        >
                                            Chỉnh sửa
                                        </Link>
                                    </div>
                                </div>
                            </section>

                            {/* ── Thanh toán bằng ── */}
                            <section className="mb-5 sm:mb-8 pb-5 sm:pb-8 border-b border-gray-200">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                                    Thanh toán bằng
                                </h2>

                                <Radio.Group
                                    value={selectedPaymentType}
                                    onChange={(e) => setSelectedPaymentType(e.target.value)}
                                    className="w-full"
                                >
                                    <div className="space-y-2 sm:space-y-3">
                                        {allowedPaymentTypes.map((type) => {
                                            const info = paymentTypeLabel[type];
                                            const isSelected = selectedPaymentType === type;
                                            return (
                                                <div
                                                    key={type}
                                                    onClick={() => setSelectedPaymentType(type)}
                                                    className={`
                                                        border-2 rounded-xl p-3 sm:p-4 cursor-pointer transition-all
                                                        ${isSelected
                                                            ? "border-[#2DD4A8] bg-[#F0FDFB] shadow-sm"
                                                            : "border-gray-200 hover:border-gray-300"
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-start gap-2 sm:gap-3">
                                                        <Radio value={type} className="mt-0.5" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                                                {info.icon}
                                                                <span className="font-semibold text-xs sm:text-sm text-gray-900">
                                                                    {info.name}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] sm:text-xs text-gray-500 m-0">
                                                                {info.desc}
                                                            </p>
                                                            {type === PropertyPaymentType.PAY_AT_CHECKIN && isSelected && (
                                                                <div className="mt-2 p-2 bg-[#E6FAF5] rounded-lg">
                                                                    <p className="text-[11px] sm:text-xs text-[#2DD4A8] font-medium m-0">
                                                                        Đặt cọc online ({depositPercent}%): {fmt(depositAmount)}đ — Trả tại quầy: {fmt(remainingAmount)}đ
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Radio.Group>
                            </section>

                            {/* ── Thông tin khách hàng ── */}
                            <section className="mb-5 sm:mb-8 pb-5 sm:pb-8 border-b border-gray-200">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                                    Thông tin khách hàng
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                    <div>
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium">Họ</label>
                                        <Input
                                            placeholder="Vd: Nguyễn"
                                            size="middle"
                                            className="!rounded-lg mt-1 sm:!h-10"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium">Tên</label>
                                        <Input
                                            placeholder="Vd: Văn A"
                                            size="middle"
                                            className="!rounded-lg mt-1 sm:!h-10"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3 sm:mb-4">
                                    <label className="text-[11px] sm:text-xs text-gray-500 font-medium">
                                        Email xác nhận
                                    </label>
                                    <Input
                                        placeholder="nguyenvana@example.com"
                                        size="middle"
                                        className="!rounded-lg mt-1 sm:!h-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 sm:gap-0 mb-1">
                                        <label className="text-[11px] sm:text-xs text-gray-500 font-medium">
                                            Lời nhắn cho chủ nhà (Tùy chọn)
                                        </label>
                                        <span className="text-[10px] text-gray-400">
                                            Ví dụ: Thời gian nhập phòng dự kiến
                                        </span>
                                    </div>
                                    <TextArea
                                        rows={3}
                                        placeholder={`Chào ${hostProfile?.fullName || "chủ nhà"}, mình rất mong chờ chuyến đi này...`}
                                        className="!rounded-lg"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>
                            </section>

                            {/* ── Thông tin bắt buộc ── */}
                            <section className="mb-5 sm:mb-8 pb-5 sm:pb-8 border-b border-gray-200">
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
                                    Thông tin bắt buộc
                                </h2>
                                <Collapse
                                    bordered={false}
                                    className="bg-transparent [&_.ant-collapse-item]:!border-b [&_.ant-collapse-item]:!border-gray-100"
                                    expandIconPosition="end"
                                    items={[
                                        {
                                            key: "cancellation",
                                            label: (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#F0FDFB] flex items-center justify-center flex-shrink-0">
                                                        <SafetyCertificateOutlined className="text-[#2DD4A8]" />
                                                    </div>
                                                    <span className="font-semibold text-sm text-gray-900">
                                                        Chính sách hủy phòng
                                                    </span>
                                                </div>
                                            ),
                                            children: (
                                                <div className="pl-11">
                                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                                        {selectedRooms[0]?.cancellationPolicyResponse?.name || cancellationPolicyText["FLEXIBLE"].title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 leading-relaxed">
                                                        {selectedRooms[0]?.cancellationPolicyResponse?.description || cancellationPolicyText["FLEXIBLE"].desc}
                                                    </p>
                                                </div>
                                            ),
                                        },
                                        {
                                            key: "rules",
                                            label: (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#F0FDFB] flex items-center justify-center flex-shrink-0">
                                                        <EditOutlined className="text-[#2DD4A8]" />
                                                    </div>
                                                    <span className="font-semibold text-sm text-gray-900">
                                                        Nội quy chỗ ở
                                                    </span>
                                                </div>
                                            ),
                                            children: (
                                                <div className="pl-11">
                                                    <p className="text-xs text-gray-500 leading-relaxed">
                                                        Tuân thủ các quy định chung của chủ nhà.
                                                    </p>
                                                    <ul className="text-xs text-gray-500 mt-2 space-y-1 pl-4 list-disc">
                                                        <li>Nhận phòng sau {property.checkInAfter}, trả phòng trước {property.checkOutBefore}</li>
                                                        {!property.isSmokingAllowed && <li>Không hút thuốc trong nhà</li>}
                                                        {!property.isPetsAllowed && <li>Không mang thú cưng</li>}
                                                        {!property.isPartyAllowed && <li>Không tổ chức tiệc</li>}
                                                        <li>Tối đa {property.maxGuests} khách</li>
                                                    </ul>
                                                </div>
                                            ),
                                        },
                                    ]}
                                />
                            </section>

                            {/* ── Agreement + Submit ── */}
                            <section className="mb-6 sm:mb-8">
                               <div className="flex gap-2">
                                <Checkbox
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="items-start"
                                >
                                </Checkbox>
                                <span className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                                    Bằng việc chọn nút bên dưới, tôi đồng ý với{" "}
                                    <a className="font-semibold text-gray-900 underline hover:text-[#2DD4A8] cursor-pointer">
                                        Nội quy nhà
                                    </a>
                                    ,{" "}
                                    <a className="font-semibold text-gray-900 underline hover:text-[#2DD4A8] cursor-pointer">
                                        Quy chuẩn an toàn trong đại dịch
                                    </a>{" "}
                                    và{" "}
                                    <a className="font-semibold text-gray-900 underline hover:text-[#2DD4A8] cursor-pointer">
                                        Điều khoản dịch vụ
                                    </a>{" "}
                                    của HomestayBooking.
                                </span>
                               </div>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    disabled={!agreed || bookingMutation.isPending}
                                    loading={bookingMutation.isPending}
                                    onClick={handleBookingSubmit}
                                    className={`
                                        !rounded-xl !h-11 sm:!h-12 sm:!w-auto sm:!inline-flex !px-8 !text-sm sm:!text-base !font-semibold mt-4 sm:mt-6
                                        ${agreed
                                            ? "!bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
                                            : ""
                                        }
                                    `}
                                >
                                    Xác nhận và thanh toán
                                </Button>

                                <p className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-400 mt-2 sm:mt-3">
                                    <LockOutlined className="text-[10px]" />
                                    Hệ thống thanh toán an toàn và được mã hóa SSL.
                                </p>
                            </section>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </ConfigProvider>
    );
}
