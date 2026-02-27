export interface Homestay {
  id: string;
  title: string;
  location: string;
  distance: string;
  dates: string;
  price: string;
  rating: number;
  image: string;
  isFavorite: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  comment: string;
}

export interface RoomType {
  id: string;
  name: string;
  area: number;
  bedType: string;
  description: string;
  price: string;
  pricePerNight: number;
  maxGuests: number;
  originalPrice?: string;
  discount?: number;
  amenities: string[];
  image: string;
}

export interface HomestayDetail {
  id: string;
  title: string;
  subtitle: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  reviewCount: number;
  badge: string;
  hostName: string;
  hostAvatar: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  images: string[];
  description: string;
  highlights: { icon: string; title: string; description: string }[];
  tabs: string[];
  roomTypes: RoomType[];
  reviews: {
    id: string;
    name: string;
    avatar: string;
    date: string;
    comment: string;
  }[];
  isFavorite: boolean;
}

const mockHomestays: Homestay[] = [
  {
    id: "1",
    title: "Đà Lạt, Lâm Đồng",
    location: "Cách 300km",
    distance: "Cách 300km",
    dates: "Ngày 13 - 17 thg 5",
    price: "1,200,000đ",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
    isFavorite: false,
  },
  {
    id: "2",
    title: "Hội An, Quảng Nam",
    location: "Cách 500km",
    distance: "Cách 500km",
    dates: "Ngày 20 - 25 thg 6",
    price: "2,500,000đ",
    rating: 4.86,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
    isFavorite: false,
  },
  {
    id: "3",
    title: "Sa Pa, Lào Cai",
    location: "Cách 300km",
    distance: "Cách 300km",
    dates: "Ngày 05 - 10 thg 5",
    price: "1,850,000đ",
    rating: 4.92,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
    isFavorite: false,
  },
  {
    id: "4",
    title: "Vũng Tàu, Bà Rịa",
    location: "Cách 110km",
    distance: "Cách 110km",
    dates: "Ngày 15 - 18 thg 5",
    price: "3,500,000đ",
    rating: 4.75,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
    isFavorite: false,
  },
  {
    id: "5",
    title: "Ba Vì, Hà Nội",
    location: "Cách 60km",
    distance: "Cách 60km",
    dates: "Ngày 10 - 12 thg 5",
    price: "950,000đ",
    rating: 4.80,
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
    isFavorite: false,
  },
  {
    id: "6",
    title: "Ninh Bình",
    location: "Cách 100km",
    distance: "Cách 100km",
    dates: "Ngày 22 - 25 thg 5",
    price: "1,400,000đ",
    rating: 4.78,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
    isFavorite: false,
  },
  {
    id: "7",
    title: "Phú Quốc, Kiên Giang",
    location: "Cách 400km",
    distance: "Cách 400km",
    dates: "Ngày 14 - 19 thg 7",
    price: "4,500,000đ",
    rating: 4.91,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop",
    isFavorite: false,
  },
  {
    id: "8",
    title: "Hạ Long, Quảng Ninh",
    location: "Cách 180km",
    distance: "Cách 180km",
    dates: "Ngày 01 - 05 thg 6",
    price: "2,350,000đ",
    rating: 4.85,
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&fit=crop",
    isFavorite: false,
  },
];

const mockCategories: Category[] = [
  { id: "1", name: "Thịnh hành" },
  { id: "2", name: "Hồ bơi tuyệt đẹp" },
  { id: "3", name: "Nhà nhỏ" },
  { id: "4", name: "Nông thôn" },
  { id: "5", name: "Cắm trại" },
  { id: "6", name: "Tầm nhìn đẹp" },
];

const mockTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    location: "Traveler từ Đà Lạt",
    rating: 5,
    comment:
      "Tôi đã có trải nghiệm tuyệt vời ở homestay tuyệt vời ở Đà Pa không gian yên bình, Chủ nhà rất thân thiện và nhiệt tình. Đẹp biết bao ở Mọi Pao.",
  },
  {
    id: "2",
    name: "Trần Thị Nha",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    location: "Thiên cổ phí phường",
    rating: 5,
    comment:
      "Homestay thực sự tốt, căn hòm thủ ấy đã bê một tô bún bò cập thêo và cao với loại bún lứa và danh giản đơn nhưng đậm đà đặc vặt",
  },
  {
    id: "3",
    name: "Lê Minh Đức",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    location: "Thiên cổn gia",
    rating: 5,
    comment:
      "Đây là nơi hoàn hảo để trải tay với chứng bưa, Tôi và gia đinh đã nghỉ dưỡng hè, đã có trải nghiệm 5/5 hoàn thiện tới nay, tuyệt vờ ĐT phải.",
  },
];

const mockHomestayDetails: HomestayDetail[] = [
  {
    id: "1",
    title: "Horizon Villa - View Biển Tuyệt Đỉnh & Hồ Bơi Vô Cực",
    subtitle: "Toàn bộ biệt thự. Chủ nhà Minh Anh",
    address: "Phường Hàm Tiến, Phan Thiết, Việt Nam",
    city: "Phan Thiết",
    country: "Việt Nam",
    rating: 4.92,
    reviewCount: 128,
    badge: "Chỗ ở siêu đẹp",
    hostName: "Minh Anh",
    hostAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
    maxGuests: 12,
    bedrooms: 5,
    beds: 6,
    bathrooms: 5,
    pricePerNight: 10000000,
    cleaningFee: 200000,
    serviceFee: 450000,
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    ],
    description:
      "Chào mừng bạn đến với Horizon Villa, nơi biển xanh và bầu trời gặp nhau. Căn biệt thự tọa lạc tại vị trí đắc địa nhất Mũi Né, mang đến cho bạn không gian yên bình tuyệt đối với tầm nhìn 180 độ ra đại dương.\n\nNội thất được thiết kế theo phong cách tối giản Nhật Bản kết hợp với sự phóng khoáng của vùng nhiệt đới. Phòng khách rộng lớn với trần cao và kính cường lực mang toàn bộ cảnh sắc thiên nhiên vào trong nhà.",
    highlights: [
      {
        icon: "wifi",
        title: "Wifi tốc độ cao miễn phí",
        description: "Phù hợp cho cả nghỉ dưỡng và làm việc từ xa.",
      },
      {
        icon: "car",
        title: "Chỗ đậu xe miễn phí",
        description: "Không gian rộng rãi cho tới 2 xe tô gia đình.",
      },
      {
        icon: "calendar",
        title: "Hủy miễn phí trước 48 giờ",
        description: "Nhận toàn bộ tiền hoàn nếu bạn thay đổi kế hoạch sớm.",
      },
    ],
    tabs: ["Mô tả", "Tiện nghi", "Vị trí", "Chính sách"],
    roomTypes: [
      {
        id: "r1",
        name: "Phòng Master View Biển",
        area: 45,
        bedType: "1 giường King",
        maxGuests: 2,
        description:
          "Phòng ngủ rộng nhất biệt thự với bồn tắm nằm nhìn thẳng ra Biển Nhĩ.",
        price: "3,200,000đ",
        pricePerNight: 3200000,
        originalPrice: "4,500,000đ",
        discount: 30,
        amenities: ["Bữa sáng miễn phí", "Hủy phòng linh hoạt", "Cọc trước 30%"],
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
      },
      {
        id: "r2",
        name: "Phòng Double Ban Công",
        area: 32,
        bedType: "1 giường Queen",
        maxGuests: 2,
        description:
          "Phòng ấm cúng với ban công rộng lãng tục và bàn trà thư giãn.",
        price: "2,500,000đ",
        pricePerNight: 2500000,
        amenities: ["Bữa sáng miễn phí", "Hủy phòng linh hoạt", "Thanh toán khi nhận phòng"],
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
      },
      {
        id: "r3",
        name: "Phòng Twin Gia Đình",
        area: 38,
        bedType: "2 giường đơn",
        maxGuests: 4,
        description:
          "Lựa chọn lý tưởng cho trẻ em hoặc nhóm bạn với không gian sinh hoạt chung.",
        price: "2,800,000đ",
        pricePerNight: 2800000,
        amenities: ["Bữa sáng miễn phí", "Hủy phòng linh hoạt", "Thanh toán trước"],
        image:
          "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop",
      },
    ],
    reviews: [
      {
        id: "rv1",
        name: "Hương Giang",
        avatar: "https://randomuser.me/api/portraits/women/12.jpg",
        date: "Tháng 9 năm 2024",
        comment:
          "Trải nghiệm tuyệt vời! Villa sạch sẽ, view đẹp hơn cả trong ảnh. Chủ nhà Minh Anh rất nhiệt tình hỗ trợ đoàn mình suốt chuyến đi. Chắc chắn sẽ quay lại!",
      },
      {
        id: "rv2",
        name: "Hương Giang",
        avatar: "https://randomuser.me/api/portraits/women/22.jpg",
        date: "Tháng 8 năm 2024",
        comment:
          "Trải nghiệm tuyệt vời! Villa sạch sẽ, view đẹp hơn cả trong ảnh. Chủ nhà Minh Anh rất nhiệt tình hỗ trợ đoàn mình suốt chuyến đi. Chắc chắn sẽ quay lại!",
      },
    ],
    isFavorite: false,
  },
];

// ============================================================
// API FUNCTIONS - Replace these with actual fetch calls later
// ============================================================

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function fetchFeaturedHomestays(): Promise<Homestay[]> {
  // TODO: Replace with actual API call
  // return fetch('/api/homestays/featured').then(res => res.json())
  await delay(500);
  return mockHomestays;
}

export async function fetchCategories(): Promise<Category[]> {
  // TODO: Replace with actual API call
  await delay(300);
  return mockCategories;
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  // TODO: Replace with actual API call
  await delay(400);
  return mockTestimonials;
}

export async function fetchHomestayDetail(id: string): Promise<HomestayDetail | null> {
  // TODO: Replace with actual API call
  await delay(400);
  return mockHomestayDetails.find((h) => h.id === id) ?? mockHomestayDetails[0];
}

export async function fetchSimilarHomestays(city: string): Promise<Homestay[]> {
  await delay(300);
  return mockHomestays.slice(0, 4).map((h) => ({
    ...h,
    title: "Sunrise Beach House",
    location: `Cách biển 200m`,
    distance: `Cách biển 200m`,
    price: "1,800,000đ",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
  }));
}
