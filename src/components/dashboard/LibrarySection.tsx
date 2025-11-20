import React from 'react';
import { BouncingDots } from "@/components/ui/bouncing-dots";

const LibrarySection = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] w-full font-sans animate-in fade-in zoom-in-95 duration-300">
      {/* Bouncing Dots Animation */}
      <BouncingDots className="bg-royal w-3 h-3" />
      
      {/* Main Heading */}
      <h3 className="mt-6 text-xl font-bold text-gray-900 text-center tracking-tight px-4">
        Hang tight, we are preparing the best contents for you
      </h3>
      
      {/* Sub-line */}
      <p className="mt-2 text-base text-gray-500 font-medium text-center">
        Just wait and love the moment
      </p>
    </div>
  );
};

export default LibrarySection;
