import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface BatchScheduleItem {
  id: string;
  course_id: string;
  batch_name: string;
  subject_name: string;
  file_link: string;
}

interface ScheduleSectionProps {
  scheduleData: BatchScheduleItem[];
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ scheduleData }) => {
  // State to track which batches are expanded
  const [expandedBatches, setExpandedBatches] = useState<Record<string, boolean>>({});

  // Define a palette of light colors to cycle through
  const scheduleColors = [
    { bg: "bg-blue-50", border: "border-blue-100", hover: "hover:border-blue-300" },
    { bg: "bg-yellow-50", border: "border-yellow-100", hover: "hover:border-yellow-300" },
    { bg: "bg-green-50", border: "border-green-100", hover: "hover:border-green-300" },
    { bg: "bg-purple-50", border: "border-purple-100", hover: "hover:border-purple-300" },
    { bg: "bg-pink-50", border: "border-pink-100", hover: "hover:border-pink-300" },
    { bg: "bg-orange-50", border: "border-orange-100", hover: "hover:border-orange-300" },
  ];

  // Group schedule by batch_name
  const groupedSchedule = scheduleData.reduce((acc, item) => {
    const key = item.batch_name || "General"; 
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, BatchScheduleItem[]>);

  const handleDownload = (fileLink: string) => {
    window.open(fileLink, '_blank');
  };

  const toggleBatch = (batchName: string) => {
    setExpandedBatches(prev => ({
      ...prev,
      [batchName]: !prev[batchName]
    }));
  };

  return (
    <section id="schedule" className="w-full scroll-mt-24">
      {/* Container "Holding" Section */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-10 w-full shadow-sm">
        
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#1a1f36]">
          Batch Schedules
        </h2>
        
        {scheduleData.length === 0 ? (
          <div className="text-[#1a1f36] text-[15px] font-normal">
            Schedule information will be available soon.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSchedule).map(([batchName, items]) => {
              const showHeader = batchName && batchName !== "General" && batchName.trim() !== "";
              const isExpanded = expandedBatches[batchName] || false;
              
              // Logic: Show 3 initially, or all if expanded
              const visibleItems = isExpanded ? items : items.slice(0, 3);
              const remainingCount = items.length - 3;
              const hasMore = items.length > 3;

              return (
                <div key={batchName} className="w-full">
                  {showHeader && (
                    <h3 className="text-lg font-semibold text-[#1a1f36] mb-3">
                      {batchName}
                    </h3>
                  )}
                  
                  {/* List of Subjects */}
                  <div className="flex flex-col gap-3">
                    {visibleItems.map((item, idx) => {
                      // Cycle through colors based on index
                      const colorTheme = scheduleColors[idx % scheduleColors.length];
                      
                      return (
                        <div 
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between p-5",
                            // Apply dynamic light colors
                            colorTheme.bg,
                            "border", colorTheme.border,
                            "rounded-xl", 
                            "transition-all duration-200 shadow-sm",
                            colorTheme.hover // Subtle border darken on hover
                          )}
                        >
                          {/* Subject Name */}
                          <span className="text-[16px] text-[#1a1f36] font-medium leading-relaxed">
                            {item.subject_name}
                          </span>

                          {/* Download Button - Big Type, Black Filled */}
                          <Button
                            onClick={() => handleDownload(item.file_link)}
                            className={cn(
                              "ml-4 bg-black text-white hover:bg-black/90",
                              "h-11 px-8 min-w-[140px]", 
                              "text-base font-medium rounded-lg shadow-none"
                            )}
                          >
                            Download
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {/* "More Subjects" Button */}
                  {hasMore && (
                    <Button
                      variant="outline"
                      onClick={() => toggleBatch(batchName)}
                      className={cn(
                        "w-full mt-3 h-12",
                        "bg-white border border-black text-black", 
                        "hover:bg-gray-50 transition-colors text-base font-medium"
                      )}
                    >
                      {isExpanded ? "Show Less" : `${remainingCount}+ more subjects`}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default ScheduleSection;
