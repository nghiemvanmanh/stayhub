"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { Navigation, Keyboard, Zoom, FreeMode, Thumbs } from "swiper/modules";
import { ExpandAltOutlined, CloseOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/zoom";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

interface PropertyImageGalleryProps {
    images: string[];
    title: string;
}

export default function PropertyImageGallery({ images, title }: PropertyImageGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
    
    // Safety check
    const validImages = Array.isArray(images) && images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80"];

    // Handle scroll lock when modal is open
    useEffect(() => {
        if (lightboxOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [lightboxOpen]);

    // Handle keyboard escape to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && lightboxOpen) {
                setLightboxOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [lightboxOpen]);

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
        // Ensure swiper goes to the right slide when opened
        if (mainSwiper && !mainSwiper.destroyed) {
            mainSwiper.slideTo(index, 0);
        }
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    return (
        <>
            {/* ── BENTO GRID PORTION (Desktop) & CAROUSEL (Mobile) ── */}
            
            {/* Desktop Bento Grid View */}
            <div className="hidden md:block relative rounded-2xl overflow-hidden mb-8 group">
                {validImages.length >= 5 ? (
                    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[480px]">
                        <div 
                            className="col-span-2 row-span-2 relative overflow-hidden cursor-pointer"
                            onClick={() => openLightbox(0)}
                        >
                            <img
                                src={validImages[0]}
                                alt={`${title} - 1`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 hover:brightness-110"
                            />
                            {/* Hover overlay hint */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                        </div>
                        {validImages.slice(1, 5).map((img, idx) => (
                            <div 
                                key={idx} 
                                className="relative overflow-hidden cursor-pointer group/item"
                                onClick={() => openLightbox(idx + 1)}
                            >
                                <img
                                    src={img}
                                    alt={`${title} - ${idx + 2}`}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 hover:brightness-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors pointer-events-none" />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Fallback if less than 5 images
                    <div className="h-[480px] relative overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
                        <img
                            src={validImages[0]}
                            alt={title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                )}
                
                <button
                    onClick={() => openLightbox(0)}
                    className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 shadow-md transition-all active:scale-95"
                >
                    <ExpandAltOutlined />
                    Hiển thị tất cả ảnh
                </button>
            </div>

            {/* Mobile Carousel View */}
            <div className="md:hidden relative mx-[-16px] mb-6">
                 <Swiper
                    modules={[Navigation]}
                    navigation={{
                        prevEl: '.mobile-prev',
                        nextEl: '.mobile-next',
                    }}
                    className="w-full h-[300px]"
                >
                    {validImages.map((img, idx) => (
                        <SwiperSlide key={idx} onClick={() => openLightbox(idx)}>
                            <img
                                src={img}
                                alt={`${title} - ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </SwiperSlide>
                    ))}
                    
                    {/* Tiny custom navigation dots could go here, but using absolute generic buttons for now */}
                    <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 text-white text-xs font-medium tracking-wide">
                        1 / {validImages.length}
                    </div>
                </Swiper>
            </div>


            {/* ── FULLSCREEN LIGHTBOX MODAL ── */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-[fadeIn_0.3s_ease-out]">
                    
                    {/* Header Controls */}
                    <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/70 to-transparent">
                        <div className="text-white/80 font-medium text-sm tracking-wide">
                            {currentIndex + 1} / {validImages.length}
                        </div>
                        <div className="flex gap-4 items-center">
                            <button className="text-white/80 hover:text-white text-sm hidden md:block">
                                Chia sẻ
                            </button>
                            <button className="text-white/80 hover:text-white text-sm hidden md:block">
                                Lưu
                            </button>
                            <button 
                                onClick={closeLightbox}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md ml-2"
                                aria-label="Close modal"
                            >
                                <CloseOutlined style={{ fontSize: 16 }} />
                            </button>
                        </div>
                    </div>

                    {/* Main Image Slider */}
                    <div className="flex-1 w-full h-full flex items-center justify-center relative pt-16 md:pt-0">
                        {/* Custom Navigation */}
                        <button className="gallery-prev hidden md:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white items-center justify-center backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <LeftOutlined style={{ fontSize: 18 }} />
                        </button>
                        
                        <button className="gallery-next hidden md:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white items-center justify-center backdrop-blur-md transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <RightOutlined style={{ fontSize: 18 }} />
                        </button>

                        <Swiper
                            onSwiper={setMainSwiper}
                            initialSlide={currentIndex}
                            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
                            spaceBetween={30}
                            navigation={{
                                prevEl: '.gallery-prev',
                                nextEl: '.gallery-next',
                            }}
                            keyboard={{ enabled: true }}
                            zoom={{ maxRatio: 3, minRatio: 1 }}
                            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                            modules={[Navigation, Keyboard, Zoom, Thumbs]}
                            className="w-full h-full max-w-6xl"
                        >
                            {validImages.map((img, idx) => (
                                <SwiperSlide key={idx} className="flex items-center justify-center p-4 md:p-12 overflow-hidden">
                                    <div className="swiper-zoom-container relative w-full h-full flex items-center justify-center">
                                        <img
                                            src={img}
                                            alt={`${title} - ${idx + 1}`}
                                            className="max-h-full max-w-full object-contain rounded-sm select-none"
                                            draggable={false}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Thumbnail Strip (Desktop Only) */}
                    <div className="hidden md:block h-28 pb-6 px-12 z-50 w-full max-w-4xl mx-auto">
                        <Swiper
                            onSwiper={setThumbsSwiper}
                            spaceBetween={8}
                            slidesPerView="auto"
                            freeMode={true}
                            watchSlidesProgress={true}
                            modules={[FreeMode, Navigation, Thumbs]}
                            className="h-full thumbs-slider"
                        >
                            {validImages.map((img, idx) => (
                                <SwiperSlide 
                                     key={idx} 
                                     className={`!w-auto cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 opacity-60 hover:opacity-100 ${
                                         currentIndex === idx ? "border-white opacity-100 scale-105" : "border-transparent"
                                     }`}
                                >
                                     <div className="w-[100px] sm:w-[120px] aspect-[4/3]">
                                         <img
                                             src={img}
                                             alt={`Thumbnail ${idx + 1}`}
                                             className="w-full h-full object-cover"
                                         />
                                     </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            )}

            {/* Sub-component styles to handle custom swiper behavior if needed */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                .swiper-slide-thumb-active {
                    opacity: 1 !important;
                }
            `}} />
        </>
    );
}
