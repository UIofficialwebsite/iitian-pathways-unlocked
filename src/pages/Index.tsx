import React from "react";
import NavBar from "@/components/NavBar";
import HeroCarousel from "@/components/HeroCarousel";
import WelcomeSection from "@/components/WelcomeSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import IITMBSNotesSection from "@/components/IITMBSNotesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar"; // Fixed: Changed to named import
import FloatingAnnouncementToggle from "@/components/FloatingAnnouncementToggle";
import VideoSection from "@/components/VideoSection";
import PartnershipsSection from "@/components/PartnershipsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <NavBar />
      
      <main>
        <HeroCarousel />
        <WelcomeSection />
        <WhyChooseUsSection />
        <VideoSection />
        
        {/* Testimonials Section (Placed before Study Material) */}
        <TestimonialsSection />

        {/* Study Material Section */}
        <div id="study-material">
          <IITMBSNotesSection />
        </div>

        <PartnershipsSection />
        <NewsletterSection />
      </main>

      <Footer />
      <FloatingAnnouncementToggle />
    </div>
  );
};

export default Index;
