export interface Review {
  id: string | number;
  bookingId: string | number;
  userId: string | number;
  propertyId: string | number;
  rating: number; // 1 to 5
  comment?: string;
  hostReply?: string;
  replyTime?: Date | string;
  isVisible?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ReviewImage {
  id: string | number;
  reviewId: string | number;
  imageUrl: string;
  createdAt?: Date | string;
}
