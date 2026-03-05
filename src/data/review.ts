import { Review, ReviewImage } from "../interfaces/review";

export const mockReviews: Review[] = [
  {
    id: 1,
    bookingId: 1, // from previous bookings
    userId: 1, // Nguyen Van A
    propertyId: 1, // Biệt thự
    rating: 5,
    comment: "Tuyệt vời! Chắc chắn sẽ quay lại.",
    hostReply: "Cảm ơn bạn đã ghé thăm!",
    replyTime: new Date("2024-05-13T10:00:00Z"),
    isVisible: true,
    createdAt: new Date("2024-05-12T15:00:00Z"),
  },
  {
    id: 2,
    bookingId: 2,
    userId: 1,
    propertyId: 2, // Landmark 81
    rating: 4,
    comment: "Phòng đẹp nhưng check-in hơi chậm.",
    isVisible: true,
    createdAt: new Date("2024-06-21T18:00:00Z"),
  },
  {
    id: 3,
    bookingId: 3,
    userId: 2,
    propertyId: 3,
    rating: 5,
    comment: "Không gian rất ấm cúng và sạch sẽ. Đáng tiền!",
    isVisible: true,
    createdAt: new Date("2024-07-01T10:00:00Z"),
  },
  {
    id: 4,
    bookingId: 4,
    userId: 3,
    propertyId: 4,
    rating: 5,
    comment:
      "Cực kỳ thích hợp cho gia đình thư giãn nghỉ dưỡng. Hồ bơi rộng tuyệt vời.",
    isVisible: true,
    createdAt: new Date("2024-08-15T09:00:00Z"),
  },
  {
    id: 5,
    bookingId: 5,
    userId: 4,
    propertyId: 5,
    rating: 4,
    comment: "Gần phố đi bộ, phòng decor rất nghệ thuật. Sẽ ủng hộ host tiếp.",
    isVisible: true,
    createdAt: new Date("2024-08-20T11:00:00Z"),
  },
  {
    id: 6,
    bookingId: 6,
    userId: 5,
    propertyId: 6,
    rating: 5,
    comment:
      "Biệt thự rộng kinh khủng, đầy đủ tiện ích sinh hoạt. Nhóm 10 người ở vô tư.",
    isVisible: true,
    createdAt: new Date("2024-09-02T14:00:00Z"),
  },
  {
    id: 7,
    bookingId: 7,
    userId: 1,
    propertyId: 8,
    rating: 4,
    comment: "Trải nghiệm nhà sàn rất thú vị. Khí hậu mát mẻ quanh năm.",
    isVisible: true,
    createdAt: new Date("2024-09-15T08:30:00Z"),
  },
  {
    id: 8,
    bookingId: 8,
    userId: 2,
    propertyId: 10,
    rating: 5,
    comment:
      "Căn nhà mang đậm chất Huế xưa. Cảm giác như xuyên không về thời cung đình.",
    isVisible: true,
    createdAt: new Date("2024-10-05T15:20:00Z"),
  },
  {
    id: 9,
    bookingId: 9,
    userId: 3,
    propertyId: 12,
    rating: 5,
    comment:
      "Chỗ ở ngay sát bãi biển Vũng Tàu. Cực chill vào buổi chiều tà. Chủ nhà nhiệt tình.",
    hostReply: "Cảm ơn bạn đã lựa chọn nhé!",
    isVisible: true,
    createdAt: new Date("2024-10-22T19:45:00Z"),
  },
  {
    id: 10,
    bookingId: 10,
    userId: 4,
    propertyId: 17,
    rating: 5,
    comment:
      "Dịch vụ của resort Sun Group thực sự không có gì để chê. Trải nghiệm 5 sao chuẩn quốc tế.",
    isVisible: true,
    createdAt: new Date("2024-11-11T12:00:00Z"),
  },
  {
    id: 11,
    bookingId: 11,
    userId: 5,
    propertyId: 20,
    rating: 5,
    comment:
      "Gần gũi với thiên nhiên, không khí rất trong lành. Chắc chắn sẽ dắt cả nhà tới đây thêm lần nữa.",
    isVisible: true,
    createdAt: new Date("2024-12-05T09:15:00Z"),
  },
];

export const mockReviewImages: ReviewImage[] = [
  {
    id: 1,
    reviewId: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=500&q=80",
    createdAt: new Date("2024-05-12T15:00:00Z"),
  },
];
