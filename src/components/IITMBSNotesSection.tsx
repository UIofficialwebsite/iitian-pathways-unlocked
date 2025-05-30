
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Note {
  id: string;
  title: string;
  description: string;
  week: number;
}

interface SubjectNotesProps {
  subject: string;
  notes: Note[];
  downloads: Record<string, number>;
  onDownload: (id: string) => void;
}

const IITMBSNotesSection = ({ subject, notes, downloads, onDownload }: SubjectNotesProps) => {
  const [selectedWeek, setSelectedWeek] = useState<string>("all");

  // Create an array of week numbers (1-12)
  const weeks = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  // Filter notes by selected week
  const filteredNotes = selectedWeek === "all" 
    ? notes 
    : notes.filter(note => note.week === parseInt(selectedWeek));

  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4 capitalize">{subject}</h2>
      
      <div className="mb-6 max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Week</label>
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Weeks</SelectItem>
            {weeks.map(week => (
              <SelectItem key={week} value={week}>Week {week}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="border-none shadow-md hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-lg">{note.title}</CardTitle>
              <CardDescription>{note.description}</CardDescription>
              <div className="mt-1">
                <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                  Week {note.week}
                </span>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between">
              <Button
                onClick={() => onDownload(note.id)}
                className="bg-royal hover:bg-royal-dark text-white"
              >
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
              <div className="flex items-center">
                <span className="text-sm text-gray-500">{downloads[note.id] || 0}</span>
                <div className="ml-2 bg-gray-200 h-1.5 w-16 rounded-full overflow-hidden">
                  <div 
                    className="bg-royal h-full rounded-full" 
                    style={{ width: `${Math.min(100, ((downloads[note.id] || 0) / 100) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
        
        {filteredNotes.length === 0 && (
          <div className="col-span-3 text-center py-6 text-gray-500">
            No notes available for the selected week.
          </div>
        )}
      </div>
    </div>
  );
};

export default IITMBSNotesSection;
