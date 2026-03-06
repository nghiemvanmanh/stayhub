import { Amenity } from "./property";
import { Reserve } from "./reserve";

export interface Room {
  id: string | number;
  propertyId: string | number;
  name: string;
  description?: string;
  type: string;
  maxGuests: number;
  basePricePerNight: number;
  numBeds: number;
  numBathrooms?: number;
  area?: number;
  images?: string[];
  amenities?: Amenity[]; // Array of Amenity objects when populated
  amenityIds?: (string | number)[]; // Array of Amenity IDs for mutation
  reserves?: Reserve[]; // Array of Reserve when populated
  property?: any; // Avoiding circular reference issue by using any or Property type
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RoomAmenity {
  roomId: string | number;
  amenityId: string | number;
}
