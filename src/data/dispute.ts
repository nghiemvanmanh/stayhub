import { DisputeStatus } from "../interfaces/enums";
import { Dispute } from "../interfaces/dispute";

export const mockDisputes: Dispute[] = [
  {
    id: 1,
    bookingId: 1,
    creatorId: 1, // Guest
    reason: "Phòng không giống ảnh",
    description: "Chăn ga bốc mùi, không thấy nhân viên hỗ trợ",
    evidenceImageUrls:
      "https://example.com/evidence1.jpg,https://example.com/evidence2.jpg",
    status: DisputeStatus.OPEN,
    createdAt: new Date("2024-05-10T14:00:00Z"),
    updatedAt: new Date("2024-05-10T14:00:00Z"),
  },
];
