import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ScheduleData {
    day: string;
    classes: {
        time: string;
        subject: string;
        topic: string;
        file_link?: string;
    }[];
}

interface ScheduleSectionProps {
    schedule: ScheduleData[];
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ schedule }) => {
    // This check prevents the "Cannot read properties of undefined (reading 'reduce')" error.
    if (!schedule || schedule.length === 0) {
        return (
            <section>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Class Schedule</h2>
                <p className="text-gray-600">The schedule for this course is not yet available. Please check back soon.</p>
            </section>
        );
    }
    
    // This block will now only run when 'schedule' is a valid array.
    const groupedSchedule = schedule.reduce((acc, current) => {
        const day = current.day;
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(...current.classes);
        return acc;
    }, {} as Record<string, ScheduleData['classes']>);

    return (
        <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Class Schedule</h2>
            <div className="space-y-6">
                {Object.entries(groupedSchedule).map(([day, classes]) => (
                    <Card key={day} className="overflow-hidden">
                        <CardHeader className="bg-gray-100 p-4">
                            <CardTitle className="text-lg flex items-center">
                                <Calendar className="w-5 h-5 mr-3 text-blue-600"/>
                                {day}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                           <div className="divide-y">
                                {classes.map((classItem, index) => (
                                    <div key={index} className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 items-center">
                                        <div className="font-semibold text-gray-900">{classItem.subject}</div>
                                        <div className="text-gray-600">{classItem.topic}</div>
                                        {classItem.file_link && (
                                            <a 
                                                href={classItem.file_link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="md:col-start-3"
                                            >
                                                <Button variant="outline" size="sm" className="w-full md:w-auto">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    View Notes
                                                </Button>
                                            </a>
                                        )}
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
