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
      <section id="schedule" className="py-12 scroll-mt-24">
        <h2 className="text-3xl font-bold mb-8 text-slate-100">Schedule</h2>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Schedule information will be available soon.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="schedule" className="py-12 scroll-mt-24">
      <h2 className="text-3xl font-bold mb-8 text-slate-100">Schedule</h2>
      
      <div className="space-y-6">
        {Object.entries(groupedSchedule).map(([batchName, items]) => (
          <Card key={batchName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {batchName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">{item.subject_name}</p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownload(item.file_link, item.subject_name)}
                      className="ml-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ScheduleSection;
