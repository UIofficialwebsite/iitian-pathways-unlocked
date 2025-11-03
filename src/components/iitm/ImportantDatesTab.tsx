
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { ShareButton } from "../ShareButton";

const ImportantDatesTab = () => {
  const { importantDates, contentLoading } = useBackend();

  // Filter dates for IITM BS
  const iitmDates = importantDates.filter(date => 
    date.exam_type === 'IITM_BS' || date.exam_type === 'IITM BS' || !date.exam_type
  );

  if (contentLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {iitmDates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No important dates available for IITM BS at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
            {iitmDates.map((date) => (
                <Card key={date.id} className={`flex ${date.is_highlighted ? 'border-royal border-2' : ''}`}>
                    <div className="p-4 bg-royal/10 flex flex-col items-center justify-center rounded-l-lg min-w-[80px]">
                        <span className="text-royal text-2xl font-bold">{new Date(date.date_value).getDate()}</span>
                        <span className="text-royal text-sm uppercase">{new Date(date.date_value).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-base font-semibold">{date.title}</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">{date.description}</p>
                            </div>
                            <ShareButton
                                url={window.location.href}
                                title={date.title}
                                description={date.description}
                                size="sm"
                                variant="ghost"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {date.category && <Badge variant="outline">{date.category}</Badge>}
                            {date.tag && <Badge variant="secondary">{date.tag}</Badge>}
                            {date.branch && <Badge variant="outline">{date.branch}</Badge>}
                            {date.level && <Badge variant="outline">{date.level}</Badge>}
                            {date.is_highlighted && <Badge className="bg-royal text-white">Highlighted</Badge>}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default ImportantDatesTab;
