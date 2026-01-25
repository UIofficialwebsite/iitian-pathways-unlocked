import React from "react";
import NavBar from "@/components/NavBar";
import HeroCarousel from "@/components/HeroCarousel";
import WelcomeSection from "@/components/WelcomeSection";
import CategoriesSection from "@/components/CategoriesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ResourceHubSection from "@/components/ResourceHubSection";
import Footer from "@/components/Footer";
import FloatingAnnouncementToggle from "@/components/FloatingAnnouncementToggle";

const Index = () => {
  return (
    <>
      <NavBar />
      <HeroCarousel />
      <WelcomeSection />
      <CategoriesSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <ResourceHubSection />
      <Footer />
      <FloatingAnnouncementToggle />
    </>
  );
};

export default Index;
