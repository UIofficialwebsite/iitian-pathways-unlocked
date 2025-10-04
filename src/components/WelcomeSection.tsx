import React from "react";
import { Button } from "@/components/ui/button";

const WelcomeSection = () => {
  return (
    <section className="relative py-20 bg-gradient-to-r from-indigo-50 via-white to-purple-50 overflow-hidden">
      {/* Background floating blobs */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-royal/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-56 h-56 bg-purple-300/30 rounded-full blur-3xl animate-bounce-slow"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="animate-fade-in-up">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-gray-900">Student's Most </span>
              <span className="text-royal">Trusted</span><br />
              <span className="text-gray-900">Educational Platform</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Ignite Your Passion, Shape Your Future with Education!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-royal hover:bg-royal-dark text-white px-8 py-2 rounded-full shadow-lg transition-transform transform hover:scale-105">
                Get Started
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-float">
            {/* The soft gradient background div has been removed. */}
            
            <img
              src="/lovable-uploads/uibanner.png"
              alt="Unknown IITians Team"
              className="w-full h-auto max-h-96 object-cover transform hover:scale-105 transition-all duration-500"
              // Removed: rounded-2xl, shadow-xl
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
