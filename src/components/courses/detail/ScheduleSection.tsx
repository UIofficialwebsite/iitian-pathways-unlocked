import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";

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
    if (!acc[item.batch_name]) {
      acc[item.batch_name] = [];
    }
    acc[item.batch_name].push(item);
    return acc;
  }, {} as Record<string, BatchScheduleItem[]>);

  const handleDownload = (fileLink: string, subjectName: string) => {
    window.open(fileLink, '_blank');
  };

  if (scheduleData.length === 0) {
    return (
      <section id="schedule" className="scroll-mt-24">
        <Card className="border border-border/60 shadow-sm">
          <CardContent className="p-5 md:p-6 lg:p-8">
            <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-6">Schedule</h2>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Schedule information will be available soon.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="schedule" className="scroll-mt-24">
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-5 md:p-6 lg:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-6">Schedule</h2>
          <div className="space-y-5">
            {Object.entries(groupedSchedule).map(([batchName, items]) => (
              <div key={batchName} className="rounded-lg border border-border/40 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/40">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm md:text-base">{batchName}</span>
                </div>
                <div className="divide-y divide-border/30">
                  {items.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <p className="font-medium text-sm md:text-base">{item.subject_name}</p>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(item.file_link, item.subject_name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ScheduleSection;
