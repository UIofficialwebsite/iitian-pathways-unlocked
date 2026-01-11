import React, { useState } from "react";
import { ChevronUp } from "lucide-react";
import { AnnouncementBar } from "./AnnouncementBar";

const FloatingAnnouncementToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Announcement pop-up appears above the arrow button */}
      {isOpen && (
        <div className="w-[320px] sm:w-[400px]">
          <AnnouncementBar isFloating={true} onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Simple black arrow icon - no background */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 transition-all hover:scale-110 active:scale-95"
        aria-label="Toggle announcements"
      >
        <ChevronUp 
          className={`h-8 w-8 text-black transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
    </div>
  );
};

export default FloatingAnnouncementToggle;
