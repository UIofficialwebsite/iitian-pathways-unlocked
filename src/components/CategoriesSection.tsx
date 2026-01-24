import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "NEET",
    tags: ["Class 11", "Class 12", "Dropper"],
    link: "/exam-preparation/neet",
    // Mobile: Static purple fade
    mobileFade: "bg-[radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.12),transparent_70%)]",
    // Desktop: Expanding violet circle
    desktopFade: "bg-[#f5f3ff]",
    // Theme Colors
    theme: {
      text: "text-purple-600",
      border: "border-purple-200",
      hoverBg: "group-hover:bg-purple-600",
      hoverBorder: "group-hover:border-purple-600",
      lightBorder: "group-hover:border-purple-100", // Subtle border change for card
    }
  },
  {
    title: "JEE",
    tags: ["Class 11", "Class 12", "Dropper"],
    link: "/exam-preparation/jee",
    // Mobile: Static blue fade
    mobileFade: "bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.12),transparent_70%)]",
    // Desktop: Expanding blue circle
    desktopFade: "bg-[#eff6ff]",
    // Theme Colors
    theme: {
      text: "text-blue-600",
      border: "border-blue-200",
      hoverBg: "group-hover:bg-blue-600",
      hoverBorder: "group-hover:border-blue-600",
      lightBorder: "group-hover:border-blue-100",
    }
  },
  {
    title: "IITM BS",
    tags: ["Data Science", "Electronic Systems"],
    link: "/exam-preparation/iitm-bs",
    // Mobile: Static green fade
    mobileFade: "bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_70%)]",
    // Desktop: Expanding green circle
    desktopFade: "bg-[#f0fdf4]",
    // Theme Colors
    theme: {
      text: "text-emerald-600",
      border: "border-emerald-200",
      hoverBg: "group-hover:bg-emerald-600",
      hoverBorder: "group-hover:border-emerald-600",
      lightBorder: "group-hover:border-emerald-100",
    }
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-gray-50 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Header Section --- */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900">Explore Our Categories</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Find specialized resources designed for your specific exam preparation needs
          </p>
        </div>

        {/* --- Card Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link 
              to={category.link} 
              key={index} 
              className={`group relative block h-[260px] bg-white border border-gray-200 rounded-xl p-8 overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${category.theme.lightBorder}`}
            >
              {/* --- MOBILE: Static Corner Fade (Always Visible) --- */}
              <div 
                className={`absolute inset-0 pointer-events-none md:hidden ${category.mobileFade}`} 
              />

              {/* --- PC: Hover Spread Effect (Expands on Hover) --- */}
              <div 
                className={`hidden md:block absolute top-1/2 left-1/2 w-[150%] h-[150%] rounded-full ${category.desktopFade} transform -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-500 ease-out pointer-events-none`} 
              />

              {/* --- Card Content --- */}
              <div className="relative z-10 flex flex-col h-full">
                <div>
                  <h3 className="text-[26px] font-semibold text-gray-900 mb-6 tracking-tight">
                    {category.title}
                  </h3>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {category.tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="bg-gray-50 border border-gray-200 text-gray-600 text-[13px] px-3.5 py-1.5 rounded-md font-medium transition-colors duration-300 group-hover:bg-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Explore Text + Colored Convex Arrow Circle */}
                <div className="mt-auto flex items-center justify-between">
                  <span className={`text-[15px] font-medium transition-colors duration-300 ${category.theme.text} group-hover:text-gray-900`}>
                    Explore Resources 
                  </span>
                  
                  {/* The Arrow Circle: 
                      1. Initially: Colored Border & Colored Icon
                      2. PC Hover: Fills with Color & White Icon
                  */}
                  <span className={`flex items-center justify-center w-10 h-10 rounded-full border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 ${category.theme.border} ${category.theme.hoverBg} ${category.theme.hoverBorder} group-hover:shadow-none group-hover:scale-105`}>
                    <ArrowRight className={`h-5 w-5 transition-colors duration-300 ${category.theme.text} group-hover:text-white`} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
