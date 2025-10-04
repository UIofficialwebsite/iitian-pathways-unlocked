import React from "react";
import NavBar from "@/components/NavBar";
import HeroCarousel from "@/components/HeroCarousel";
import WelcomeSection from "@/components/WelcomeSection";
import CategoriesSection from "@/components/CategoriesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import ResourceHubSection from "@/components/ResourceHubSection";
// Removed: import PartnershipsSection from "@/components/PartnershipsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
// import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";

const Index = () => {
  return (
    <>
      <NavBar />
      <HeroCarousel />
      <WelcomeSection />
      <CategoriesSection />
      <WhyChooseUsSection />
      <ResourceHubSection />
      {/* Removed: <PartnershipsSection /> */}
      <TestimonialsSection />
      {/* <NewsletterSection /> */}
      <Footer />
      <EmailPopup />
    </>
  );
};

export default Index;
