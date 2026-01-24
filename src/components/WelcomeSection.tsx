import React from "react";
import { Button } from "@/components/ui/button";
import { useLoginModal } from "@/context/LoginModalContext";

const WelcomeSection = () => {
  const { openLogin } = useLoginModal();

  return (
    <section className="relative py-20 bg-white overflow-hidden font-['Inter',sans-serif]">
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="animate-fade-in-up">
            {/* Changed font-bold to font-semibold */}
            <h2 className="text-4xl sm:text-5xl font-semibold mb-6 leading-tight">
              <span className="text-gray-900">Student's Most </span>
              <span className="text-royal">Trusted</span><br />
              <span className="text-gray-900">Educational Platform</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 font-normal">
              Ignite Your Passion, Shape Your Future with Education!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={openLogin} 
                className="bg-royal hover:bg-royal-dark text-white px-8 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105 font-semibold"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Right Image - Removed hover effect */}
          <div className="relative flex justify-center lg:justify-end">
            <img
              src="https://res.cloudinary.com/dkywjijpv/image/upload/v1769285877/unnamed_12_jix7j5.png"
              alt="IITians Team"
              className="w-full h-auto max-h-[400px] object-contain transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
