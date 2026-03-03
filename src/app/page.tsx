"use client";

import Header from "@/components/Header";
import HeroSection from "@/components/home/HeroSection";
import CategoryBar from "@/components/home/CategoryBar";
import FeaturedListings from "@/components/home/FeaturedListings";
import HowItWorks from "@/components/home/HowItWorks";
import BecomeHost from "@/components/home/BecomeHost";
import Testimonials from "@/components/home/Testimonials";
import PromoBanner from "@/components/home/PromoBanner";
import Footer from "@/components/Footer";
import { useState } from "react";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>("1");

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CategoryBar 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />
      <FeaturedListings categoryId={activeCategory} />
      <HowItWorks />
      <BecomeHost />
      <Testimonials />
      <PromoBanner />
      <Footer />
    </div>
  );
}
