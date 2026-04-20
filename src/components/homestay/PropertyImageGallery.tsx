"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ExpandAltOutlined } from "@ant-design/icons";
import { Image } from "antd";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface PropertyImageGalleryProps {
    images: string[];
    title: string;
}

export default function PropertyImageGallery({ images, title }: PropertyImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    
    // Safety check
    const validImages = Array.isArray(images) && images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80"];

    return (
        <div className="relative mb-8">
            <Image.PreviewGroup 
                preview={{ 
                    visible: lightboxOpen, 
                    onVisibleChange: (vis) => setLightboxOpen(vis) 
                }}
            >
                {/* ── BENTO GRID PORTION (Desktop) ── */}
                <div className="hidden md:block relative rounded-2xl overflow-hidden group">
                    {validImages.length >= 5 ? (
                        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px]">
                            {/* Image 1 (Large) */}
                            <div className="col-span-2 row-span-2 relative overflow-hidden group/item cursor-pointer">
                                <Image
                                    src={validImages[0]}
                                    alt={`${title} - 1`}
                                    rootClassName="w-full h-full"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    className="hover:scale-105 transition-transform duration-500 hover:brightness-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors pointer-events-none" />
                            </div>
                            {/* Images 2-5 (Small) */}
                            {validImages.slice(1, 5).map((img, idx) => (
                                <div key={idx} className="relative overflow-hidden group/item cursor-pointer">
                                    <Image
                                        src={img}
                                        alt={`${title} - ${idx + 2}`}
                                        rootClassName="w-full h-full"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        className="hover:scale-105 transition-transform duration-500 hover:brightness-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors pointer-events-none" />
                                </div>
                            ))}
                            {/* Remaining images hidden but accessible in gallery */}
                            {validImages.slice(5).map((img, idx) => (
                                <div key={idx} style={{ display: "none" }}>
                                    <Image src={img} alt={`${title} - Extra`} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Fallback if less than 5 images
                        <div className="h-[480px] relative overflow-hidden group/item cursor-pointer">
                            <Image
                                src={validImages[0]}
                                alt={title}
                                rootClassName="w-full h-full"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                className="hover:scale-105 transition-transform duration-500"
                            />
                            {validImages.slice(1).map((img, idx) => (
                                <div key={idx} style={{ display: "none" }}>
                                    <Image src={img} alt={`${title} - Extra`} />
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setLightboxOpen(true)}
                        className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 shadow-md transition-all active:scale-95 z-10"
                    >
                        <ExpandAltOutlined />
                        Hiển thị tất cả ảnh
                    </button>
                </div>

                {/* ── MOBILE CAROUSEL PORTION ── */}
                <div className="md:hidden relative mx-[-16px]">
                     <Swiper
                        modules={[Navigation]}
                        navigation={{
                            prevEl: '.mobile-prev',
                            nextEl: '.mobile-next',
                        }}
                        className="w-full h-[300px]"
                    >
                        {validImages.map((img, idx) => (
                            <SwiperSlide key={idx} className="cursor-pointer">
                                <img
                                    src={img}
                                    alt={`${title} - ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onClick={() => setLightboxOpen(true)}
                                />
                            </SwiperSlide>
                        ))}
                        
                        <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 text-white text-xs font-medium tracking-wide pointer-events-none">
                            1 / {validImages.length}
                        </div>
                    </Swiper>
                </div>
            </Image.PreviewGroup>
        </div>
    );
}
