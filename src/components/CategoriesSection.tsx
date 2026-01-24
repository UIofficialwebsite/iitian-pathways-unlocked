import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "NEET",
    tags: ["Class 11", "Class 12", "Dropper"],
    link: "/exam-preparation/neet",
    // Mobile: Static purple fade (Bottom Right)
    mobileFade: "bg-[radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.15),transparent_70%)]",
    // PC: Semi-Circle Glow from Top Right
    desktopGlow: "bg-purple-50", // Base color for the arc
    desktopGlowHover: "group-hover:bg-purple-100", // Darker glow on hover
  },
  {
    title: "JEE",
    tags: ["Class 11", "Class 12", "Dropper"],
    link: "/exam-preparation/jee",
    // Mobile: Static blue fade (Bottom Right)
    mobileFade: "bg-[radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.15),transparent_70%)]",
    // PC: Semi-Circle Glow from Top Right
    desktopGlow: "bg-blue-50",
    desktopGlowHover: "group-hover:bg-blue-100",
  },
  {
    title: "IITM BS",
    tags: ["Data Science", "Electronic Systems"],
    link: "/exam-preparation/iitm-bs",
    // Mobile: Static green fade (Bottom Right)
    mobileFade: "bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.15),transparent_70%)]",
    // PC: Semi-Circle Glow from Top Right
    desktopGlow: "bg-emerald-50",
    desktopGlowHover: "group-hover:bg-emerald-100",
  },
];

const CategoriesSection = () => {
  return (
    <section className="py-20 bg-white font-['Inter',sans-serif]">
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
              className="group relative block h-[260px] bg-white border border-gray-200 rounded-xl p-8 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-gray-300 flex flex-col justify-between"
            >
              {/* --- MOBILE: Static Corner Fade (Bottom Right - Unchanged) --- */}
              <div 
                className={`absolute inset-0 pointer-events-none md:hidden ${category.mobileFade}`} 
              />

              {/* --- PC: Semi-Circle Arc Pattern (Top Right to Bottom) --- 
                  - Positioned at -top-24 -right-24 to create a large arc 
                  - Initially visible (desktopGlow)
                  - Glows/Expands on hover (scale-110)
              */}
              <div 
                className={`hidden md:block absolute -top-24 -right-24 w-[300px] h-[300px] rounded-full blur-3xl transition-all duration-500 ease-out transform pointer-events-none opacity-60 group-hover:scale-125 group-hover:opacity-100 ${category.desktopGlow} ${category.desktopGlowHover}`} 
              />
              
              {/* Optional: A sharper arc line for the "pattern" feel */}
              <div 
                className={`hidden md:block absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full border-[1.5px] border-dashed border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
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

                {/* Footer: Monochrome Black/White Design */}
                <div className="mt-auto flex items-center justify-between">
                  {/* Text: Always Black */}
                  <span className="text-[15px] font-medium text-gray-900 transition-colors duration-300">
                    Explore Resources 
                  </span>
                  
                  {/* Arrow Circle: 
                      - Initial: White bg, Gray border, Black Arrow
                      - Hover: Fills Black, White Arrow
                  */}
                  <span className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:shadow-none group-hover:scale-105">
                    <ArrowRight className="h-5 w-5 text-gray-900 transition-colors duration-300 group-hover:text-white" />
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
