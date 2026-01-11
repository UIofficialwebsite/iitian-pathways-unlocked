import React, { useState } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnouncementBar } from "./AnnouncementBar";

const FloatingAnnouncementToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4">
      {/* Announcement pop-up appears above the arrow button */}
      {isOpen && (
        <div className="w-[320px] sm:w-[400px]">
          <AnnouncementBar isFloating={true} onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating Action Button (Arrow Up) */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-royal shadow-2xl hover:bg-royal-dark text-white p-0 flex items-center justify-center transition-all active:scale-95 border-2 border-white"
      >
        <ChevronUp 
          className={`h-8 w-8 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </Button>
    </div>
  );
};

export default FloatingAnnouncementToggle;
