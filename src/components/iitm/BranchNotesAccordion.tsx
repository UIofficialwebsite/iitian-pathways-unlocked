import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Download, Share2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { GroupedData, Note } from "./hooks/useIITMBranchNotes";
import { useDownloadHandler } from "@/hooks/useDownloadHandler";

interface BranchNotesAccordionProps {
  loading: boolean;
  groupedData: GroupedData[];
  specialization: string; // "all", "Programming", "Data Science"
  onNotesChange: () => void;
}

const BranchNotesAccordion = ({
  loading,
  groupedData,
  specialization,
  onNotesChange,
}: BranchNotesAccordionProps) => {

  const { toast } = useToast();
  const { handleDownload } = useDownloadHandler();

  const handleShare = (note: Note) => {
    // This deep-linking logic will need to be implemented
    navigator.clipboard.writeText(note.file_link);
    toast({
      title: "Link Copied!",
      description: "Note share link copied to clipboard.",
    });
  };

  /**
   * Renders a single note item as a card, matching the original design.
   */
  const renderNoteItem = (note: Note) => (
    <div key={note.id} className="flex items-center justify-between p-3 border-b last:border-b-0 min-h-[50px]">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
        <div className="flex-1">
          <span className="font-medium">{note.title}</span>
          {note.description && (
            <p className="text-sm text-gray-500">{note.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center flex-shrink-0 gap-2">
        {/* Only show buttons if file_link is present */}
        {note.file_link ? (
          <>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Download className="h-3 w-3" /> {note.download_count}
            </span>
            <Button variant="ghost" size="icon" onClick={() => handleShare(note)}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="bg-royal hover:bg-royal-dark text-white" // Restored bluish button
              onClick={() => handleDownload(note.id, note.file_link, 'iitm_branch_notes')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <span className="text-xs text-gray-400 italic pr-2">No file</span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Filter subjects based on specialization
  const filteredSubjects =
    specialization === "all"
      ? groupedData
      : groupedData.filter(
          (subject) =>
            !subject.specialization || subject.specialization === specialization
        );
  
  if (filteredSubjects.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No subjects have been defined for this course level yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {/* --- LEVEL 1 ACCORDION (SUBJECT) --- */}
      {filteredSubjects.map((subjectData) => (
        <AccordionItem
          value={`subject-${subjectData.subjectName}`}
          key={subjectData.subjectName}
          className="border-none rounded-lg bg-white shadow-sm"
        >
          <AccordionTrigger className="px-6 py-4 text-lg font-bold text-gray-800">
            {/* Specialization tag has been removed from here */}
            {subjectData.subjectName}
          </AccordionTrigger>
          <AccordionContent className="p-0">
            {/* --- This is the list of note cards --- */}
            <div className="px-4 pb-4">
              {subjectData.notes.length > 0 ? (
                <div className="border rounded-md bg-white">
                  {subjectData.notes.map(renderNoteItem)}
                </div>
              ) : (
                <p className="p-4 text-sm text-gray-500 text-center">
                  No notes available for this subject yet.
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default BranchNotesAccordion;
