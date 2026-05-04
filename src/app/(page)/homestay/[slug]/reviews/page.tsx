"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    Avatar,
    Rate,
    Pagination,
    Skeleton,
    Select,
    Image,
    Empty,
} from "antd";
import {
    StarFilled,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PropertyDetail } from "@/interfaces/property";
import { PropertyReview } from "@/interfaces/review";
import { fetcher } from "@/utils/fetcher";

dayjs.locale("vi");

const PAGE_SIZE = 6;

const RATING_FILTER_OPTIONS = [
    { value: 0, label: "Tất cả" },
    { value: 5, label: "5 sao" },
    { value: 4, label: "4 sao" },
    { value: 3, label: "3 sao" },
    { value: 2, label: "2 sao" },
    { value: 1, label: "1 sao" },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "oldest", label: "Cũ nhất" },
    { value: "highest", label: "Điểm cao nhất" },
    { value: "lowest", label: "Điểm thấp nhất" },
];

export default function AllReviewsPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [currentPage, setCurrentPage] = useState(1);
    const [ratingFilter, setRatingFilter] = useState(0);
    const [sortBy, setSortBy] = useState("newest");

    const { data: property, isLoading } = useQuery<PropertyDetail | null>({
        queryKey: ["homestay-detail", slug],
        queryFn: async () => {
            const res = await fetcher.get(`/properties/${slug}`);
            const data = res.data?.data ?? res.data;
            return data as PropertyDetail;
        },
        enabled: !!slug,
    });

    const filteredAndSortedReviews = useMemo(() => {
        if (!property?.reviews) return [];
        let reviews = [...property.reviews];

        // Filter by rating
        if (ratingFilter > 0) {
            reviews = reviews.filter((r) => r.rating === ratingFilter);
        }

        // Sort
        switch (sortBy) {
            case "oldest":
                reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case "highest":
                reviews.sort((a, b) => b.rating - a.rating);
                break;
            case "lowest":
                reviews.sort((a, b) => a.rating - b.rating);
                break;
            case "newest":
            default:
                reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return reviews;
    }, [property?.reviews, ratingFilter, sortBy]);

    const paginatedReviews = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredAndSortedReviews.slice(start, start + PAGE_SIZE);
    }, [filteredAndSortedReviews, currentPage]);

    // Rating distribution for the breakdown bar
    const ratingDistribution = useMemo(() => {
        if (!property?.reviews || property.reviews.length === 0) return [];
        const counts = [0, 0, 0, 0, 0]; // index 0 = 1 star, index 4 = 5 star
        property.reviews.forEach((r) => {
            if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
        });
        const total = property.reviews.length;
        return [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: counts[star - 1],
            percent: total > 0 ? Math.round((counts[star - 1] / total) * 100) : 0,
        }));
    }, [property?.reviews]);

    const ratingStr = property?.ratingAvg?.toFixed(1) || "0.0";

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <Skeleton active paragraph={{ rows: 8 }} />
                </div>
                <Footer />
            </>
        );
    }

    if (!property) {
        return (
            <>
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <p className="text-gray-500">Không tìm thấy thông tin chỗ ở.</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back link */}
                <Link
                    href={`/homestay/${slug}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 no-underline mb-6 transition-colors"
                >
                    <ArrowLeftOutlined className="text-xs" />
                    Quay lại {property.name}
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 m-0 mb-2">
                        Đánh giá của khách
                    </h1>
                    <p className="text-sm text-gray-500 m-0">
                        Tất cả đánh giá cho <span className="font-semibold text-gray-700">{property.name}</span>
                    </p>
                </div>

                {/* Summary Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-8">
                    {/* Left: Overall score */}
                    <div className="flex flex-col items-center justify-center md:min-w-[160px]">
                        <div className="text-5xl font-bold text-gray-900 mb-1">{ratingStr}</div>
                        <Rate
                            disabled
                            defaultValue={property.ratingAvg || 0}
                            allowHalf
                            className="text-lg"
                            style={{ color: "#fadb14" }}
                        />
                        <p className="text-sm text-gray-500 mt-2 m-0">
                            {property.reviewCount || property.reviews?.length || 0} đánh giá
                        </p>
                    </div>

                    {/* Right: Rating breakdown */}
                    <div className="flex-1 flex flex-col justify-center gap-2">
                        {ratingDistribution.map(({ star, count, percent }) => (
                            <button
                                key={star}
                                onClick={() => {
                                    setRatingFilter(ratingFilter === star ? 0 : star);
                                    setCurrentPage(1);
                                }}
                                className={`flex items-center gap-3 group cursor-pointer bg-transparent border-none p-1 rounded-lg transition-colors ${
                                    ratingFilter === star ? "bg-yellow-50" : "hover:bg-gray-50"
                                }`}
                            >
                                <span className="text-sm font-medium text-gray-600 w-10 text-right">{star} sao</span>
                                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 w-8">{count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter & Sort Bar */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Select
                        value={ratingFilter}
                        onChange={(val) => {
                            setRatingFilter(val);
                            setCurrentPage(1);
                        }}
                        options={RATING_FILTER_OPTIONS}
                        style={{ minWidth: 120 }}
                        className="rounded-xl"
                    />
                    <Select
                        value={sortBy}
                        onChange={(val) => {
                            setSortBy(val);
                            setCurrentPage(1);
                        }}
                        options={SORT_OPTIONS}
                        style={{ minWidth: 160 }}
                        className="rounded-xl"
                    />
                    {ratingFilter > 0 && (
                        <button
                            onClick={() => {
                                setRatingFilter(0);
                                setCurrentPage(1);
                            }}
                            className="text-xs text-[#2DD4A8] hover:text-[#25bc95] bg-transparent border-none cursor-pointer font-semibold"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                        {filteredAndSortedReviews.length} đánh giá
                    </span>
                </div>

                {/* Reviews List */}
                {paginatedReviews.length === 0 ? (
                    <div className="bg-white border border-gray-100 rounded-2xl p-12">
                        <Empty description="Không có đánh giá nào phù hợp với bộ lọc." />
                    </div>
                ) : (
                    <div className="flex flex-col gap-0">
                        {paginatedReviews.map((review, index) => (
                            <div
                                key={review.id}
                                className={`py-6 ${index < paginatedReviews.length - 1 ? "border-b border-gray-100" : ""}`}
                            >
                                <div className="flex items-start gap-4">
                                    <Avatar
                                        src={review.guestAvatarUrl}
                                        size={44}
                                        className="flex-shrink-0"
                                    >
                                        {review.guestName?.charAt(0)?.toUpperCase()}
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div>
                                                <span className="font-semibold text-gray-900 text-sm">
                                                    {review.guestName}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-2">
                                                    {review.createdAt
                                                        ? dayjs(review.createdAt).format("DD/MM/YYYY")
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <Rate
                                                disabled
                                                defaultValue={review.rating}
                                                className="text-xs"
                                                style={{ color: "#fadb14", fontSize: 13 }}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-700 m-0 leading-relaxed whitespace-pre-wrap">
                                            {review.comment}
                                        </p>

                                        {/* Review Images */}
                                        {review.imageUrls && review.imageUrls.length > 0 && (
                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                <Image.PreviewGroup>
                                                    {review.imageUrls.map((url, idx) => (
                                                        <Image
                                                            key={idx}
                                                            src={url}
                                                            alt={`Review ${idx + 1}`}
                                                            width={72}
                                                            height={72}
                                                            className="rounded-lg object-cover border border-gray-200 cursor-pointer"
                                                        />
                                                    ))}
                                                </Image.PreviewGroup>
                                            </div>
                                        )}

                                        {/* Host Reply */}
                                        {review.hostReply && (
                                            <div className="bg-gray-50 rounded-xl p-4 mt-3 border-l-2 border-[#2DD4A8]">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs font-bold text-green-800 m-0">
                                                        Phản hồi từ Chủ nhà
                                                    </p>
                                                    {review.replyTime && (
                                                        <span className="text-[10px] text-gray-400">
                                                            {dayjs(review.replyTime).format("DD/MM/YYYY")}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 m-0 leading-relaxed">
                                                    {review.hostReply}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {filteredAndSortedReviews.length > PAGE_SIZE && (
                    <div className="flex justify-center mt-8 mb-4">
                        <Pagination
                            current={currentPage}
                            total={filteredAndSortedReviews.length}
                            pageSize={PAGE_SIZE}
                            onChange={(page) => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            showSizeChanger={false}
                            showTotal={(total, range) =>
                                `${range[0]} – ${range[1]} / ${total} đánh giá`
                            }
                        />
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
