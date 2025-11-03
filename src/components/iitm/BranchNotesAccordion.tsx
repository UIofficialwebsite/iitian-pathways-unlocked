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
    // For now, it just copies the file link
    navigator.clipboard.writeText(note.file_link);
    toast({
      title: "Link Copied!",
      description: "Note share link copied to clipboard.",
    });
  };

  const renderNoteItem = (note: Note) => (
    <div key={note.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-gray-500" />
        <span className="font-medium">{note.title}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <Download className="h-3 w-3" /> {note.download_count}
        </span>
        <Button variant="ghost" size="icon" onClick={() => handleShare(note)}>
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDownload(note.id, note.file_link, 'notes')}
        >
          <Download className="h-4 w-4" />
        </Button>
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

  if (groupedData.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No notes have been added for this section yet. Please check back later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {/* Level 1 Accordion: Weeks */}
      {groupedData.map((weekData) => {
        // Filter subjects based on specialization
        const filteredSubjects =
          specialization === "all"
            ? weekData.subjects
            : weekData.subjects.filter(
                (subject) =>
                  !subject.specialization || subject.specialization === specialization
              );
        
        // If no subjects match the filter, don't render the week
        if (filteredSubjects.length === 0) {
          return null;
        }

        return (
          <AccordionItem
            value={`week-${weekData.week}`}
            key={weekData.week}
            className="border-none rounded-lg bg-white shadow-sm"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-bold text-gray-800">
              Week {weekData.week}
            </AccordionTrigger>
            <AccordionContent className="p-0">
              {/* Level 2 Accordion: Subjects */}
              <Accordion type="multiple" className="w-full px-4 pb-4 space-y-2">
                {filteredSubjects.map((subject) => (
                  <AccordionItem
                    value={`subject-${subject.id}`}
                    key={subject.id}
                    className="border rounded-md bg-gray-50"
                  >
                    <AccordionTrigger className="px-4 py-3 font-semibold text-gray-700">
                      {subject.subject_name}
                      {subject.specialization && (
                        <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          {subject.specialization}
                        </span>
                      )}
                    </AccordionTrigger>
                    <AccordionContent className="p-0 bg-white">
                      {subject.notes.length > 0 ? (
                        subject.notes.map(renderNoteItem)
                      ) : (
                        <p className="p-4 text-sm text-gray-500">
                          No notes available for this subject yet.
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default BranchNotesAccordion;
