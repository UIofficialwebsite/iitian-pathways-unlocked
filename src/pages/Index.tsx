import React from "react";
import NavBar from "@/components/NavBar";
import HeroCarousel from "@/components/HeroCarousel";
import WelcomeSection from "@/components/WelcomeSection";
import CategoriesSection from "@/components/CategoriesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import ResourceHubSection from "@/components/ResourceHubSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";

const Index = () => {
  return (
    <>
      <NavBar />
      {/* AnnouncementBar removed from here to prevent it showing at the top */}
      <HeroCarousel />
      <WelcomeSection />
      <CategoriesSection />
      <WhyChooseUsSection />
      <ResourceHubSection />
      <TestimonialsSection />
      <Footer />
      <EmailPopup />
    </>
  );
};

export default Index;
