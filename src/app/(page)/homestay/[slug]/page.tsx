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
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/vi";
import locale from "antd/locale/vi_VN";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyImageGallery from "@/components/homestay/PropertyImageGallery";
import { PropertyDetail, PropertyDetailRoom } from "@/interfaces/property";
import { fetcher } from "@/utils/fetcher";

dayjs.extend(isBetween);
dayjs.locale("vi");

// ── blocked dates helper ─────────────────────────────────────────────
function isRoomAvailableByBlockedDates(
    room: PropertyDetailRoom,
    checkIn: Dayjs,
    checkOut: Dayjs
): boolean {
    if (!room.blockedDates || room.blockedDates.length === 0) return true;
    // Check if any blocked date falls within the selected range [checkIn, checkOut)
    return !room.blockedDates.some((dateStr) => {
        const d = dayjs(dateStr);
        return (d.isSame(checkIn, "day") || d.isAfter(checkIn, "day")) &&
            d.isBefore(checkOut, "day");
    });
}

// ── Data fetcher ─────────────────────────────────────────────────────
const getHomestayDetail = async (slug: string): Promise<PropertyDetail | null> => {
    try {
        const res = await fetcher.get(`/properties/${slug}`);
        const property = res.data?.data ?? res.data;
        if (!property) return null;
        return property as PropertyDetail;
    } catch (e) {
        console.error("Failed to fetch property detail:", e);
        return null;
    }
};

const getSimilarHomestays = async (province: string, currentSlug: string) => {
    try {
        const res = await fetcher.get(`/properties`, {
            params: { page: 1, size: 5, destination: province },
        });
        const data = res.data?.data ?? res.data;
        const items = data?.items || [];
        return items
            .filter((p: any) => p.slug !== currentSlug)
            .slice(0, 4)
            .map((p: any) => ({
                slug: p.slug,
                title: p.name,
                image: p.thumbnailUrl || "",
                distance: p.district || "",
                price: new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                }).format(p.pricePerNight),
            }));
    } catch (e) {
        return [];
    }
};

const { RangePicker } = DatePicker;

const highlightIcons: Record<string, React.ReactNode> = {
    wifi: <Wifi size={22} className="text-[#2DD4A8]" />,
    car: <Car size={22} className="text-[#2DD4A8]" />,
    calendar: <CalendarCheck size={22} className="text-[#2DD4A8]" />,
};

export default function HomestayDetailPage() {
    const params = useParams();
    const slug = params?.slug as string;

    // Read dates and selections from URL params (passed from search page or payment back link)
    const searchParams = useSearchParams();
    const urlCheckIn = searchParams.get("checkIn") || searchParams.get("checkin");
    const urlCheckOut = searchParams.get("checkOut") || searchParams.get("checkout");
    const urlRoomIds = searchParams.get("roomIds");
    const urlGuests = searchParams.get("guests");

    const [isFavorite, setIsFavorite] = useState(false);
    const [guests, setGuests] = useState(urlGuests ? parseInt(urlGuests, 10) : 2);
    
    // Parse roomIds from URL
    const initialRooms = useMemo(() => {
        if (!urlRoomIds) return new Set<number | string>();
        return new Set(urlRoomIds.split(",").map(id => isNaN(Number(id)) ? id : Number(id)));
    }, [urlRoomIds]);

    const [selectedRoomIds, setSelectedRoomIds] = useState<Set<number | string>>(initialRooms);
    const [mobileBookingRoomId, setMobileBookingRoomId] = useState<string | number | null>(null);

    const [dates, setDates] = useState<[Dayjs, Dayjs] | null>(
        urlCheckIn && urlCheckOut
            ? [dayjs(urlCheckIn), dayjs(urlCheckOut)]
            : null
    );

    const { data: property, isLoading: loadingDetail } = useQuery({
        queryKey: ["homestay-detail", slug],
        queryFn: () => getHomestayDetail(slug),
        enabled: !!slug,
    });

    const { data: similar, isLoading: loadingSimilar } = useQuery({
        queryKey: ["similar-homestays", property?.province, slug],
        queryFn: () => getSimilarHomestays(property?.province ?? "", slug),
        enabled: !!property?.province,
    });

    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [registerModalOpen, setRegisterModalOpen] = useState(false);

    // ── Derived state ────────────────────────────────────────────────
    const nights = dates ? dates[1].diff(dates[0], "day") : 0;

    const rooms = property?.rooms || [];
    const isEntirePlace = property?.rentalTypeSlug === "toan-bo-cho-o";

    // Images for gallery
    const images = useMemo(() => {
        if (property?.imageUrls && property.imageUrls.length > 0) return property.imageUrls;
        return [];
    }, [property?.imageUrls]);

    // Computed stats
    const totalMaxGuests = rooms.length > 0
        ? rooms.reduce((s, r) => s + r.maxGuests, 0)
        : property?.maxGuests || 2;
    const totalBeds = rooms.length > 0
        ? rooms.reduce((s, r) => s + r.numBeds, 0)
        : property?.numBeds || 1;
    const totalBathrooms = rooms.length > 0
        ? rooms.reduce((s, r) => s + (r.numBathrooms || 0), 0)
        : property?.numBathrooms || 1;

    const roomAvailability = useMemo(() => {
        const map = new Map<string | number, boolean>();
        rooms.forEach((room) => {
            if (dates) {
                map.set(room.id, isRoomAvailableByBlockedDates(room, dates[0], dates[1]));
            } else {
                map.set(room.id, true);
            }
        });
        return map;
    }, [rooms, dates]);

    // Auto-deselect rooms that become unavailable when dates change
    useEffect(() => {
        if (!dates) return;
        setSelectedRoomIds((prev) => {
            const next = new Set(prev);
            let hasChanges = false;
            prev.forEach((rid) => {
                if (!roomAvailability.get(rid)) {
                    next.delete(rid);
                    hasChanges = true;
                }
            });
            return hasChanges ? next : prev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomAvailability]);

    // For entire place, auto-select the single room
    const entirePlaceRoom = isEntirePlace && rooms.length > 0 ? rooms[0] : null;

    const selectedRooms = isEntirePlace
        ? (entirePlaceRoom ? [entirePlaceRoom] : [])
        : rooms.filter((r) => selectedRoomIds.has(r.id));
    const hasSelection = selectedRooms.length > 0;
    const pricePerNight = isEntirePlace
        ? (entirePlaceRoom?.pricePerNight || 0)
        : selectedRooms.reduce((s, r) => s + r.pricePerNight, 0);
    const maxGuestsLimit = isEntirePlace
        ? (entirePlaceRoom?.maxGuests || totalMaxGuests)
        : (selectedRooms.length > 0
            ? selectedRooms.reduce((s, r) => s + r.maxGuests, 0)
            : totalMaxGuests);

    // Auto-adjust guests if the limit changes (e.g., when unselecting a room or selecting a smaller room)
    useEffect(() => {
        if (guests > maxGuestsLimit && maxGuestsLimit > 0) {
            setGuests(maxGuestsLimit);
        }
    }, [maxGuestsLimit, guests]);

    // ── Calculate Price API ─────────────────────────────────────────────
    const calculatePricePayload = useMemo(() => {
        if (!dates || !hasSelection) return null;
        const roomIds = isEntirePlace ? null : Array.from(selectedRoomIds).map(Number);
        return {
            slug,
            checkInDate: dates[0].format("YYYY-MM-DD"),
            checkOutDate: dates[1].format("YYYY-MM-DD"),
            roomIds,
        };
    }, [dates, hasSelection, isEntirePlace, selectedRoomIds, slug]);

    const { data: calculatedPriceData, isLoading: isCalculatingPrice } = useQuery({
        queryKey: ["calculate-price", calculatePricePayload],
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

    // Derive totals from API response
    const apiTotal = useMemo(() => {
        if (!calculatedPriceData || !Array.isArray(calculatedPriceData)) return null;
        const totalFromApi = calculatedPriceData.reduce(
            (sum: number, item: any) => sum + (item.calculatedTotalPrice || 0),
            0
        );
        return totalFromApi;
    }, [calculatedPriceData]);

    // Fallback FE-side calculation (used while API is loading or unavailable)
    const cleaningFee = property?.cleaningFee ?? 0;
    const subtotalFallback = pricePerNight * nights;
    const totalFallback = subtotalFallback + cleaningFee;

    // Use API total when available, otherwise fallback
    const subtotal = apiTotal !== null ? apiTotal : subtotalFallback;
    const total = apiTotal !== null ? (apiTotal + cleaningFee) : totalFallback;

    const canBook = isEntirePlace ? (hasSelection && nights > 0) : (hasSelection && nights > 0);

    const handleToggleRoom = (roomId: string | number) => {
        if (!roomAvailability.get(roomId)) return;
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
        const availableIds = rooms.filter((r) => roomAvailability.get(r.id)).map((r) => r.id);
        setSelectedRoomIds(new Set(availableIds));
    };

    const handleDeselectAll = () => {
        setSelectedRoomIds(new Set());
    };

    const handleMobileBookClick = (roomId: string | number) => {
        if (!dates) {
            message.warning("Vui lòng chọn ngày nhận/trả phòng trước khi đặt!");
            const picker = document.getElementById("mobile-date-picker");
            if (picker) {
                picker.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }
        const room = rooms.find((r) => r.id === roomId);
        setGuests(room ? Math.min(2, room.maxGuests) : 1);
        setMobileBookingRoomId(roomId);
    };

    const disabledDate = (current: any) =>
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

    if (!property) return null;

    const address = [property.ward, property.district, property.province].filter(Boolean).join(", ");
    const ratingStr = property.ratingAvg?.toFixed(1) || "5.0";
    const subtitle = `${property.rentalTypeName || "Chỗ ở"} cho thuê bởi ${property.host?.fullName || "Chủ nhà"}`;
    const amenityNames = property.amenities ? property.amenities.map((a) => a.name) : ["Đang cập nhật"];

    const allRoomsSelected =
        rooms.length > 0 &&
        rooms.filter((r) => roomAvailability.get(r.id)).every((r) => selectedRoomIds.has(r.id));

    return (
        <ConfigProvider locale={locale}>
            <div className="min-h-screen bg-white">
                <Header />

                <main className="max-w-[1200px] mx-auto px-4 lg:px-6 py-6">
                    {/* ── Title ─────────────────────────────────────────── */}
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {property.name}
                        </h1>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1">
                                    <StarFilled className="text-yellow-400 text-sm" />
                                    <span className="font-semibold text-sm">{ratingStr}</span>
                                    <span className="text-gray-500 text-sm underline cursor-pointer">
                                        · {property.reviewCount || 0} đánh giá
                                    </span>
                                </div>
                                <Tag
                                    color="green"
                                    className="rounded-full border-0 bg-[#E6FAF5] text-[#2DD4A8] font-medium text-xs px-2"
                                >
                                    {property.categoryName || "Chỗ ở"}
                                </Tag>
                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                    <EnvironmentOutlined />
                                    <Link href={`https://maps.google.com/maps?q=${property.latitude},${property.longitude},&hl=vi&z=15`} target="_blank"><span className="underline cursor-pointer">{address}</span></Link>
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
                    <PropertyImageGallery images={images} title={property.name} />

                    {/* ── Body: Left content + Right booking card ─────── */}
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* LEFT */}
                        <div className="flex-1 min-w-0">
                            {/* Host info & quick stats */}
                            <div className="flex items-start justify-between mb-5 pb-6 border-b border-gray-200">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                        {subtitle}
                                    </h2>
                                    <div className="flex items-center gap-3 text-gray-500 text-sm flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {totalMaxGuests} khách
                                        </span>
                                        {!isEntirePlace && (
                                            <>
                                                <span>·</span>
                                                <span className="flex items-center gap-1">
                                                    <DoorOpen size={14} />
                                                    {rooms.length} phòng
                                                </span>
                                            </>
                                        )}
                                        {isEntirePlace && (
                                            <>
                                                {(property?.roomCount || entirePlaceRoom?.roomCount) && (
                                                    <>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <DoorOpen size={14} />
                                                            {property?.roomCount || entirePlaceRoom?.roomCount} phòng
                                                        </span>
                                                    </>
                                                )}
                                                {(entirePlaceRoom?.numBedrooms || property?.numBedrooms) && (
                                                    <>
                                                        <span>·</span>
                                                        <span className="flex items-center gap-1">
                                                            <DoorOpen size={14} />
                                                            {entirePlaceRoom?.numBedrooms || property?.numBedrooms} phòng ngủ
                                                        </span>
                                                    </>
                                                )}
                                            </>
                                        )}
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <BedDouble size={14} />
                                            {totalBeds} giường
                                        </span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <Bath size={14} />
                                            {totalBathrooms} phòng tắm
                                        </span>
                                    </div>
                                </div>
                                <Avatar
                                    src={property.host?.avatarUrl || "https://i.pravatar.cc/150"}
                                    size={52}
                                    className="border-2 border-[#2DD4A8] flex-shrink-0"
                                />
                            </div>

                            {/* Highlights */}
                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {highlightIcons.calendar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm m-0">
                                            Check-in / Check-out
                                        </p>
                                        <p className="text-gray-500 text-xs m-0">
                                            Nhận phòng: {property.checkInAfter || "14:00"} - {property.checkInBefore || "22:00"} · Trả phòng: {property.checkOutAfter || "06:00"} - {property.checkOutBefore || "12:00"}
                                        </p>
                                    </div>
                                </div>
                                {property.isInstantBook && (
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircleFilled className="text-[#2DD4A8] text-xl" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm m-0">
                                                Đặt phòng nhanh
                                            </p>
                                            <p className="text-gray-500 text-xs m-0">Xác nhận tức thì, không cần chờ chủ nhà duyệt.</p>
                                        </div>
                                    </div>
                                )}
                                {property.isSmokingAllowed !== undefined && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <span>{property.isSmokingAllowed ? "🚬 Cho phép hút thuốc" : "🚭 Không hút thuốc"}</span>
                                        <span>·</span>
                                        <span>{property.isPetsAllowed ? "🐾 Cho phép thú cưng" : "🚫 Không thú cưng"}</span>
                                        <span>·</span>
                                        <span>{property.isPartyAllowed ? "🎉 Cho phép tiệc" : "🔇 Không tiệc tùng"}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tabs */}
                            <Tabs
                                defaultActiveKey="0"
                                className="mb-6"
                                items={[
                                    {
                                        key: "0",
                                        label: "Về không gian này",
                                        children: (
                                            <div className="text-gray-600 text-sm leading-relaxed">
                                                {(property.description || "").split("\n\n").map((para, pi) => (
                                                    <p key={pi} className="mb-3">
                                                        {para}
                                                    </p>
                                                ))}
                                                {property.addressDetail && (
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        📍 Địa chỉ chi tiết: {property.addressDetail}
                                                    </p>
                                                )}
                                                <button className="flex items-center gap-1 font-semibold text-gray-900 text-sm mt-2 hover:underline">
                                                    Hiển thị thêm <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "1",
                                        label: "Vị trí",
                                        children: (
                                            <div className="py-2">
                                                <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                    <EnvironmentOutlined className="text-[#2DD4A8] text-lg" />
                                                    {address}
                                                </p>
                                                <div className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
                                                    <iframe
                                                        title={`Bản đồ của ${property.name}`}
                                                        width="100%"
                                                        height="100%"
                                                        style={{ border: 0 }}
                                                        loading="lazy"
                                                        allowFullScreen
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&hl=vi&z=15&output=embed`}
                                                    ></iframe>
                                                </div>
                                            </div>
                                        ),
                                    },
                                    {
                                        key: "2",
                                        label: "Tiện nghi",
                                        children: (
                                            <div className="py-2">
                                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                                    Tiện nghi có sẵn
                                                </h3>
                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                                                    {amenityNames.map((item, idx) => (
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
                                    },
                                    {
                                        key: "3",
                                        label: "Quy định chung",
                                        children: (
                                            <div className="text-gray-600 text-sm py-4 space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="bg-gray-50 rounded-xl p-4">
                                                        <p className="font-semibold text-gray-900 text-sm mb-2">Nhận phòng</p>
                                                        <p className="text-xs text-gray-500 m-0">Sau {property.checkInAfter || "14:00"} - Trước {property.checkInBefore || "22:00"}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-4">
                                                        <p className="font-semibold text-gray-900 text-sm mb-2">Trả phòng</p>
                                                        <p className="text-xs text-gray-500 m-0">Sau {property.checkOutAfter || "06:00"} - Trước {property.checkOutBefore || "12:00"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    <Tag color={property.isSmokingAllowed ? "green" : "red"}>
                                                        {property.isSmokingAllowed ? "✓ Hút thuốc" : "✗ Không hút thuốc"}
                                                    </Tag>
                                                    <Tag color={property.isPetsAllowed ? "green" : "red"}>
                                                        {property.isPetsAllowed ? "✓ Thú cưng" : "✗ Không thú cưng"}
                                                    </Tag>
                                                    <Tag color={property.isPartyAllowed ? "green" : "red"}>
                                                        {property.isPartyAllowed ? "✓ Tiệc tùng" : "✗ Không tiệc"}
                                                    </Tag>
                                                    <Tag color={property.isInstantBook ? "green" : "default"}>
                                                        {property.isInstantBook ? "⚡ Đặt nhanh" : "📋 Cần duyệt"}
                                                    </Tag>
                                                    {property.isPayAtCheckinAllowed && (
                                                        <Tag color="blue">💵 Thanh toán khi nhận phòng</Tag>
                                                    )}
                                                </div>
                                                {property.depositPercentage > 0 && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        💳 Đặt cọc tối thiểu: {property.depositPercentage}% tổng tiền
                                                    </p>
                                                )}
                                                {property.weekendSurchargePercentage > 0 && (
                                                    <p className="text-xs text-gray-500">
                                                        📅 Phụ thu cuối tuần: +{property.weekendSurchargePercentage}%
                                                    </p>
                                                )}
                                            </div>
                                        ),
                                    },
                                ]}
                            />
                            {/* ── Room Selection (Private Room / Shared) ──────────────────────────── */}
                            {!isEntirePlace && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Chọn phòng ({rooms.length} phòng)
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
                                                setDates([vals[0] as any, vals[1] as any]);
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
                                    {rooms.map((room) => {
                                        const available = roomAvailability.get(room.id) ?? true;
                                        const selected = selectedRoomIds.has(room.id);
                                        const roomImage = room.thumbnailUrl || images[0];
                                        const roomAmenities = room.amenities || [];

                                        return (
                                            <div
                                                key={room.id}
                                                onClick={() => {
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
                                                                {room.numBathrooms > 0 && (
                                                                    <>
                                                                        <span>·</span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Bath size={12} />
                                                                            {room.numBathrooms} phòng tắm
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-500 text-xs line-clamp-2 mb-2">
                                                                {room.description}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {room.cancellationPolicyResponse && (
                                                                    <span className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                                                                        {room.cancellationPolicyResponse.name}
                                                                    </span>
                                                                )}
                                                                {room.numBathrooms > 0 && (
                                                                    <span className="text-[10px] bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
                                                                        {room.numBathrooms} phòng tắm riêng
                                                                    </span>
                                                                )}
                                                                {roomAmenities.length > 0 && (
                                                                    <>
                                                                        {roomAmenities.map((amenity) => (
                                                                            <span
                                                                                key={String(amenity.id)}
                                                                                className="text-[10px] bg-[#E6FAF5] text-[#2DD4A8] rounded-full px-2 py-0.5 font-medium"
                                                                            >
                                                                                ✓ {amenity.name}
                                                                            </span>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0 flex flex-col items-end justify-between">
                                                            <div>
                                                                <div className={`font-bold text-base ${available ? "text-[#2DD4A8]" : "text-gray-400 line-through"}`}>
                                                                    {room.pricePerNight.toLocaleString("vi-VN")}đ
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
                            )}

                            {/* ── Entire Place: Mobile Date + Booking ──────── */}
                            {isEntirePlace && (
                                <div className="mb-8">
                                    {/* Mobile Date Picker for Entire Place */}
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
                                                    setDates([vals[0] as any, vals[1] as any]);
                                                } else {
                                                    setDates(null);
                                                }
                                            }}
                                        />
                                        {!dates ? (
                                            <p className="text-[11px] text-amber-600 mt-2 m-0 bg-amber-50 px-2 py-1 rounded-md inline-block">
                                                👆 Chọn ngày để đặt chỗ
                                            </p>
                                        ) : (
                                            <p className="text-xs text-[#2DD4A8] mt-2 font-medium m-0">
                                                ✓ {nights} đêm: {dates[0].format("DD/MM")} → {dates[1].format("DD/MM/YYYY")}
                                            </p>
                                        )}
                                    </div>

                                    {/* Mobile Booking Button for Entire Place */}
                                    <div className="lg:hidden">
                                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                                            <div className="flex items-baseline justify-between mb-3">
                                                <div>
                                                    <span className="text-xl font-bold text-gray-900">
                                                        {pricePerNight.toLocaleString("vi-VN")}đ
                                                    </span>
                                                    <span className="text-gray-500 text-sm"> / đêm</span>
                                                </div>
                                            </div>
                                            {canBook && dates ? (
                                                <Button
                                                    type="primary"
                                                    block
                                                    size="large"
                                                    onClick={() => {
                                                        if (!isLoggedIn) {
                                                            message.warning("Vui lòng đăng nhập để tiến hành đặt phòng.");
                                                            setLoginModalOpen(true);
                                                        } else {
                                                            router.push(`/payment/${property.slug}?checkin=${dates[0].format("YYYY-MM-DD")}&checkout=${dates[1].format("YYYY-MM-DD")}&guests=${guests}&roomIds=${entirePlaceRoom?.id}`);
                                                        }
                                                    }}
                                                    className="!rounded-xl !h-12 !text-base !font-semibold !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
                                                >
                                                    Đặt ngay
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="primary"
                                                    block
                                                    size="large"
                                                    disabled
                                                    className="!rounded-xl !h-12 !text-base !font-semibold"
                                                >
                                                    Chọn ngày để đặt
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            <div className="mb-8 pb-8 border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-6">
                                    <StarFilled className="text-yellow-400 text-lg" />
                                    <span className="text-xl font-bold">
                                        {ratingStr} · {property.reviewCount || 0} đánh giá
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400">Đánh giá sẽ được hiển thị khi có dữ liệu từ khách hàng.</p>
                                <button className="mt-4 border border-gray-900 rounded-xl px-5 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors">
                                    Hiển thị tất cả {property.reviewCount || 0} đánh giá
                                </button>
                            </div>

                            {/* Similar Homestays */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Nơi ở tương tự tại {property.province}
                                </h3>
                                {loadingSimilar ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <Skeleton key={i} active />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {similar?.map((s: any) => (
                                            <Link
                                                key={s.slug}
                                                href={`/homestay/${s.slug}`}
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
                            <div id="booking-section" className="sticky top-24 border border-gray-200 rounded-2xl p-6 shadow-lg">
                                {/* Price header */}
                                <div className="flex items-baseline justify-between mb-3">
                                    <div>
                                        {(isEntirePlace || hasSelection) ? (
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
                                        <span className="font-semibold">{ratingStr}</span>
                                        <span className="text-gray-400">
                                            · {property.reviewCount || 0} đánh giá
                                        </span>
                                    </div>
                                </div>

                                {/* Selection indicator */}
                                {isEntirePlace ? (
                                    <div className="mb-3 bg-[#E6FAF5] border border-[#2DD4A8] rounded-xl px-3 py-2">
                                        <span className="text-xs text-[#2DD4A8] font-semibold flex items-center gap-1">
                                            <CheckCircleFilled /> Toàn bộ chỗ ở
                                        </span>
                                    </div>
                                ) : hasSelection ? (
                                    <div className="mb-3 bg-[#E6FAF5] border border-[#2DD4A8] rounded-xl px-3 py-2">
                                        <span className="text-xs text-[#2DD4A8] font-semibold flex items-center gap-1">
                                            <CheckCircleFilled /> {selectedRooms.length} phòng đã chọn
                                        </span>
                                        <div className="mt-1 space-y-0.5">
                                            {selectedRooms.map((r) => (
                                                <p key={r.id} className="text-[10px] text-gray-500 m-0">
                                                    • {r.name} — {r.pricePerNight.toLocaleString("vi-VN")}đ/đêm
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
                                                setDates([vals[0] as any, vals[1] as any]);
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
                                {(canBook || (isEntirePlace && nights > 0)) && dates ? (
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                message.warning("Vui lòng đăng nhập để tiến hành đặt phòng.");
                                                setLoginModalOpen(true);
                                            } else {
                                                const roomIds = isEntirePlace ? entirePlaceRoom?.id : Array.from(selectedRoomIds).join(",");
                                                router.push(`/payment/${property.slug}?checkin=${dates[0].format("YYYY-MM-DD")}&checkout=${dates[1].format("YYYY-MM-DD")}&guests=${guests}&roomIds=${roomIds}`);
                                            }
                                        }}
                                        className="!rounded-xl !h-12 !text-base !font-semibold mb-3 !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
                                    >
                                        {isEntirePlace ? "Đặt ngay" : `Đặt ngay · ${selectedRooms.length} phòng`}
                                    </Button>
                                ) : (
                                    <Button
                                        type="primary"
                                        block
                                        size="large"
                                        disabled
                                        className="!rounded-xl !h-12 !text-base !font-semibold mb-3"
                                    >
                                        {isEntirePlace
                                            ? "Chọn ngày để đặt"
                                            : (!hasSelection
                                                ? "Chọn phòng để đặt"
                                                : "Chọn ngày để đặt")}
                                    </Button>
                                )}
                                {canBook && (
                                    <p className="text-center text-xs text-gray-400 mb-4">
                                        Bạn vẫn chưa bị tính tiền
                                    </p>
                                )}

                                {/* Price breakdown */}
                                {hasSelection && nights > 0 ? (
                                    isCalculatingPrice ? (
                                        <div className="space-y-2.5 animate-pulse">
                                            <div className="h-4 bg-gray-100 rounded w-full"></div>
                                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                                            <Divider className="!my-3" />
                                            <div className="h-5 bg-gray-100 rounded w-1/2 ml-auto"></div>
                                        </div>
                                    ) : (
                                    <div className="space-y-2.5">
                                        {/* Per-room breakdown from API */}
                                        {calculatedPriceData && Array.isArray(calculatedPriceData) ? (
                                            calculatedPriceData.map((roomPrice: any, idx: number) => {
                                                const roomInfo = rooms.find(r => r.id === roomPrice.roomId);
                                                const roomName = roomInfo?.name || `Phòng ${idx + 1}`;
                                                return (
                                                    <div key={roomPrice.roomId || idx} className="flex justify-between text-sm text-gray-600">
                                                        <span className="underline cursor-pointer">
                                                            {!isEntirePlace && calculatedPriceData.length > 1 ? `${roomName}: ` : ""}
                                                            {nights} đêm
                                                        </span>
                                                        <span>{roomPrice.calculatedTotalPrice.toLocaleString("vi-VN")}đ</span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span className="underline cursor-pointer">
                                                    {pricePerNight.toLocaleString("vi-VN")}đ × {nights} đêm
                                                </span>
                                                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span className="underline cursor-pointer">Phí vệ sinh</span>
                                            <span>{cleaningFee.toLocaleString("vi-VN")}đ</span>
                                        </div>

                                        <Divider className="!my-3" />
                                        <div className="flex justify-between font-bold text-gray-900 text-sm">
                                            <span>Tổng cộng</span>
                                            <span className="text-[#2DD4A8] text-base">
                                                {total.toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>
                                        {property?.isPayAtCheckinAllowed && property.depositPercentage > 0 && (
                                            <div className="mt-2 text-[11px] text-gray-500 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                                                <div className="flex justify-between font-medium text-amber-700 mb-1">
                                                    <span>Yêu cầu thanh toán cọc ({property.depositPercentage}%):</span>
                                                    <span>{Math.round((total * property.depositPercentage) / 100).toLocaleString("vi-VN")}đ</span>
                                                </div>
                                                <div className="flex justify-between text-amber-600/80">
                                                    <span>Số tiền còn lại trả khi nhận phòng:</span>
                                                    <span>{(total - Math.round((total * property.depositPercentage) / 100)).toLocaleString("vi-VN")}đ</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    )
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
                    className="lg:hidden"
                    styles={{
                        body: { paddingBottom: 24, paddingTop: 16 },
                    }}
                >
                    {(() => {
                        const room = rooms.find(r => r.id === mobileBookingRoomId);
                        if (!room || !dates) return null;

                        const roomNights = dates[1].diff(dates[0], "day");
                        // Try to get API-calculated price for this specific room
                        const mobileRoomPrice = calculatedPriceData && Array.isArray(calculatedPriceData)
                            ? calculatedPriceData.find((p: any) => p.roomId === room.id)
                            : null;
                        const roomSubtotal = mobileRoomPrice?.calculatedTotalPrice ?? (room.pricePerNight * roomNights);
                        const roomTotal = roomSubtotal + cleaningFee;

                        return (
                            <div>
                                {/* Room Summary */}
                                <div className="flex gap-4 items-center mb-6 border-b border-gray-100 pb-4">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                        <img src={room.thumbnailUrl || images[0]} alt={room.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{room.name}</h4>
                                        <p className="text-xs text-gray-500 mb-0">Tối đa {room.maxGuests} khách · {room.numBeds} giường</p>
                                        <p className="text-sm font-bold text-[#2DD4A8] mt-1 mb-0">{room.pricePerNight.toLocaleString("vi-VN")}đ <span className="text-[10px] text-gray-400 font-normal">/đêm</span></p>
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
                                        <span>Tiền phòng ({roomNights} đêm)</span>
                                        <span>{roomSubtotal.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Phí vệ sinh</span>
                                        <span>{cleaningFee.toLocaleString("vi-VN")}đ</span>
                                    </div>

                                    <Divider className="!my-3" />
                                    <div className="flex justify-between font-bold text-gray-900 text-base">
                                        <span>Tổng thanh toán</span>
                                        <span className="text-[#2DD4A8] text-lg">{roomTotal.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    {property?.isPayAtCheckinAllowed && property.depositPercentage > 0 && (
                                        <div className="mt-2 text-xs text-gray-500 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                            <div className="flex justify-between font-medium text-amber-700 mb-1.5">
                                                <span>Yêu cầu thanh toán cọc ({property.depositPercentage}%):</span>
                                                <span>{Math.round((roomTotal * property.depositPercentage) / 100).toLocaleString("vi-VN")}đ</span>
                                            </div>
                                            <div className="flex justify-between text-amber-600/80">
                                                <span>Số tiền còn lại trả khi nhận phòng:</span>
                                                <span>{(roomTotal - Math.round((roomTotal * property.depositPercentage) / 100)).toLocaleString("vi-VN")}đ</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action */}
                                <Button
                                    type="primary"
                                    block
                                    size="large"
                                    onClick={() => {
                                        setMobileBookingRoomId(null);
                                        if (!isLoggedIn) {
                                            message.warning("Vui lòng đăng nhập để tiến hành đặt phòng.");
                                            setLoginModalOpen(true);
                                        } else {
                                            router.push(`/payment/${property.slug}?checkin=${dates[0].format("YYYY-MM-DD")}&checkout=${dates[1].format("YYYY-MM-DD")}&guests=${guests}&roomIds=${room.id}`);
                                        }
                                    }}
                                    className="!rounded-xl !h-14 !text-base !font-semibold !bg-[#2DD4A8] !border-[#2DD4A8] hover:!bg-[#25bc95]"
                                >
                                    Xác nhận đặt · {roomTotal.toLocaleString("vi-VN")}đ
                                </Button>
                            </div>
                        );
                    })()}
                </Drawer>

                <LoginModal
                    open={loginModalOpen}
                    onClose={() => setLoginModalOpen(false)}
                    onSwitchToRegister={() => {
                        setLoginModalOpen(false);
                        setRegisterModalOpen(true);
                    }}
                />
                <RegisterModal
                    open={registerModalOpen}
                    onClose={() => setRegisterModalOpen(false)}
                    onSwitchToLogin={() => {
                        setRegisterModalOpen(false);
                        setLoginModalOpen(true);
                    }}
                />
            </div>
        </ConfigProvider>
    );
}
