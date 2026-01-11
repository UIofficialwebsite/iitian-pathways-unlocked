import React from "react";
import NavBar from "@/components/NavBar";
import HeroCarousel from "@/components/HeroCarousel";
import WelcomeSection from "@/components/WelcomeSection";
import CategoriesSection from "@/components/CategoriesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import ResourceHubSection from "@/components/ResourceHubSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <NavBar />
      <HeroCarousel />
      <WelcomeSection />
      <CategoriesSection />
      <WhyChooseUsSection />
      <ResourceHubSection />
      <TestimonialsSection />
      <Footer />
    </>
  );
};

export default Index;
