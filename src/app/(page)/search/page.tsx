"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Select, Pagination, Skeleton, Drawer } from "antd";
import {
  FilterOutlined,
} from "@ant-design/icons";
import { Building, TreePine, Waves, Mountain, LayoutGrid } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResultCard from "@/components/search/SearchResultCard";
import { PropertyListItem } from "@/interfaces/property";
import { fetcher } from "../../../../utils/fetcher";

const ITEMS_PER_PAGE = 6;

// Category tabs for search page – matching mockup
const searchCategories = [
  { key: "all", label: "Tất cả", icon: <LayoutGrid className="w-4 h-4" /> },
  { key: "ven-bien", label: "Ven biển", icon: <Waves className="w-4 h-4" /> },
  { key: "nha-go", label: "Nhà gỗ", icon: <TreePine className="w-4 h-4" /> },
  { key: "thanh-pho", label: "Thành phố", icon: <Building className="w-4 h-4" /> },
  { key: "nong-thon", label: "Nông thôn", icon: <Mountain className="w-4 h-4" /> },
];

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

  // Fetch properties from API
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["search-properties", currentPage],
    queryFn: async () => {
      const res = await fetcher.get(`/properties`, {
        params: {
          pageNo: currentPage,
          pageSize: 50, // Fetch more for client-side filtering
        },
      });
      const data = res.data?.data ?? res.data;
      return data;
    },
  });

  const allProperties: PropertyListItem[] = apiResponse?.items || [];

  // Client-side filtering 
  const filteredProperties = useMemo(() => {
    let results = [...allProperties];

    // Location filter (search in name, province, district)
    if (location.trim()) {
      const q = location.trim().toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.province && p.province.toLowerCase().includes(q)) ||
          (p.district && p.district.toLowerCase().includes(q))
      );
    }

    // Price range filter
    results = results.filter(
      (p) =>
        p.pricePerNight >= priceRange[0] && p.pricePerNight <= priceRange[1]
    );

    // Guests filter from URL
    if (urlGuests) {
      const guestCount = parseInt(urlGuests);
      if (!isNaN(guestCount)) {
        results = results.filter((p) => p.maxGuests >= guestCount);
      }
    }

    // Sort
    if (sortBy === "price-asc") {
      results.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === "price-desc") {
      results.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortBy === "rating") {
      results.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
    }

    return results;
  }, [allProperties, location, priceRange, rentalType, selectedAmenities, sortBy, urlGuests, dates]);

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

            {/* Loading state */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-5 py-5 border-b border-gray-100">
                    <Skeleton.Image active style={{ width: 260, height: 180 }} className="!rounded-xl" />
                    <div className="flex-1">
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedResults.length > 0 ? (
              <div>
                {paginatedResults.map((property) => (
                  <SearchResultCard
                    key={String(property.id)}
                    property={property}
                    checkIn={dates ? dates[0].format("YYYY-MM-DD") : undefined}
                    checkOut={dates ? dates[1].format("YYYY-MM-DD") : undefined}
                  />
                ))}
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
