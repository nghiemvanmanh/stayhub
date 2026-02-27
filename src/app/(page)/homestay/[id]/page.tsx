"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    Button,
    DatePicker,
    Divider,
    Skeleton,
    Tag,
    Tabs,
    Avatar,
    ConfigProvider,
} from "antd";
import {
    ShareAltOutlined,
    HeartOutlined,
    HeartFilled,
    StarFilled,
    EnvironmentOutlined,
    HomeOutlined,
    ExpandAltOutlined,
    MinusOutlined,
    PlusOutlined,
    CheckCircleFilled,
} from "@ant-design/icons";
import {
    Wifi,
    Car,
    CalendarCheck,
    BedDouble,
    Bath,
    Users,
    ChevronRight,
    SquareM,
} from "lucide-react";
import Link from "next/link";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/locale/vi_VN";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
    fetchHomestayDetail,
    fetchSimilarHomestays,
    type RoomType,
} from "@/interfaces/homestay";

dayjs.locale("vi");

const { RangePicker } = DatePicker;

const highlightIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi size={22} className="text-[#2DD4A8]" />,
    car: <Car size={22} className="text-[#2DD4A8]" />,
    calendar: <CalendarCheck size={22} className="text-[#2DD4A8]" />,
};

export default function HomestayDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const [isFavorite, setIsFavorite] = useState(false);
    const [showAllPhotos, setShowAllPhotos] = useState(false);
    const [guests, setGuests] = useState(2);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [bookWholeVilla, setBookWholeVilla] = useState(false);
    const [dates, setDates] = useState<[Dayjs, Dayjs] | null>(null);

    const { data: detail, isLoading: loadingDetail } = useQuery({
        queryKey: ["homestay-detail", id],
        queryFn: () => fetchHomestayDetail(id),
    });

    const { data: similar, isLoading: loadingSimilar } = useQuery({
        queryKey: ["similar-homestays", detail?.city],
        queryFn: () => fetchSimilarHomestays(detail?.city ?? ""),
        enabled: !!detail?.city,
    });

    const selectedRoom = detail?.roomTypes.find((r) => r.id === selectedRoomId) ?? null;
    const nights = dates ? dates[1].diff(dates[0], "day") : 0;

    // Max guests depends on what's selected
    const maxGuestsLimit = bookWholeVilla
        ? (detail?.maxGuests ?? 1)
        : selectedRoom
            ? selectedRoom.maxGuests
            : (detail?.maxGuests ?? 1);

    // Nothing selected → no price shown, button disabled
    const hasSelection = bookWholeVilla || !!selectedRoomId;
    const pricePerNight = bookWholeVilla
        ? (detail?.pricePerNight ?? 0)
        : selectedRoom
            ? selectedRoom.pricePerNight
            : 0;
    const subtotal = pricePerNight * nights;
    const cleaningFee = detail?.cleaningFee ?? 0;
    const serviceFee = detail?.serviceFee ?? 0;
    const total = subtotal + cleaningFee + serviceFee;
    const canBook = hasSelection && nights > 0;

    const handleToggleRoom = (room: RoomType) => {
        setBookWholeVilla(false);
        setSelectedRoomId((prev) => {
            const next = prev === room.id ? null : room.id;
            if (next) setGuests((g) => Math.min(g, room.maxGuests));
            return next;
        });
    };

    const handleToggleWholeVilla = () => {
        setSelectedRoomId(null);
        setBookWholeVilla((prev) => !prev);
        // no need to clamp: whole villa has the highest limit
    };

    const disabledDate = (current: Dayjs) =>
        current && current < dayjs().startOf("day");

    if (loadingDetail) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-[1200px] mx-auto px-4 py-8">
                    <Skeleton active paragraph={{ rows: 6 }} />
                </div>
                <Footer />
            </div>
        );
    }

    if (!detail) return null;

    return (
        <ConfigProvider locale={locale}>
            <div className="min-h-screen bg-white">
                <Header />

                <main className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6">
                    {/* ── Title ─────────────────────────────────────────── */}
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {detail.title}
                        </h1>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1">
                                    <StarFilled className="text-yellow-400 text-sm" />
                                    <span className="font-semibold text-sm">{detail.rating}</span>
                                    <span className="text-gray-500 text-sm underline cursor-pointer">
                                        · {detail.reviewCount} đánh giá
                                    </span>
                                </div>
                                <Tag
                                    color="green"
                                    className="rounded-full border-0 bg-[#E6FAF5] text-[#2DD4A8] font-medium text-xs px-2"
                                >
                                    {detail.badge}
                                </Tag>
                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                    <EnvironmentOutlined />
                                    <span className="underline cursor-pointer">{detail.address}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 underline">
                                    <ShareAltOutlined />
                                    Chia sẻ
                                </button>
                                <button
                                    onClick={() => setIsFavorite(!isFavorite)}
                                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 underline"
                                >
                                    {isFavorite ? (
                                        <HeartFilled className="text-red-500" />
                                    ) : (
                                        <HeartOutlined />
                                    )}
                                    Lưu
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Photo Gallery ──────────────────────────────────── */}
                    <div className="relative rounded-2xl overflow-hidden mb-8">
                        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px]">
                            {/* Main large image */}
                            <div className="col-span-2 row-span-2 relative overflow-hidden">
                                <img
                                    src={detail.images[0]}
                                    alt={detail.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                />
                            </div>
                            {/* 4 small images */}
                            {detail.images.slice(1, 5).map((img, idx) => (
                                <div key={idx} className="relative overflow-hidden">
                                    <img
                                        src={img}
                                        alt={`Photo ${idx + 2}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                        {/* View all button */}
                        <button
                            onClick={() => setShowAllPhotos(true)}
                            className="absolute bottom-4 right-4 bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 shadow-sm"
                        >
                            <ExpandAltOutlined />
                            Xem tất cả ảnh
                        </button>
                    </div>

                    {/* ── Body: Left content + Right booking card ─────── */}
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* LEFT */}
                        <div className="flex-1 min-w-0">
                            {/* Host info & quick stats */}
                            <div className="flex items-start justify-between mb-5 pb-6 border-b border-gray-200">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                        {detail.subtitle}
                                    </h2>
                                    <div className="flex items-center gap-3 text-gray-500 text-sm flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {detail.maxGuests} khách
                                        </span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <HomeOutlined className="text-xs" />
                                            {detail.bedrooms} phòng ngủ
                                        </span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <BedDouble size={14} />
                                            {detail.beds} giường
                                        </span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <Bath size={14} />
                                            {detail.bathrooms} phòng tắm
                                        </span>
                                    </div>
                                </div>
                                <Avatar
                                    src={detail.hostAvatar}
                                    size={52}
                                    className="border-2 border-[#2DD4A8] flex-shrink-0"
                                />
                            </div>

                            {/* Highlights */}
                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                                {detail.highlights.map((h, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {highlightIcons[h.icon]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm m-0">
                                                {h.title}
                                            </p>
                                            <p className="text-gray-500 text-xs m-0">{h.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tabs */}
                            <Tabs
                                defaultActiveKey="0"
                                className="mb-6"
                                items={detail.tabs.map((tab, i) => ({
                                    key: String(i),
                                    label: tab,
                                    children:
                                        i === 0 ? (
                                            <div className="text-gray-600 text-sm leading-relaxed">
                                                {detail.description.split("\n\n").map((para, pi) => (
                                                    <p key={pi} className="mb-3">
                                                        {para}
                                                    </p>
                                                ))}
                                                <button className="flex items-center gap-1 font-semibold text-gray-900 text-sm mt-2 hover:underline">
                                                    Hiển thị thêm <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-sm py-4">
                                                Nội dung đang được cập nhật...
                                            </div>
                                        ),
                                }))}
                            />

                            {/* Room Types */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Chọn loại phòng phù hợp
                                </h3>
                                <div className="space-y-4">

                                    {/* ── Whole villa card ─────────────────── */}
                                    <div
                                        onClick={handleToggleWholeVilla}
                                        className={`flex gap-4 p-4 border-2 rounded-2xl transition-all cursor-pointer ${bookWholeVilla
                                            ? "border-[#2DD4A8] shadow-md bg-[#F0FDFB]"
                                            : "border-gray-200 hover:border-[#2DD4A8] hover:shadow-md"
                                            }`}
                                    >
                                        <div className="w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                                            <img
                                                src={detail.images[0]}
                                                alt="Toàn bộ biệt thự"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-base mb-1">
                                                        Toàn bộ biệt thự
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-gray-500 text-xs mb-1.5 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Users size={12} />
                                                            Tối đa {detail.maxGuests} khách
                                                        </span>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <BedDouble size={12} />
                                                            {detail.bedrooms} phòng ngủ
                                                        </span>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <Bath size={12} />
                                                            {detail.bathrooms} phòng tắm
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                                                        Thuê toàn bộ không gian biệt thự, phù hợp cho nhóm đông hoặc gia đình lớn.
                                                    </p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {["Bữa sáng miễn phí", "Hồ bơi riêng", "Hủy linh hoạt"].map((a) => (
                                                            <span key={a} className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                                                                {a}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-[#2DD4A8] font-bold text-base">
                                                        {detail.pricePerNight.toLocaleString("vi-VN")}đ
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">/đêm</div>
                                                    {bookWholeVilla && (
                                                        <div className="mt-1.5 flex items-center justify-end gap-1 text-[#2DD4A8] text-xs font-semibold">
                                                            <CheckCircleFilled /> Đang chọn
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Individual room cards ─────────────── */}
                                    {detail.roomTypes.map((room) => {
                                        const isSelected = selectedRoomId === room.id;
                                        return (
                                            <div
                                                key={room.id}
                                                onClick={() => handleToggleRoom(room)}
                                                className={`flex gap-4 p-4 border-2 rounded-2xl transition-all cursor-pointer ${isSelected
                                                    ? "border-[#2DD4A8] shadow-md bg-[#F0FDFB]"
                                                    : "border-gray-200 hover:border-[#2DD4A8] hover:shadow-md"
                                                    }`}
                                            >
                                                {/* Room image */}
                                                <div className="w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                                                    <img
                                                        src={room.image}
                                                        alt={room.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                {/* Room info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 text-base mb-1">
                                                                {room.name}
                                                            </h4>
                                                            <div className="flex items-center gap-3 text-gray-500 text-xs mb-1.5">
                                                                <span className="flex items-center gap-1">
                                                                    <SquareM size={12} />
                                                                    {room.area}m²
                                                                </span>
                                                                <span>·</span>
                                                                <span className="flex items-center gap-1">
                                                                    <BedDouble size={12} />
                                                                    {room.bedType}
                                                                </span>
                                                                <span>·</span>
                                                                <span className="flex items-center gap-1">
                                                                    <Users size={12} />
                                                                    Tối đa {room.maxGuests} khách
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                                                                {room.description}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {room.amenities.map((a) => (
                                                                    <span
                                                                        key={a}
                                                                        className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5"
                                                                    >
                                                                        {a}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {/* Price */}
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-[#2DD4A8] font-bold text-base">
                                                                {room.price}
                                                            </div>
                                                            {room.originalPrice && (
                                                                <div className="text-xs text-gray-400 line-through">
                                                                    {room.originalPrice}
                                                                </div>
                                                            )}
                                                            {room.discount && (
                                                                <Tag color="red" className="text-xs mt-0.5">
                                                                    -{room.discount}%
                                                                </Tag>
                                                            )}
                                                            <div className="text-[10px] text-gray-400">
                                                                /đêm
                                                            </div>
                                                            {isSelected && (
                                                                <div className="mt-1.5 flex items-center justify-end gap-1 text-[#2DD4A8] text-xs font-semibold">
                                                                    <CheckCircleFilled />
                                                                    Đang chọn
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Reviews */}
                            <div className="mb-8 pb-8 border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <StarFilled className="text-yellow-400 text-lg" />
                                    <span className="text-xl font-bold">
                                        {detail.rating} · {detail.reviewCount} đánh giá
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {detail.reviews.map((rev) => (
                                        <div key={rev.id}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Avatar src={rev.avatar} size={40} />
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-900 m-0">
                                                        {rev.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 m-0">{rev.date}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {rev.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-4 border border-gray-900 rounded-xl px-5 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
                                    Hiển thị tất cả {detail.reviewCount} đánh giá
                                </button>
                            </div>

                            {/* Similar Homestays */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Nơi ở tương tự tại {detail.city}
                                </h3>
                                {loadingSimilar ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <Skeleton key={i} active />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {similar?.map((s) => (
                                            <Link
                                                key={s.id}
                                                href={`/homestay/${s.id}`}
                                                className="no-underline block cursor-pointer group"
                                            >
                                                <div className="relative overflow-hidden rounded-xl mb-2 aspect-square">
                                                    <img
                                                        src={s.image}
                                                        alt={s.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <button className="absolute top-2 right-2 text-white hover:text-red-400 transition-colors">
                                                        <HeartOutlined className="text-lg drop-shadow" />
                                                    </button>
                                                </div>
                                                <p className="font-semibold text-sm text-gray-900 m-0 truncate">
                                                    {s.title}
                                                </p>
                                                <p className="text-xs text-gray-400 m-0">{s.distance}</p>
                                                <p className="text-sm text-gray-700 m-0 mt-0.5">
                                                    <span className="font-semibold">{s.price}</span>
                                                    <span className="text-gray-400"> / đêm</span>
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT – Booking Card */}
                        <div className="lg:w-[380px] flex-shrink-0">
                            <div className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-lg">

                                {/* Price header */}
                                <div className="flex items-baseline justify-between mb-3">
                                    <div>
                                        {hasSelection ? (
                                            <>
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {pricePerNight.toLocaleString("vi-VN")}đ
                                                </span>
                                                <span className="text-gray-500 text-sm"> / đêm</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">
                                                Chưa chọn phòng
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                        <StarFilled className="text-yellow-400 text-xs" />
                                        <span className="font-semibold">{detail.rating}</span>
                                        <span className="text-gray-400">
                                            · {detail.reviewCount} đánh giá
                                        </span>
                                    </div>
                                </div>

                                {/* Selection indicator */}
                                {bookWholeVilla ? (
                                    <div className="mb-3 flex items-center justify-between bg-[#E6FAF5] border border-[#2DD4A8] rounded-xl px-3 py-2">
                                        <span className="text-xs text-[#2DD4A8] font-semibold flex items-center gap-1">
                                            <CheckCircleFilled /> Toàn bộ biệt thự
                                        </span>
                                        <button
                                            onClick={() => setBookWholeVilla(false)}
                                            className="text-gray-400 hover:text-gray-600 text-xs leading-none"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : selectedRoom ? (
                                    <div className="mb-3 flex items-center justify-between bg-[#E6FAF5] border border-[#2DD4A8] rounded-xl px-3 py-2">
                                        <span className="text-xs text-[#2DD4A8] font-semibold flex items-center gap-1">
                                            <CheckCircleFilled /> {selectedRoom.name}
                                        </span>
                                        <button
                                            onClick={() => setSelectedRoomId(null)}
                                            className="text-gray-400 hover:text-gray-600 text-xs leading-none"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mb-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                                        <p className="text-xs text-amber-600 m-0">
                                            👆 Chọn loại phòng hoặc toàn bộ biệt thự bên trái để tiếp tục
                                        </p>
                                    </div>
                                )}

                                {/* Date RangePicker */}
                                <div className="mb-3">
                                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                        Ngày nhận — trả phòng
                                    </p>
                                    <RangePicker
                                        className="w-full !rounded-xl"
                                        size="large"
                                        format="DD/MM/YYYY"
                                        placeholder={["Nhận phòng", "Trả phòng"]}
                                        disabledDate={disabledDate}
                                        value={dates}
                                        onChange={(vals) => {
                                            if (vals?.[0] && vals?.[1]) {
                                                setDates([vals[0], vals[1]]);
                                            } else {
                                                setDates(null);
                                            }
                                        }}
                                    />
                                    {dates && (
                                        <p className="text-xs text-[#2DD4A8] mt-1 font-medium">
                                            ✓ {nights} đêm: {dates[0].format("DD/MM")} → {dates[1].format("DD/MM/YYYY")}
                                        </p>
                                    )}
                                </div>

                                {/* Guests counter */}
                                <div className="border border-gray-200 rounded-xl p-3 mb-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wide m-0">
                                            Khách
                                        </p>
                                        <p className="text-sm text-gray-600 m-0 mt-0.5">
                                            {guests} khách
                                        </p>
                                        <p className="text-[10px] text-gray-400 m-0">
                                            Tối đa {maxGuestsLimit} khách
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setGuests((g) => Math.max(1, g - 1))}
                                            disabled={guests <= 1}
                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#2DD4A8] hover:text-[#2DD4A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <MinusOutlined style={{ fontSize: 10 }} />
                                        </button>
                                        <span className="text-sm font-semibold w-4 text-center">{guests}</span>
                                        <button
                                            onClick={() => setGuests((g) => Math.min(maxGuestsLimit, g + 1))}
                                            disabled={guests >= maxGuestsLimit}
                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#2DD4A8] hover:text-[#2DD4A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <PlusOutlined style={{ fontSize: 10 }} />
                                        </button>
                                    </div>
                                </div>

                                {/* CTA */}
                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    disabled={!canBook}
                                    className="!rounded-xl !h-12 !text-base !font-semibold mb-3
                                    enabled:!bg-[#2DD4A8] enabled:!border-[#2DD4A8] enabled:hover:!bg-[#25bc95]"
                                >
                                    {!hasSelection
                                        ? "Chọn phòng để đặt"
                                        : !dates
                                            ? "Chọn ngày để đặt"
                                            : "Đặt ngay"}
                                </Button>
                                {canBook && (
                                    <p className="text-center text-xs text-gray-400 mb-4">
                                        Bạn vẫn chưa bị tính tiền
                                    </p>
                                )}

                                {/* Price breakdown — only when selection + dates */}
                                {hasSelection && nights > 0 ? (
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span className="underline cursor-pointer">
                                                {pricePerNight.toLocaleString("vi-VN")}đ × {nights} đêm
                                            </span>
                                            <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span className="underline cursor-pointer">Phí vệ sinh</span>
                                            <span>{cleaningFee.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span className="underline cursor-pointer">
                                                Phí dịch vụ HomestayBooking
                                            </span>
                                            <span>{serviceFee.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                        <Divider className="!my-3" />
                                        <div className="flex justify-between font-bold text-gray-900 text-sm">
                                            <span>Tổng cộng</span>
                                            <span className="text-[#2DD4A8] text-base">{total.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                    </div>
                                ) : hasSelection ? (
                                    <p className="text-xs text-gray-400 text-center">
                                        👆 Chọn ngày nhận &amp; trả phòng để xem giá
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </ConfigProvider>
    );
}
