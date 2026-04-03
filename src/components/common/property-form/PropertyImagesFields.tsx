import { useMemo } from "react";
import { Upload } from "antd";
import { PictureOutlined, DeleteOutlined } from "@ant-design/icons";
import { type PropertyAmenitiesData } from "./propertyData";

interface PropertyImagesFieldsProps {
  data: PropertyAmenitiesData;
  onChange: (data: Partial<PropertyAmenitiesData>) => void;
  maxImages?: number;
}

function ImageThumb({ file, onRemove, index }: { file: File | string; onRemove: () => void; index: number }) {
  const url = useMemo(() => (typeof file === "string" ? file : URL.createObjectURL(file)), [file]);
  return (
    <div className={`relative rounded-xl overflow-hidden border-2 border-[#2DD4A8] bg-blue-50 flex items-center justify-center ${index === 0 ? "col-span-2 row-span-2 min-h-[140px] md:min-h-[200px]" : "min-h-[80px] md:min-h-[100px]"}`}>
      <img src={url} alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover block" />
      <button
        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 border-none text-white text-xs cursor-pointer flex items-center justify-center transition-colors hover:bg-red-500/90 z-[2]"
        onClick={onRemove}
      >
        <DeleteOutlined />
      </button>
      {index === 0 && (
        <span className="absolute bottom-2 left-2 text-[10px] md:text-xs font-semibold text-white bg-black/50 px-2 py-0.5 rounded">
          Ảnh bìa
        </span>
      )}
    </div>
  );
}

export function PropertyImagesFields({
  data,
  onChange,
  maxImages = 20,
}: PropertyImagesFieldsProps) {
  const removeImage = (index: number) => {
    const newImages = [...data.images];
    newImages.splice(index, 1);
    onChange({ images: newImages });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Tối thiểu 5 ảnh, tối đa {maxImages} ảnh</span>
        <span className="text-xs text-gray-500 font-medium">{data.images.length}/{maxImages}</span>
      </div>

      {data.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
          {data.images.map((file, i) => (
            <ImageThumb key={i} file={file as File} index={i} onRemove={() => removeImage(i)} />
          ))}
        </div>
      )}

      {data.images.length < maxImages && (
        <Upload.Dragger
          showUploadList={false}
          multiple
          accept="image/*"
          beforeUpload={() => false}
          fileList={[]}
          onChange={({ fileList }) => {
            const newFiles = fileList
              .map((f) => f.originFileObj as File)
              .filter(Boolean);
            onChange({ images: [...data.images, ...newFiles].slice(0, maxImages) });
          }}
          className="!rounded-xl !border-2 !border-dashed !border-gray-300 !bg-gray-50 hover:!bg-[#e6faf4]"
        >
          <div className="flex flex-col items-center text-center gap-1 py-4">
            <div className="text-4xl text-gray-300 mb-2">
              <PictureOutlined />
            </div>
            <p className="text-sm font-semibold text-gray-700 m-0 px-2">Kéo thả hoặc nhấp để tải ảnh lên</p>
            <p className="text-xs text-gray-400 m-0">
              JPG, PNG — Ảnh đầu tiên sẽ là ảnh bìa
            </p>
          </div>
        </Upload.Dragger>
      )}
    </div>
  );
}
