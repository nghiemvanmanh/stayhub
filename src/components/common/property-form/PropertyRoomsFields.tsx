import { PictureOutlined, DeleteOutlined } from "@ant-design/icons";
import { type PropertyAmenitiesData } from "./propertyData";

interface PropertyRoomsFieldsProps {
  data: PropertyAmenitiesData;
  onOpenRoomModal: (index: number | null) => void;
  onDeleteRoom: (index: number, e: React.MouseEvent) => void;
}

export function PropertyRoomsFields({
  data,
  onOpenRoomModal,
  onDeleteRoom,
}: PropertyRoomsFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      {data.rooms.map((room, i) => (
        <div 
          key={i} 
          className="flex gap-4 p-3 md:p-4 border border-gray-200 rounded-xl hover:border-[#2DD4A8] transition-colors cursor-pointer" 
          onClick={() => onOpenRoomModal(i)}
        >
          <div className="w-[80px] h-[60px] md:w-[100px] md:h-[75px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {room.images?.[0] ? (
              <img src={URL.createObjectURL(room.images[0])} alt={room.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <PictureOutlined className="text-xl" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h4 className="text-sm md:text-[15px] font-semibold text-gray-900 m-0 truncate pr-2">{room.name}</h4>
                <button 
                  className="text-red-500 hover:text-red-600 border-none bg-transparent cursor-pointer p-0 shrink-0" 
                  onClick={(e) => onDeleteRoom(i, e)}
                >
                  <DeleteOutlined />
                </button>
              </div>
              <p className="hidden md:block text-xs text-gray-500 truncate m-0 mt-1">{room.description}</p>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-600 mt-2">
              <span className="flex items-center gap-1">👥 {room.maxGuests}</span>
              <span className="flex items-center gap-1">🛌 {room.numBeds}</span>
              <span className="flex items-center gap-1">🚿 {room.numBathrooms}</span>
              <span className="font-semibold text-[#2DD4A8] ml-auto whitespace-nowrap">
                {room.pricePerNight.toLocaleString()} ₫
              </span>
            </div>
          </div>
        </div>
      ))}

      <button
        className="w-full py-3 border-2 border-dashed border-[#2DD4A8] text-[#2DD4A8] rounded-xl font-medium bg-transparent cursor-pointer hover:bg-[#e6faf4] transition-colors flex items-center justify-center gap-2"
        onClick={() => onOpenRoomModal(null)}
      >
        + Thêm phòng mới
      </button>
    </div>
  );
}
