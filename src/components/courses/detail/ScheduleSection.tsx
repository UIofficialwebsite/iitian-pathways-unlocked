import React from 'react';
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
  // Group schedule by batch_name
  const groupedSchedule = scheduleData.reduce((acc, item) => {
    // Handle generic or missing batch names if necessary, 
    // but here we group by whatever is in the DB.
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

  return (
    <section id="schedule" className="w-full scroll-mt-24">
      {/* Container "Holding" Section - White Background, Border, Rounded */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-10 w-full shadow-sm">
        
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#1a1f36]">
          Schedule
        </h2>
        
        {scheduleData.length === 0 ? (
          <div className="text-[#1a1f36] text-[15px] font-normal">
            Schedule information will be available soon.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedule).map(([batchName, items]) => {
              // Logic: "if batch name not written then simply ignoe"
              // We check if batchName is "General" (our fallback) or empty string.
              // If it's a specific name, we show it.
              const showHeader = batchName && batchName !== "General" && batchName.trim() !== "";

              return (
                <div key={batchName} className="w-full">
                  {showHeader && (
                    <h3 className="text-lg font-semibold text-[#1a1f36] mb-3">
                      {batchName}
                    </h3>
                  )}
                  
                  <div className="flex flex-col">
                    {items.map((item, idx) => (
                      <div 
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between py-4",
                          "border-b border-[#e3e8ee]",
                          idx === 0 && !showHeader && "pt-0", // Adjust top padding if no header
                          idx === items.length - 1 && "border-b-0 pb-0" // Remove border for last item
                        )}
                      >
                        {/* Subject Name - Clean Text */}
                        <span className="text-[15px] text-[#1a1f36] font-normal leading-relaxed">
                          {item.subject_name}
                        </span>

                        {/* Download Button - No Icon */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(item.file_link)}
                          className="ml-4 border-gray-300 hover:border-black hover:bg-transparent text-[#1a1f36]"
                        >
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
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
