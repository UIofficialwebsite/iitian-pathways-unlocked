import React from "react";
import { Button } from "@/components/ui/button";
import { useLoginModal } from "@/context/LoginModalContext"; // Import the login hook

const WelcomeSection = () => {
  const { openLogin } = useLoginModal(); // Access the openLogin function

  return (
    // Enforcing Inter font and white background
    <section className="relative py-20 bg-white overflow-hidden font-['Inter',sans-serif]">
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">Student's Most </span>
              <span className="text-royal">Trusted</span><br />
              <span className="text-gray-900">Educational Platform</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Ignite Your Passion, Shape Your Future with Education!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={openLogin} // Triggers the Login Popup
                className="bg-royal hover:bg-royal-dark text-white px-8 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                Get Started
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center lg:justify-end">
            <img
              src="https://res.cloudinary.com/dkywjijpv/image/upload/v1769285877/unnamed_12_jix7j5.png"
              alt="IITians Team"
              className="w-full h-auto max-h-[400px] object-contain transform hover:scale-105 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
