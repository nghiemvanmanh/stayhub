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

// Review item returned from GET /properties/{slug} response
export interface PropertyReview {
  id: number;
  guestName: string;
  guestAvatarUrl: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  hostReply: string | null;
  replyTime: string | null;
  createdAt: string;
}

// Review item embedded in GET /bookings/host response
export interface HostBookingReview {
  id: number;
  guestName: string;
  guestAvatarUrl: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  hostReply: string | null;
  replyTime: string | null;
  createdAt: string;
}
