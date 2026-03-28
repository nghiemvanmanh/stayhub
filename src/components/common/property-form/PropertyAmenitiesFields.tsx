import { Checkbox, Skeleton } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import {
  Wifi, Tv, Microwave, WashingMachine, CircleParking, Snowflake, Briefcase,
  WavesLadder, Bath, Aperture, Drumstick, Flame, Dumbbell, FireExtinguisher,
  Disc3, BriefcaseMedical, Radar, type LucideIcon
} from "lucide-react";
import { type PropertyAmenitiesData, type AmenityItem } from "./propertyData";

interface PropertyAmenitiesFieldsProps {
  data: PropertyAmenitiesData;
  onChange: (data: Partial<PropertyAmenitiesData>) => void;
  amenityList: AmenityItem[];
  loadingAmenities: boolean;
}

const amenityIconMap: Record<string, LucideIcon> = {
  Wifi, Tv, Microwave, WashingMachine, CircleParking, Snowflake, Briefcase,
  WavesLadder, Bath, Aperture, Drumstick, Flame, Dumbbell, FireExtinguisher,
  Disc3, BriefcaseMedical, Radar,
};

export function PropertyAmenitiesFields({
  data,
  onChange,
  amenityList,
  loadingAmenities,
}: PropertyAmenitiesFieldsProps) {
  const handleAmenityToggle = (amenityId: number) => {
    const current = data.amenityIds;
    if (current.includes(amenityId)) {
      onChange({ amenityIds: current.filter((id) => id !== amenityId) });
    } else {
      onChange({ amenityIds: [...current, amenityId] });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {loadingAmenities ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton.Button key={i} active block style={{ height: 72, borderRadius: 12 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {amenityList.map((amenity) => {
            const isSelected = data.amenityIds.includes(amenity.id);
            const AmenityIcon = amenityIconMap[amenity.iconName];
            return (
              <div
                key={amenity.id}
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all text-center ${
                  isSelected
                    ? "border-[#2DD4A8] bg-[#e6faf4] shadow-sm"
                    : "border-gray-200 hover:border-[#2DD4A8]"
                }`}
                onClick={() => handleAmenityToggle(amenity.id)}
              >
                <Checkbox checked={isSelected} className="!hidden" />
                <div className="text-2xl mb-1 flex items-center justify-center">
                  {AmenityIcon ? <AmenityIcon className="w-6 h-6" /> : <AppstoreOutlined />}
                </div>
                <span className="text-xs font-medium text-gray-700">{amenity.name}</span>
              </div>
            );
          })}
        </div>
      )}
      {data.amenityIds.length > 0 && (
        <p className="text-xs text-gray-400 m-0">Đã chọn {data.amenityIds.length} tiện ích</p>
      )}
    </div>
  );
}
