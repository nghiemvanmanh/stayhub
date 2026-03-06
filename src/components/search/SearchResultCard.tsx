"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartOutlined, CheckCircleFilled } from "@ant-design/icons";
import { Property } from "@/interfaces/property";
import { mockPropertyImages, mockPropertyAmenities, mockAmenities } from "@/data/property";
import { mockRooms } from "@/data/room";
import { useMemo } from "react";

interface SearchResultCardProps {
  property: Property;
  checkIn?: string;
  checkOut?: string;
  availableRoomCount?: number;
  totalRoomCount?: number;
}

export default function SearchResultCard({
  property,
  checkIn,
  checkOut,
  availableRoomCount,
  totalRoomCount,
}: SearchResultCardProps) {
  // Get thumbnail
  const thumbnail =
    mockPropertyImages.find(
      (img) => img.propertyId === property.id && img.isThumbnail
    ) || mockPropertyImages.find((img) => img.propertyId === property.id);
  const imageUrl =
    thumbnail?.url ||
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80";

  // Get amenities for this property
  const amenityIds = mockPropertyAmenities
    .filter((pa) => pa.propertyId === property.id)
    .map((pa) => pa.amenityId);
  const amenities = mockAmenities.filter((a) => amenityIds.includes(a.id));

  // Get rooms for this property
  const rooms = mockRooms.filter(
    (r) => r.propertyId === property.id && r.isActive
  );
  const roomCount = rooms.length;
  const totalBeds = rooms.reduce((s, r) => s + r.numBeds, 0) || property.numBeds || 0;
  const totalMaxGuests = rooms.reduce((s, r) => s + r.maxGuests, 0) || property.maxGuests;
  const minPrice = rooms.length > 0
    ? Math.min(...rooms.map((r) => r.basePricePerNight))
    : property.pricePerNight;

  // Format price
  const formattedPrice = new Intl.NumberFormat("vi-VN").format(minPrice);

  // Location string
  const locationStr = [property.district, property.province]
    .filter(Boolean)
    .join(", ");

  // Stable distance mock
  const distanceMock = useMemo(() => {
    const seed = Number(property.id) * 47;
    return `Cách ${(seed % 450) + 50}km`;
  }, [property.id]);

  // Build link with date params
  const linkParams = new URLSearchParams();
  if (checkIn) linkParams.set("checkIn", checkIn);
  if (checkOut) linkParams.set("checkOut", checkOut);
  const linkHref = `/homestay/${property.id}${linkParams.toString() ? `?${linkParams.toString()}` : ""}`;

  const hasDates = checkIn && checkOut;

  return (
    <Link
      href={linkHref}
      className="no-underline block group"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 py-4 sm:py-5 border-b border-gray-100 hover:bg-gray-50/50 transition-colors rounded-xl px-2 -mx-2">
        {/* Image */}
        <div className="relative w-full sm:w-[220px] md:w-[260px] aspect-[16/10] sm:aspect-auto sm:h-[180px] flex-shrink-0 rounded-xl overflow-hidden">
          <Image
            src={imageUrl}
            alt={property.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, 260px"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-3 left-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer border-none shadow-sm"
          >
            <HeartOutlined className="text-gray-600 text-sm" />
          </button>
          {/* Room availability badge */}
          {hasDates && availableRoomCount !== undefined && totalRoomCount !== undefined && totalRoomCount > 0 && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              {availableRoomCount}/{totalRoomCount} phòng trống
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0 sm:py-1">
          <div>
            {/* Title + Rating */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-0.5 truncate">
                  {property.name}
                </h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-1.5">
                  <span>📍</span>
                  <span className="truncate">{locationStr} · {distanceMock}</span>
                </p>
              </div>
              {property.ratingAvg && (
                <div className="flex-shrink-0 bg-[#2DD4A8] text-white text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap">
                  ⭐ {property.ratingAvg.toFixed(1)}
                </div>
              )}
            </div>

            {/* Amenities tags */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-1">
              {amenities.slice(0, 4).map((amenity) => (
                <span
                  key={String(amenity.id)}
                  className="text-[10px] sm:text-[11px] text-gray-500 bg-gray-50 border border-gray-100 rounded-md px-1.5 sm:px-2 py-0.5"
                >
                  {amenity.name}
                </span>
              ))}
              {amenities.length > 4 && (
                <span className="text-[10px] sm:text-[11px] text-gray-400">
                  +{amenities.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* Bottom row: stats + price */}
          <div className="flex items-end justify-between mt-3 sm:mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-400 flex-wrap">
              {roomCount > 0 && (
                <>
                  <span>🚪</span>
                  <span>{roomCount} phòng</span>
                  <span>·</span>
                </>
              )}
              <span>🛏️</span>
              <span>{totalBeds} giường</span>
              <span>·</span>
              <span>👥</span>
              <span>{totalMaxGuests} khách</span>
              {hasDates && availableRoomCount !== undefined && totalRoomCount !== undefined && totalRoomCount > 0 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 text-green-600 font-medium">
                    <CheckCircleFilled className="text-[10px]" />
                    {availableRoomCount} phòng trống
                  </span>
                </>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              {roomCount > 0 && (
                <span className="text-[10px] text-gray-400 block">từ</span>
              )}
              <span className="text-base sm:text-lg font-bold text-[#2DD4A8]">
                {formattedPrice}đ
              </span>
              <span className="text-xs text-gray-400 ml-1">/đêm</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
