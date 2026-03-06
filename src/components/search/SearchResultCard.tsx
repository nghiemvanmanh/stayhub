"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartOutlined } from "@ant-design/icons";
import { Property } from "@/interfaces/property";
import { mockPropertyImages, mockPropertyAmenities, mockAmenities } from "@/data/property";
import { useMemo } from "react";

interface SearchResultCardProps {
  property: Property;
}

export default function SearchResultCard({ property }: SearchResultCardProps) {
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

  // Format price
  const formattedPrice = new Intl.NumberFormat("vi-VN").format(
    property.pricePerNight
  );

  // Location string
  const locationStr = [property.district, property.province]
    .filter(Boolean)
    .join(", ");

  // Stable distance mock (seeded by property id so it doesn't change on re-render)
  const distanceMock = useMemo(() => {
    const seed = Number(property.id) * 47;
    return `Cách ${(seed % 450) + 50}km`;
  }, [property.id]);

  return (
    <Link
      href={`/homestay/${property.id}`}
      className="no-underline block group"
    >
      {/* Desktop: horizontal | Mobile: vertical card */}
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
              {/* Rating badge */}
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

          {/* Price */}
          <div className="flex items-end justify-between mt-3 sm:mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>🏠</span>
              <span>{property.numBedrooms} phòng ngủ</span>
              <span>·</span>
              <span>{property.maxGuests} khách</span>
            </div>
            <div className="text-right flex-shrink-0">
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
