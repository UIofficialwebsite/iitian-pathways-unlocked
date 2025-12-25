import React from "react";

const SlidersIcon = ({ className = "w-5 h-5" }: { className?: string }) => {
  return (
    <div className={`flex flex-col justify-center gap-[6px] ${className}`}>
      {/* Top Track */}
      <div className="relative h-[3px] bg-[#1a1d21] rounded-full w-full">
        <div className="absolute top-1/2 right-1 -translate-y-1/2 w-[6px] h-[6px] bg-white border-[2px] border-[#1a1d21] rounded-full" />
      </div>
      {/* Bottom Track */}
      <div className="relative h-[3px] bg-[#1a1d21] rounded-full w-full">
        <div className="absolute top-1/2 left-1 -translate-y-1/2 w-[6px] h-[6px] bg-white border-[2px] border-[#1a1d21] rounded-full" />
      </div>
    </div>
  );
};

export default SlidersIcon;
