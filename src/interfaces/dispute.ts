import { DisputeStatus } from "./enums";

export interface Dispute {
  id: string | number;
  bookingId: string | number;
  creatorId: string | number;
  reason: string;
  description?: string;
  evidenceImageUrls?: string;
  status: DisputeStatus;
  adminNote?: string;
  resolvedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
