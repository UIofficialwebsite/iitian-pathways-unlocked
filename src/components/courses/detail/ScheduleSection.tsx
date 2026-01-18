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
    // Handle generic or missing batch names
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
              // Logic: Show specific batch name if present and not "General"
              const showHeader = batchName && batchName !== "General" && batchName.trim() !== "";

              return (
                <div key={batchName} className="w-full">
                  {showHeader && (
                    <h3 className="text-lg font-semibold text-[#1a1f36] mb-3">
                      {batchName}
                    </h3>
                  )}
                  
                  {/* List of Subjects in Grey Boxes */}
                  <div className="flex flex-col gap-3">
                    {items.map((item) => (
                      <div 
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between p-4",
                          "bg-gray-50 border border-gray-100 rounded-lg", // Grey rectangular box style
                          "hover:bg-gray-100 transition-colors duration-200" // Subtle hover effect
                        )}
                      >
                        {/* Subject Name */}
                        <span className="text-[15px] text-[#1a1f36] font-medium leading-relaxed">
                          {item.subject_name}
                        </span>

                        {/* Download Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(item.file_link)}
                          className="ml-4 bg-white border-gray-200 hover:border-black hover:bg-white text-[#1a1f36]"
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
