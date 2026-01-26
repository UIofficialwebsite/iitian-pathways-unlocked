import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const HeroCarousel = ({ pagePath = "/" }: { pagePath?: string }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [banners, setBanners] = useState<{ image_url: string; id: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('page_banners')
          .select('*')
          .eq('page_path', pagePath);

        if (data) {
          setBanners(data);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [pagePath]);

  // Map database banners to the format expected by the carousel
  const carouselImages = banners.map(banner => ({
    src: banner.image_url,
    alt: "Banner", // Default alt text as it's not in the table
  }));

  const length = carouselImages.length;

  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  // Auto-advance the carousel
  useEffect(() => {
    if (length === 0) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [current, length]);

  if (loading) {
    return <div className="w-full h-[300px] sm:h-[350px] mt-16 animate-pulse bg-gray-200" />;
  }

  if (!carouselImages.length) {
    return null;
  }

  return (
    <div 
      className="relative w-full h-[300px] sm:h-[350px] mt-16"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Vignette overlay when hovered */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-10 pointer-events-none" />
      )}
      
      {/* Navigation buttons - only visible on hover */}
      {isHovered && length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 z-20 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full p-3 transition-all duration-300 shadow-lg"
            onClick={prevSlide}
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
          <button
            className="absolute right-4 top-1/2 z-20 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full p-3 transition-all duration-300 shadow-lg"
            onClick={nextSlide}
          >
            <ChevronRight size={24} className="text-gray-800" />
          </button>
        </>
      )}

      {/* Carousel images */}
      {carouselImages.map((image, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-all duration-700 ease-in-out ${
            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          style={{ zIndex: index === current ? 1 : 0 }}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
      ))}

      {/* Navigation dots - positioned below carousel */}
      {length > 1 && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === current 
                  ? "bg-royal scale-125 shadow-md" 
                  : "bg-gray-400 hover:bg-gray-600"
              }`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
