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
        
        {/* Updated Heading */}
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
                    {visibleItems.map((item) => (
                      <div 
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between p-4",
                          "bg-gray-50 border border-gray-100 rounded-lg", // Light colour subject bar
                          "transition-colors duration-200"
                        )}
                      >
                        {/* Subject Name */}
                        <span className="text-[15px] text-[#1a1f36] font-medium leading-relaxed">
                          {item.subject_name}
                        </span>

                        {/* Download Button - Black Filled */}
                        <Button
                          size="sm"
                          onClick={() => handleDownload(item.file_link)}
                          className="ml-4 bg-black text-white hover:bg-black/90 border-transparent shadow-none"
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* "More Subjects" Button */}
                  {hasMore && (
                    <Button
                      variant="outline"
                      onClick={() => toggleBatch(batchName)}
                      className={cn(
                        "w-full mt-3",
                        "bg-white border border-black text-black", // White box, black outline
                        "hover:bg-gray-50 transition-colors"
                      )}
                    >
                      {isExpanded ? "Show Less" : `${remainingCount} more subjects`}
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
