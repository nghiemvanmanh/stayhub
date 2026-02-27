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
