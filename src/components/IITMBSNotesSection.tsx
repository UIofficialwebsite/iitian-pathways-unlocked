import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useBackend } from "@/components/BackendIntegratedWrapper";

interface Note {
  id: string;
  title: string;
  description: string;
  week: number;
  subject?: string;
  exam_type?: string; // Added to handle exam_type safely
  file_link?: string;
  download_count?: number;
}

interface SubjectNotesProps {
  subject: string;
  notes?: Note[];
  downloads?: Record<string, number>;
  onDownload?: (id: string) => void;
}

const IITMBSNotesSection = ({ subject, notes: propNotes, downloads: propDownloads, onDownload: propOnDownload }: SubjectNotesProps) => {
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const { 
    isAdmin, 
    handleDownload, 
    downloadCounts, 
    isDownloadCountsInitialized,
    notes: backendNotes,
    contentLoading,
    deleteNote
  } = useBackend();

  // Create an array of week numbers (1-12)
  const weeks = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  // FIXED: Safe filtering logic that handles null/undefined values
  const subjectNotes = propNotes || backendNotes.filter(note => {
    // Safely convert to lowercase with fallback to empty string
    const noteSubject = (note.subject || "").toLowerCase();
    const targetSubject = (subject || "").toLowerCase();
    const noteExamType = (note.exam_type || "").toLowerCase();

    // Match subject safely
    const isSubjectMatch = noteSubject === targetSubject;

    // Match exam type safely
    const isExamTypeMatch = noteExamType.includes('iitm') || noteExamType.includes('bs');

    return isSubjectMatch && isExamTypeMatch;
  });
  
  // Convert backend notes to expected format and filter by selected week
  const notesWithWeeks = subjectNotes.map(note => ({
    ...note,
    // Ensure week is valid, fallback to random if missing (or handle as needed)
    week: note.week || Math.floor(Math.random() * 12) + 1, 
    description: note.description || `${subject} study materials`
  }));

  const filteredNotes = selectedWeek === "all" 
    ? notesWithWeeks 
    : notesWithWeeks.filter(note => note.week === parseInt(selectedWeek));

  const handleDownloadClick = async (noteId: string, fileUrl?: string) => {
    if (propOnDownload) {
      propOnDownload(noteId);
    } else {
      await handleDownload(noteId, 'notes', fileUrl);
    }
  };

  const handleDeleteClick = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  // Use the actual download counts from the backend or props
  const currentDownloads = propDownloads || downloadCounts;

  // Show loading state while download counts are being initialized
  if (!isDownloadCountsInitialized && !propDownloads) {
    return (
      <div className="my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold capitalize">{subject}</h2>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
          <span className="ml-2 text-gray-600">Loading download counts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold capitalize">{subject}</h2>
      </div>
      
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
      
      {contentLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <CardDescription>{note.description}</CardDescription>
                    <div className="mt-1">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                        Week {note.week}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(note.id)}
                      className="admin-only text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button
                  onClick={() => handleDownloadClick(note.id, note.file_link)}
                  className="bg-royal hover:bg-royal-dark text-white"
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">{currentDownloads[note.id] || note.download_count || 0}</span>
                  <div className="ml-2 bg-gray-200 h-1.5 w-16 rounded-full overflow-hidden">
                    <div 
                      className="bg-royal h-full rounded-full" 
                      style={{ width: `${Math.min(100, ((currentDownloads[note.id] || note.download_count || 0) / 100) * 100)}%` }}
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
      )}
    </div>
  );
};

export default IITMBSNotesSection;
