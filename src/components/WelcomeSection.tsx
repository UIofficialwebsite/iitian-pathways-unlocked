import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const WelcomeSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*
          ACTION: Re-enabling 'items-stretch'. This is crucial as it forces the image column
          to match the height of the text column, eliminating unwanted whitespace (the "frame") above or below.
        */}
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

          {/*
            ACTION: Ensure the image container fills its height and hides any minor overflow.
          */}
          <div className="animate-scale-in h-full overflow-hidden">
            <img
              src="/lovable-uploads/uibanner.png"
              alt="Unknown IITians Team"
              {/*
                ACTION: The most aggressive image fill properties.
                - w-full h-full: Ensures it occupies 100% of the space.
                - object-cover: Maintains aspect ratio while guaranteeing the space is COVERED.
                - block: Removes any residual browser-default inline spacing below the image.
              */}
              className="w-full h-full object-cover block"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
