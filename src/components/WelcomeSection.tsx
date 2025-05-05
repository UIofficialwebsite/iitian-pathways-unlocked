
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const WelcomeSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="text-gray-900">Student's Most </span>
              <span className="text-royal">Trusted</span><br />
              <span className="text-gray-900">Educational Website</span>
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

          <div className="rounded-xl overflow-hidden shadow-premium animate-scale-in">
            <img
              src="public/lovable-uploads/405d5af3-0247-48f7-801c-9679d733739c.png"
              alt="Unknown IITians Team"
              className="w-full h-auto object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
