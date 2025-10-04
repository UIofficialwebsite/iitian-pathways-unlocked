import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const WelcomeSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CHANGE: Added 'items-stretch' to ensure both columns have equal height. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <div className="animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-gray-900">Student's Most </span>
              <span className="text-royal">Trusted</span><br />
              <span className="text-gray-900">Educational Platform</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Ignite Your Passion, Shape Your Future with Education!
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-royal hover:bg-royal-dark text-white px-8 py-2 rounded-full">
                Get Started
              </Button>
            </div>
          </div>

          {/* Ensured container fills all height and hides overflow */}
          <div className="animate-scale-in h-full overflow-hidden">
            <img
              src="/lovable-uploads/uibanner.png"
              alt="Unknown IITians Team"
              {/* FINAL FIX: Removed 'object-cover'. The image is now forced to fill 100% of the available width and height (w-full h-full block), eliminating all frame/background remnants. */}
              className="w-full h-full block"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
