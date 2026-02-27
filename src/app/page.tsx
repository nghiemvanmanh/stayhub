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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <CategoryBar />
      <FeaturedListings />
      <HowItWorks />
      <BecomeHost />
      <Testimonials />
      <PromoBanner />
      <Footer />
    </div>
  );
}
