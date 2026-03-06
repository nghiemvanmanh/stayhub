"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
    Drawer,
    message,
} from "antd";
import {
    ShareAltOutlined,
    HeartOutlined,
    HeartFilled,
    StarFilled,
    EnvironmentOutlined,
    HomeOutlined,
    MinusOutlined,
    PlusOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    InfoCircleOutlined,
} from "@ant-design/icons";
import {
    Wifi,
    Car,
    CalendarCheck,
    BedDouble,
    Bath,
    Users,
    ChevronRight,
    DoorOpen,
} from "lucide-react";
import Link from "next/link";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/vi";
import locale from "antd/locale/vi_VN";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyImageGallery from "@/components/homestay/PropertyImageGallery";
import {
    mockProperties,
    mockPropertyImages,
    mockProfiles,
    mockReviews,
    mockAmenities,
    mockPropertyAmenities,
    mockRooms,
    mockReserves,
} from "@/data";
import { Room } from "@/interfaces/room";
import { Reserve } from "@/interfaces/reserve";
import { BookingStatus } from "@/interfaces/enums";

dayjs.extend(isBetween);
dayjs.locale("vi");

// ── Availability helper ──────────────────────────────────────────────
// A reserve blocks a room if its date range overlaps AND status is active
const BLOCKING_STATUSES: BookingStatus[] = [
    BookingStatus.CONFIRMED,
    BookingStatus.CHECKED_IN,
    BookingStatus.PENDING,
    BookingStatus.AWAITING_PAYMENT,
    BookingStatus.PARTIALLY_PAID,
];

function isRoomAvailable(
    roomId: string | number,
    checkIn: Dayjs,
    checkOut: Dayjs,
    reserves: Reserve[]
): boolean {
    return !reserves.some((r) => {
        if (r.roomId !== roomId) return false;
        if (!BLOCKING_STATUSES.includes(r.status)) return false;
        const rStart = dayjs(r.startDate);
        const rEnd = dayjs(r.endDate);
        // Overlap: NOT (checkOut <= rStart OR checkIn >= rEnd)
        return !(checkOut.isSame(rStart, "day") || checkOut.isBefore(rStart, "day") || checkIn.isSame(rEnd, "day") || checkIn.isAfter(rEnd, "day"));
    });
}

// ── Data fetcher ─────────────────────────────────────────────────────
const getHomestayDetail = async (id: string) => {
    await new Promise((res) => setTimeout(res, 500));
    const property = mockProperties.find((p) => String(p.id) === id);
    if (!property) return null;

    const images = mockPropertyImages
        .filter((img) => img.propertyId === property.id)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const hostProfile = mockProfiles.find((p) => p.userId === property.hostId);

    const propertyAmenitiesIds = mockPropertyAmenities
        .filter((pa) => pa.propertyId === property.id)
        .map((pa) => pa.amenityId);
    const amenities =
        mockAmenities
            .filter((a) => propertyAmenitiesIds.includes(a.id))
            .map((a) => a.name) || ["Đang cập nhật"];

    const reviews = mockReviews
        .filter((r) => r.propertyId === property.id)
        .map((r) => ({
            id: String(r.id),
            name:
                mockProfiles.find((p) => p.userId === r.userId)?.fullName || "Guest",
            avatar:
                mockProfiles.find((p) => p.userId === r.userId)?.avatarUrl ||
                "https://i.pravatar.cc/150",
            date: r.createdAt ? dayjs(r.createdAt).format("DD/MM/YYYY") : "",
            comment: r.comment || "",
        }));

    // ── Rooms & reserves for this property ──
    const rooms: Room[] = mockRooms.filter(
        (r) => r.propertyId === property.id && r.isActive
    );
    const reserves: Reserve[] = mockReserves.filter(
        (r) => r.propertyId === property.id
    );

    const totalMaxGuests = rooms.reduce((s, r) => s + r.maxGuests, 0) || property.maxGuests;
    const totalBeds = rooms.reduce((s, r) => s + r.numBeds, 0) || property.numBeds || 1;
    const totalBathrooms = rooms.reduce((s, r) => s + (r.numBathrooms || 0), 0) || property.numBathrooms || 1;

    return {
        id: String(property.id),
        title: property.name,
        subtitle: `Toàn bộ ${property.rentalType === "ENTIRE_PLACE" ? "biệt thự/nhà" : "phòng"} cho thuê bởi ${hostProfile?.fullName || "Host"}`,
        rating: property.ratingAvg?.toFixed(1) || "5.0",
        reviewCount: property.reviewCount || 0,
        badge: "Chủ nhà siêu cấp",
        address: `${property.ward}, ${property.district}, ${property.province}`,
        city: property.province,
        images:
            images.length > 0
                ? images.map((i) => i.url)
                : [
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
                ],
        hostName: hostProfile?.fullName || "Host",
        hostAvatar: hostProfile?.avatarUrl || "https://i.pravatar.cc/150",
        maxGuests: totalMaxGuests,
        bedrooms: rooms.length || property.numBedrooms || 1,
        beds: totalBeds,
        bathrooms: totalBathrooms,
        description: property.description || "",
        pricePerNight: property.pricePerNight,
        cleaningFee: property.cleaningFee || 0,
        serviceFeeRate: 0.1,
        highlights: [
            {
                icon: "wifi",
                title: "Wi-fi nhanh",
                description: "Băng thông 100Mbps đáp ứng làm việc từ xa.",
            },
            {
                icon: "calendar",
                title: "Hủy miễn phí",
                description: "Hủy miễn phí trước 24H so với giờ nhận phòng.",
            },
        ],
        latitude: property.latitude,
        longitude: property.longitude,
        amenities,
        tabs: ["Về không gian này", "Vị trí", "Tiện nghi", "Quy định chung"],
        reviews,
        rooms,
        reserves,
    };
};

const getSimilarHomestays = async (province: string, currentId: string) => {
    await new Promise((res) => setTimeout(res, 500));
    return mockProperties
        .filter((p) => p.province === province && String(p.id) !== currentId)
        .map((p) => {
            const thumb =
                mockPropertyImages.find(
                    (img) => img.propertyId === p.id && img.isThumbnail
                )?.url ||
                "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80";
            return {
                id: String(p.id),
                title: p.name,
                image: thumb,
                distance: `${p.district}`,
                price: `${new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: p.currency || "VND",
                }).format(p.pricePerNight)}`,
            };
        });
};

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
    const [guests, setGuests] = useState(2);
    const [selectedRoomIds, setSelectedRoomIds] = useState<Set<number | string>>(new Set());
    const [mobileBookingRoomId, setMobileBookingRoomId] = useState<string | number | null>(null);

    // Read dates from URL params (passed from search page)
    const searchParams = useSearchParams();
    const urlCheckIn = searchParams.get("checkIn");
    const urlCheckOut = searchParams.get("checkOut");

    const [dates, setDates] = useState<[Dayjs, Dayjs] | null>(
        urlCheckIn && urlCheckOut
            ? [dayjs(urlCheckIn), dayjs(urlCheckOut)]
            : null
    );

    const { data: detail, isLoading: loadingDetail } = useQuery({
        queryKey: ["homestay-detail", id],
        queryFn: () => getHomestayDetail(id),
    });

    const { data: similar, isLoading: loadingSimilar } = useQuery({
        queryKey: ["similar-homestays", detail?.city, id],
        queryFn: () => getSimilarHomestays(detail?.city ?? "", id),
        enabled: !!detail?.city,
    });

    // ── Derived state ────────────────────────────────────────────────
    const nights = dates ? dates[1].diff(dates[0], "day") : 0;

    const roomAvailability = useMemo(() => {
        if (!detail?.rooms || !detail?.reserves) return new Map<string | number, boolean>();
        const map = new Map<string | number, boolean>();
        detail.rooms.forEach((room) => {
            if (dates) {
                map.set(room.id, isRoomAvailable(room.id, dates[0], dates[1], detail.reserves));
            } else {
                map.set(room.id, true); // no dates selected → show as available
            }
        });
        return map;
    }, [detail?.rooms, detail?.reserves, dates]);

    // Auto-deselect rooms that become unavailable when dates change
    useMemo(() => {
        if (!dates) return;
        setSelectedRoomIds((prev) => {
            const next = new Set(prev);
            prev.forEach((rid) => {
                if (!roomAvailability.get(rid)) next.delete(rid);
            });
            return next;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomAvailability]);

    const selectedRooms = detail?.rooms?.filter((r) => selectedRoomIds.has(r.id)) || [];
    const hasSelection = selectedRooms.length > 0;
    const pricePerNight = selectedRooms.reduce((s, r) => s + r.basePricePerNight, 0);
    const maxGuestsLimit = selectedRooms.length > 0
        ? selectedRooms.reduce((s, r) => s + r.maxGuests, 0)
        : (detail?.maxGuests ?? 1);
    const subtotal = pricePerNight * nights;
    const cleaningFee = detail?.cleaningFee ?? 0;
    const serviceFee = Math.round(pricePerNight * (detail?.serviceFeeRate ?? 0.1)) * nights;
    const total = subtotal + cleaningFee + serviceFee;
    const canBook = hasSelection && nights > 0;

    const handleToggleRoom = (roomId: string | number) => {
        if (!roomAvailability.get(roomId)) return; // can't select unavailable rooms
        setSelectedRoomIds((prev) => {
            const next = new Set(prev);
            if (next.has(roomId)) {
                next.delete(roomId);
            } else {
                next.add(roomId);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (!detail?.rooms) return;
        const availableIds = detail.rooms.filter((r) => roomAvailability.get(r.id)).map((r) => r.id);
        setSelectedRoomIds(new Set(availableIds));
    };

    const handleDeselectAll = () => {
        setSelectedRoomIds(new Set());
    };

    const handleMobileBookClick = (roomId: string | number) => {
        if (!dates) {
            message.warning("Vui lòng chọn ngày nhận/trả phòng trước khi đặt!");
            // Optional: scroll to mobile picker
            const picker = document.getElementById("mobile-date-picker");
            if (picker) {
              picker.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }
        // Set guest count to 1 by default for this room, capped at room max
        const room = detail?.rooms.find((r) => r.id === roomId);
        setGuests(room ? Math.min(2, room.maxGuests) : 1);
        setMobileBookingRoomId(roomId);
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

    const allRoomsSelected =
        detail.rooms.length > 0 &&
        detail.rooms.filter((r) => roomAvailability.get(r.id)).every((r) => selectedRoomIds.has(r.id));

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
                    <PropertyImageGallery images={detail.images} title={detail.title} />

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
                                            <DoorOpen size={14} />
                                            {detail.rooms.length} phòng
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
                                items={detail.tabs.map((tab, i) => {
                                    if (tab === "Về không gian này") {
                                        return {
                                            key: String(i),
                                            label: tab,
                                            children: (
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
                                            ),
                                        };
                                    }
                                    if (tab === "Vị trí") {
                                        return {
                                            key: String(i),
                                            label: tab,
                                            children: (
                                                <div className="py-2">
                                                    <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                        <EnvironmentOutlined className="text-[#2DD4A8] text-lg" />
                                                        {detail.address}
                                                    </p>
                                                    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
                                                        <iframe
                                                            title={`Bản đồ của ${detail.title}`}
                                                            width="100%"
                                                            height="100%"
                                                            style={{ border: 0 }}
                                                            loading="lazy"
                                                            allowFullScreen
                                                            referrerPolicy="no-referrer-when-downgrade"
                                                            src={`https://maps.google.com/maps?q=${detail.latitude},${detail.longitude}&hl=vi&z=15&output=embed`}
                                                        ></iframe>
                                                    </div>
                                                </div>
                                            ),
                                        };
                                    }
                                    if (tab === "Tiện nghi") {
                                        return {
                                            key: String(i),
                                            label: tab,
                                            children: (
                                                <div className="py-2">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                                                        Tiện nghi có sẵn
                                                    </h3>
                                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                                                        {detail.amenities.map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center gap-2 text-gray-700"
                                                            >
                                                                <CheckCircleFilled className="text-[#2DD4A8] text-sm" />
                                                                <span className="text-sm font-medium">
                                                                    {item}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ),
                                        };
                                    }
                                    return {
                                        key: String(i),
                                        label: tab,
                                        children: (
                                            <div className="text-gray-500 text-sm py-4">
                                                Nội dung đang được cập nhật...
                                            </div>
                                        ),
                                    };
                                })}
                            />

                            {/* ── Room Selection ──────────────────────────── */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Chọn phòng ({detail.rooms.length} phòng)
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {allRoomsSelected ? (
                                            <button
                                                onClick={handleDeselectAll}
                                                className="text-xs text-gray-500 hover:text-gray-700 underline"
                                            >
                                                Bỏ chọn tất cả
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleSelectAll}
                                                className="text-xs text-[#2DD4A8] hover:text-[#25bc95] underline font-medium"
                                            >
                                                Chọn tất cả phòng trống
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Date Picker (Hidden on lg) */}
                                <div id="mobile-date-picker" className="lg:hidden mb-6 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
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
                                    {!dates ? (
                                        <p className="text-[11px] text-amber-600 mt-2 m-0 bg-amber-50 px-2 py-1 rounded-md inline-block">
                                            👆 Chọn ngày để xem tình trạng phòng
                                        </p>
                                    ) : (
                                        <p className="text-xs text-[#2DD4A8] mt-2 font-medium m-0">
                                            ✓ {nights} đêm: {dates[0].format("DD/MM")} → {dates[1].format("DD/MM/YYYY")}
                                        </p>
                                    )}
                                </div>

                                {!dates && (
                                    <div className="hidden lg:flex mb-4 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl items-center gap-2">
                                        <InfoCircleOutlined className="text-blue-500" />
                                        <p className="text-xs text-blue-600 m-0">
                                            Chọn ngày nhận &amp; trả phòng ở bên phải để xem tình trạng phòng trống.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {detail.rooms.map((room) => {
                                        const available = roomAvailability.get(room.id) ?? true;
                                        const selected = selectedRoomIds.has(room.id);
                                        const roomImage =
                                            room.images?.[0] ||
                                            detail.images[0];

                                        return (
                                            <div
                                                key={room.id}
                                                // On desktop, clicking the card toggles selection. On mobile, we rely on the Book button.
                                                onClick={() => {
                                                    // Only toggle on desktop (where the booking card is visible)
                                                    if (window.innerWidth >= 1024) {
                                                        handleToggleRoom(room.id);
                                                    }
                                                }}
                                                className={`flex flex-col sm:flex-row gap-4 p-4 border-2 rounded-2xl transition-all ${available
                                                    ? "cursor-default lg:cursor-pointer"
                                                    : "cursor-not-allowed opacity-60"
                                                    } ${selected
                                                        ? "border-[#2DD4A8] shadow-md bg-[#F0FDFB]"
                                                        : available
                                                            ? "border-gray-200 hover:border-gray-300 lg:hover:border-[#2DD4A8] lg:hover:shadow-md"
                                                            : "border-red-200 bg-red-50/30"
                                                    }`}
                                            >
                                                <div className="w-full sm:w-32 h-40 sm:h-24 flex-shrink-0 rounded-xl overflow-hidden relative">
                                                    <img
                                                        src={roomImage}
                                                        alt={room.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {dates && (
                                                        <div
                                                            className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${available
                                                                ? "bg-green-500 text-white"
                                                                : "bg-red-500 text-white"
                                                                }`}
                                                        >
                                                            {available ? "Còn trống" : "Đã đặt"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 text-base mb-1">
                                                                {room.name}
                                                            </h4>
                                                            <div className="flex items-center gap-3 text-gray-500 text-xs mb-1.5 flex-wrap">
                                                                <span className="flex items-center gap-1">
                                                                    <Users size={12} />
                                                                    Tối đa {room.maxGuests} khách
                                                                </span>
                                                                <span>·</span>
                                                                <span className="flex items-center gap-1">
                                                                    <BedDouble size={12} />
                                                                    {room.numBeds} giường
                                                                </span>
                                                                {room.area && (
                                                                    <>
                                                                        <span>·</span>
                                                                        <span>{room.area}m²</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                                                                {room.description}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                <span className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                                                                    {room.type}
                                                                </span>
                                                                {room.numBathrooms ? (
                                                                    <span className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                                                                        {room.numBathrooms} phòng tắm riêng
                                                                    </span>
                                                                ) : null}
                                                                {/* Amenity tags resolved from amenityIds */}
                                                                {room.amenityIds && room.amenityIds.length > 0 && (
                                                                    <>
                                                                        {room.amenityIds.map((aid) => {
                                                                            const amenity = mockAmenities.find((a) => a.id === aid);
                                                                            if (!amenity) return null;
                                                                            return (
                                                                                <span
                                                                                    key={String(aid)}
                                                                                    className="text-[10px] bg-[#E6FAF5] text-[#2DD4A8] rounded-full px-2 py-0.5 font-medium"
                                                                                >
                                                                                    ✓ {amenity.name}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0 flex flex-col items-end justify-between">
                                                            <div>
                                                                <div className={`font-bold text-base ${available ? "text-[#2DD4A8]" : "text-gray-400 line-through"}`}>
                                                                    {room.basePricePerNight.toLocaleString("vi-VN")}đ
                                                                </div>
                                                                <div className="text-[10px] text-gray-400">/đêm</div>
                                                                {/* Desktop Selected status */}
                                                                <div className="hidden lg:block mt-1.5">
                                                                    {selected && (
                                                                        <div className="flex items-center justify-end gap-1 text-[#2DD4A8] text-xs font-semibold">
                                                                            <CheckCircleFilled /> Đang chọn
                                                                        </div>
                                                                    )}
                                                                    {!available && dates && (
                                                                        <div className="flex items-center justify-end gap-1 text-red-400 text-xs font-semibold">
                                                                            <CloseCircleFilled /> Đã đặt
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Mobile Book Button */}
                                                            <div className="lg:hidden mt-4 lg:mt-0 w-full lg:w-auto">
                                                                <Button 
                                                                    type="primary" 
                                                                    size="middle"
                                                                    disabled={!available}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMobileBookClick(room.id);
                                                                    }}
                                                                    className={`w-full !rounded-lg !font-semibold ${available ? "!bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]" : ""}`}
                                                                >
                                                                    {!available ? "Đã đặt" : "Đặt phòng"}
                                                                </Button>
                                                            </div>
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

                        {/* RIGHT – Booking Card (Desktop Only) */}
                        <div className="hidden lg:block w-[380px] flex-shrink-0">
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
                                {hasSelection ? (
                                    <div className="mb-3 bg-[#E6FAF5] border border-[#2DD4A8] rounded-xl px-3 py-2">
                                        <span className="text-xs text-[#2DD4A8] font-semibold flex items-center gap-1">
                                            <CheckCircleFilled /> {selectedRooms.length} phòng đã chọn
                                        </span>
                                        <div className="mt-1 space-y-0.5">
                                            {selectedRooms.map((r) => (
                                                <p key={r.id} className="text-[10px] text-gray-500 m-0">
                                                    • {r.name} — {r.basePricePerNight.toLocaleString("vi-VN")}đ/đêm
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                                        <p className="text-xs text-amber-600 m-0">
                                            👆 Vui lòng chọn phòng bên trái để tiếp tục đặt
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
                                            ✓ {nights} đêm: {dates[0].format("DD/MM")} →{" "}
                                            {dates[1].format("DD/MM/YYYY")}
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
                                        <span className="text-sm font-semibold w-4 text-center">
                                            {guests}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setGuests((g) => Math.min(maxGuestsLimit, g + 1))
                                            }
                                            disabled={guests >= maxGuestsLimit}
                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#2DD4A8] hover:text-[#2DD4A8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <PlusOutlined style={{ fontSize: 10 }} />
                                        </button>
                                    </div>
                                </div>

                                {/* CTA */}
                                {canBook && dates ? (
                                    <Link
                                        href={`/payment/${id}?checkin=${dates[0].format("YYYY-MM-DD")}&checkout=${dates[1].format("YYYY-MM-DD")}&guests=${guests}&roomIds=${Array.from(selectedRoomIds).join(",")}`}
                                    >
                                        <Button
                                            type="primary"
                                            block
                                            size="large"
                                            className="!rounded-xl !h-12 !text-base !font-semibold mb-3 !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
                                        >
                                            Đặt ngay · {selectedRooms.length} phòng
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        disabled
                                        className="!rounded-xl !h-12 !text-base !font-semibold mb-3"
                                    >
                                        {!hasSelection
                                            ? "Chọn phòng để đặt"
                                            : "Chọn ngày để đặt"}
                                    </Button>
                                )}
                                {canBook && (
                                    <p className="text-center text-xs text-gray-400 mb-4">
                                        Bạn vẫn chưa bị tính tiền
                                    </p>
                                )}

                                {/* Price breakdown */}
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
                                                Phí dịch vụ StayHub
                                            </span>
                                            <span>{serviceFee.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                        <Divider className="!my-3" />
                                        <div className="flex justify-between font-bold text-gray-900 text-sm">
                                            <span>Tổng cộng</span>
                                            <span className="text-[#2DD4A8] text-base">
                                                {total.toLocaleString("vi-VN")}đ
                                            </span>
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
                
                {/* ── Mobile Booking Drawer ── */}
                <Drawer
                    title={
                        <div className="text-base font-bold text-gray-900">
                            Hoàn tất đặt phòng
                        </div>
                    }
                    placement="bottom"
                    open={mobileBookingRoomId !== null}
                    onClose={() => setMobileBookingRoomId(null)}
                    height="auto"
                    className="lg:hidden"
                    styles={{
                        body: { paddingBottom: 24, paddingTop: 16 },
                    }}
                >
                    {(() => {
                        const room = detail.rooms.find(r => r.id === mobileBookingRoomId);
                        if (!room || !dates) return null;
                        
                        const roomNights = dates[1].diff(dates[0], "day");
                        const roomSubtotal = room.basePricePerNight * roomNights;
                        const roomServiceFee = Math.round(room.basePricePerNight * (detail.serviceFeeRate ?? 0.1)) * roomNights;
                        const roomTotal = roomSubtotal + cleaningFee + roomServiceFee;
                        
                        return (
                            <div>
                                {/* Room Summary */}
                                <div className="flex gap-4 items-center mb-6 border-b border-gray-100 pb-4">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                        <img src={room.images?.[0] || detail.images[0]} alt={room.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{room.name}</h4>
                                        <p className="text-xs text-gray-500 mb-0">{room.type} • Tối đa {room.maxGuests} khách</p>
                                        <p className="text-sm font-bold text-[#2DD4A8] mt-1 mb-0">{room.basePricePerNight.toLocaleString("vi-VN")}đ <span className="text-[10px] text-gray-400 font-normal">/đêm</span></p>
                                    </div>
                                </div>
                                
                                {/* Date Summary */}
                                <div className="bg-gray-50 p-3 rounded-xl mb-4 text-sm flex justify-between items-center">
                                    <span className="text-gray-600">Thời gian (<b>{roomNights}</b> đêm)</span>
                                    <span className="font-semibold text-gray-900">{dates[0].format("DD/MM")} → {dates[1].format("DD/MM")}</span>
                                </div>

                                {/* Guest Selection */}
                                <div className="border border-gray-200 rounded-xl p-3 mb-6 flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm m-0">Số khách</p>
                                        <p className="text-xs text-gray-400 m-0">Tối đa {room.maxGuests} khách</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setGuests((g) => Math.max(1, g - 1))}
                                            disabled={guests <= 1}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#2DD4A8] hover:text-[#2DD4A8] transition-colors disabled:opacity-40 disabled:bg-gray-50"
                                        >
                                            <MinusOutlined style={{ fontSize: 12 }} />
                                        </button>
                                        <span className="text-base font-semibold w-4 text-center">{guests}</span>
                                        <button
                                            onClick={() => setGuests((g) => Math.min(room.maxGuests, g + 1))}
                                            disabled={guests >= room.maxGuests}
                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-[#2DD4A8] hover:text-[#2DD4A8] transition-colors disabled:opacity-40 disabled:bg-gray-50"
                                        >
                                            <PlusOutlined style={{ fontSize: 12 }} />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Price Breakdown */}
                                <div className="space-y-2 mb-6 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>{room.basePricePerNight.toLocaleString("vi-VN")}đ × {roomNights} đêm</span>
                                        <span>{roomSubtotal.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Phí vệ sinh</span>
                                        <span>{cleaningFee.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Phí dịch vụ</span>
                                        <span>{roomServiceFee.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <Divider className="!my-3" />
                                    <div className="flex justify-between font-bold text-gray-900 text-base">
                                        <span>Tổng thanh toán</span>
                                        <span className="text-[#2DD4A8] text-lg">{roomTotal.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                </div>
                                
                                {/* Action */}
                                <Link
                                    href={`/payment/${id}?checkin=${dates[0].format("YYYY-MM-DD")}&checkout=${dates[1].format("YYYY-MM-DD")}&guests=${guests}&roomIds=${room.id}`}
                                    onClick={() => setMobileBookingRoomId(null)}
                                >
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        className="!rounded-xl !h-14 !text-base !font-semibold !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
                                    >
                                        Xác nhận đặt · {roomTotal.toLocaleString("vi-VN")}đ
                                    </Button>
                                </Link>
                            </div>
                        );
                    })()}
                </Drawer>
            </div>
        </ConfigProvider>
    );
}
