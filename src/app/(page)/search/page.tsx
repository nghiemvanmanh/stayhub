"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Select, Pagination, Skeleton, Drawer } from "antd";
import {
  FilterOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Building, TreePine, Waves, Mountain, LayoutGrid } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResultCard from "@/components/search/SearchResultCard";
import {
  mockProperties,
  mockPropertyAmenities,
} from "@/data/property";
import { mockRooms, mockReserves } from "@/data";
import { BookingStatus } from "@/interfaces/enums";

// Blocking statuses for availability check
const BLOCKING_STATUSES: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.CHECKED_IN,
  BookingStatus.PENDING,
  BookingStatus.AWAITING_PAYMENT,
  BookingStatus.PARTIALLY_PAID,
];

function getAvailableRoomCount(
  propertyId: string | number,
  checkIn: Dayjs,
  checkOut: Dayjs
): number {
  const rooms = mockRooms.filter((r) => r.propertyId === propertyId && r.isActive);
  return rooms.filter((room) => {
    const hasConflict = mockReserves.some((res) => {
      if (res.roomId !== room.id) return false;
      if (!BLOCKING_STATUSES.includes(res.status)) return false;
      const rStart = dayjs(res.startDate);
      const rEnd = dayjs(res.endDate);
      return !(
        checkOut.isSame(rStart, "day") ||
        checkOut.isBefore(rStart, "day") ||
        checkIn.isSame(rEnd, "day") ||
        checkIn.isAfter(rEnd, "day")
      );
    });
    return !hasConflict;
  }).length;
}

const ITEMS_PER_PAGE = 6;

// Category tabs for search page – matching mockup
const searchCategories = [
  { key: "all", label: "Tất cả", icon: <LayoutGrid className="w-4 h-4" /> },
  { key: "ven-bien", label: "Ven biển", icon: <Waves className="w-4 h-4" /> },
  { key: "nha-go", label: "Nhà gỗ", icon: <TreePine className="w-4 h-4" /> },
  { key: "thanh-pho", label: "Thành phố", icon: <Building className="w-4 h-4" /> },
  { key: "nong-thon", label: "Nông thôn", icon: <Mountain className="w-4 h-4" /> },
];

// Map category tab keys to actual category IDs
const categoryKeyToIds: Record<string, number[]> = {
  all: [],
  "ven-bien": [5], // Khu Nghỉ Dưỡng
  "nha-go": [4],   // Nhà Gỗ
  "thanh-pho": [2, 3], // Căn Hộ + Nhà Phố
  "nong-thon": [1],    // Biệt Thự
};

function SearchPageContent() {
  const searchParams = useSearchParams();

  // Read URL params
  const urlLocation = searchParams.get("location") || "";
  const urlCheckIn = searchParams.get("checkIn");
  const urlCheckOut = searchParams.get("checkOut");
  const urlGuests = searchParams.get("guests");

  // State
  const [activeCategory, setActiveCategory] = useState("all");
  const [location, setLocation] = useState(urlLocation);
  const [dates, setDates] = useState<[Dayjs, Dayjs] | null>(
    urlCheckIn && urlCheckOut
      ? [dayjs(urlCheckIn), dayjs(urlCheckOut)]
      : null
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [rentalType, setRentalType] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Reset filters
  const handleReset = () => {
    setLocation("");
    setDates(null);
    setPriceRange([0, 10000000]);
    setRentalType("");
    setSelectedAmenities([]);
    setActiveCategory("all");
    setCurrentPage(1);
  };

  // Filter logic
  const filteredProperties = useMemo(() => {
    let results = mockProperties.filter((p) => p.status === "PUBLISHED");

    // Location filter (search in name, province, district, ward)
    if (location.trim()) {
      const q = location.trim().toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.province && p.province.toLowerCase().includes(q)) ||
          (p.district && p.district.toLowerCase().includes(q)) ||
          (p.ward && p.ward.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (activeCategory !== "all") {
      const ids = categoryKeyToIds[activeCategory] || [];
      if (ids.length > 0) {
        results = results.filter((p) => ids.includes(Number(p.categoryId)));
      }
    }

    // Price range filter
    results = results.filter(
      (p) =>
        p.pricePerNight >= priceRange[0] && p.pricePerNight <= priceRange[1]
    );

    // Rental type filter
    if (rentalType) {
      if (rentalType === "PRIVATE_ROOM") {
        results = results.filter((p) => p.rentalType === "PRIVATE_ROOM");
      } else if (rentalType === "SHARED_ROOM") {
        results = results.filter((p) => p.rentalType === "SHARED_ROOM");
      } else {
        results = results.filter((p) => p.rentalType === "ENTIRE_PLACE");
      }
    }

    // Amenity filter
    if (selectedAmenities.length > 0) {
      results = results.filter((p) => {
        const propertyAmenityIds = mockPropertyAmenities
          .filter((pa) => pa.propertyId === p.id)
          .map((pa) => Number(pa.amenityId));
        return selectedAmenities.every((aid) =>
          propertyAmenityIds.includes(aid)
        );
      });
    }

    // Guests filter from URL
    if (urlGuests) {
      const guestCount = parseInt(urlGuests);
      if (!isNaN(guestCount)) {
        // Check total maxGuests across all rooms for the property
        results = results.filter((p) => {
          const propertyRooms = mockRooms.filter((r) => r.propertyId === p.id && r.isActive);
          const totalRoomGuests = propertyRooms.reduce((s, r) => s + r.maxGuests, 0);
          return (totalRoomGuests > 0 ? totalRoomGuests : p.maxGuests) >= guestCount;
        });
      }
    }

    // ── Date-based availability filter ──
    // Only show properties that have at least 1 available room for the selected dates
    if (dates) {
      results = results.filter((p) => {
        const availCount = getAvailableRoomCount(p.id, dates[0], dates[1]);
        return availCount > 0;
      });
    }

    // Sort
    if (sortBy === "price-asc") {
      results.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === "price-desc") {
      results.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortBy === "rating") {
      results.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
    }
    // "recommended" = default order

    return results;
  }, [location, activeCategory, priceRange, rentalType, selectedAmenities, sortBy, urlGuests, dates]);

  // Pagination
  const totalResults = filteredProperties.length;
  const paginatedResults = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = <T,>(setter: (val: T) => void) => {
    return (val: T) => {
      setter(val);
      setCurrentPage(1);
    };
  };

  // Count active filters for badge
  const activeFilterCount = [
    location.trim() ? 1 : 0,
    dates ? 1 : 0,
    priceRange[0] > 0 || priceRange[1] < 10000000 ? 1 : 0,
    rentalType ? 1 : 0,
    selectedAmenities.length > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const filtersComponent = (
    <SearchFilters
      location={location}
      onLocationChange={handleFilterChange(setLocation)}
      dates={dates}
      onDatesChange={handleFilterChange(setDates)}
      priceRange={priceRange}
      onPriceRangeChange={handleFilterChange(setPriceRange)}
      rentalType={rentalType}
      onRentalTypeChange={handleFilterChange(setRentalType)}
      selectedAmenities={selectedAmenities}
      onAmenitiesChange={handleFilterChange(setSelectedAmenities)}
      onReset={handleReset}
    />
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Category Bar */}
      <div className="border-b border-gray-100 bg-white sticky top-[72px] z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-3">
            {/* Category pills – scrollable on all sizes */}
            <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none flex-1 min-w-0">
              {searchCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer border-none ${
                    activeCategory === cat.key
                      ? "bg-[#2DD4A8] text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Filter button – visible everywhere, opens drawer on mobile */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 relative"
            >
              <FilterOutlined />
              <span className="hidden sm:inline">Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2DD4A8] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {/* Desktop-only filter button placeholder */}
            <button className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 bg-white transition-colors cursor-pointer whitespace-nowrap flex-shrink-0">
              <FilterOutlined />
              Hiện thị thêm bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-base font-bold">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleReset}
                className="text-[#2DD4A8] text-xs font-medium hover:underline cursor-pointer bg-transparent border-none"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        }
        placement="bottom"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        height="85vh"
        className="lg:hidden"
        styles={{
          body: { paddingBottom: 80 },
        }}
        footer={
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="w-full py-3 bg-[#2DD4A8] text-white font-semibold rounded-xl border-none cursor-pointer text-sm hover:bg-[#25bc95] transition-colors"
          >
            Xem {totalResults} kết quả
          </button>
        }
      >
        {filtersComponent}
      </Drawer>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-8 flex-1 w-full">
        <div className="flex gap-8">
          {/* Left Sidebar – Filters (desktop only) */}
          <aside className="w-[260px] flex-shrink-0 hidden lg:block">
            <div className="sticky top-[140px]">
              {filtersComponent}
            </div>
          </aside>

          {/* Right – Results */}
          <main className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5">
                  Homestay tại Việt Nam
                </h1>
                <p className="text-xs sm:text-sm text-gray-400">
                  Hơn {totalResults} chỗ ở được tìm thấy
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  Sắp xếp theo:
                </span>
                <Select
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  size="small"
                  className="min-w-[120px]"
                  options={[
                    { value: "recommended", label: "Đề xuất" },
                    { value: "price-asc", label: "Giá tăng dần" },
                    { value: "price-desc", label: "Giá giảm dần" },
                    { value: "rating", label: "Đánh giá cao" },
                  ]}
                />
              </div>
            </div>

            {/* Prompt to select dates */}
            {!dates && (
              <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start sm:items-center gap-3">
                <div className="text-blue-500 text-lg mt-0.5 sm:mt-0">💡</div>
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-medium m-0">
                    Bạn chưa chọn ngày nhận/trả phòng
                  </p>
                  <p className="text-xs text-blue-600 m-0 mt-0.5">
                    Vui lòng chọn ngày để xem chính xác các homestay còn phòng trống.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const el = document.querySelector(".ant-picker");
                    if (el instanceof HTMLElement) el.click();
                  }}
                  className="hidden sm:block whitespace-nowrap px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
                >
                  Chọn ngày ngay
                </button>
              </div>
            )}

            {/* Results list */}
            {paginatedResults.length > 0 ? (
              <div>
                {paginatedResults.map((property) => {
                  const availableRoomCount = dates
                    ? getAvailableRoomCount(property.id, dates[0], dates[1])
                    : undefined;
                  const totalRoomCount = mockRooms.filter(
                    (r) => r.propertyId === property.id && r.isActive
                  ).length;
                  return (
                    <SearchResultCard
                      key={String(property.id)}
                      property={property}
                      checkIn={dates ? dates[0].format("YYYY-MM-DD") : undefined}
                      checkOut={dates ? dates[1].format("YYYY-MM-DD") : undefined}
                      availableRoomCount={availableRoomCount}
                      totalRoomCount={totalRoomCount}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-16 sm:py-20 text-center">
                <div className="text-4xl sm:text-5xl mb-4">🔍</div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-xs sm:text-sm text-gray-400 mb-4">
                  Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.
                </p>
                <button
                  onClick={handleReset}
                  className="text-[#2DD4A8] text-sm font-medium hover:underline cursor-pointer bg-transparent border-none"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalResults > ITEMS_PER_PAGE && (
              <div className="flex flex-col items-center gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100">
                <Pagination
                  current={currentPage}
                  total={totalResults}
                  pageSize={ITEMS_PER_PAGE}
                  onChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  showSizeChanger={false}
                  size="small"
                  responsive
                />
                <p className="text-[11px] sm:text-xs text-gray-400">
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} –{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalResults)} trong
                  số hơn {totalResults} homestay
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <Header />
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
            <Skeleton active paragraph={{ rows: 10 }} />
          </div>
          <Footer />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
