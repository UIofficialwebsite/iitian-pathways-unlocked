
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Download, FileText, Trash2, Edit } from "lucide-react";
import { ShareButton } from "../ShareButton";
import { Note } from "./hooks/useIITMBranchNotes";
import { useAuth } from "@/hooks/useAuth";
import { useIITMBranchNotesManager } from "./hooks/useIITMBranchNotesManager";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { slugify } from "@/utils/urlHelpers";

export interface BranchNotesAccordionProps {
  groupedNotes: Record<string, Note[]>;
  level: string;
  currentSubjects: string[];
  loading: boolean;
  onNotesChange?: () => void;
}

const buildIITMNoteUrl = (subject: string, level: string): string => {
  const origin = window.location.origin;
  const branch = slugify(subject);
  const levelSlug = slugify(level);
  
  if (branch && levelSlug) {
    return `${origin}/exam-preparation/iitm-bs/notes/${branch}/${levelSlug}`;
  }
  
  return window.location.href;
};

const BranchNotesAccordion: React.FC<BranchNotesAccordionProps> = ({
  groupedNotes,
  level,
  currentSubjects,
  loading,
  onNotesChange,
}) => {
  const { isAdmin } = useAuth();
  const { deleteIITMNote } = useIITMBranchNotesManager();
  const { handleDownload, downloadCounts } = useBackend();

  const handleDeleteNote = async (noteId: string, noteTitle: string) => {
    if (!isAdmin) return;
    
    if (window.confirm(`Are you sure you want to delete "${noteTitle}"?`)) {
      const success = await deleteIITMNote(noteId);
      if (success && onNotesChange) {
        onNotesChange();
      }
    }
  };

  const handleDownloadClick = async (noteId: string, fileUrl?: string) => {
    if (fileUrl) {
      await handleDownload(noteId, 'notes', fileUrl);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
        <span className="ml-2 text-gray-600">Loading notes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentSubjects.map((subject) => {
        const subjectNotes = groupedNotes[subject] || [];

        return (
          <Accordion type="single" collapsible key={subject} className="bg-white rounded-lg shadow-md">
            <AccordionItem value={subject}>
              <AccordionTrigger className="p-4 hover:bg-gray-50">
                <span className="font-semibold text-lg">{subject}</span>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjectNotes.map((note) => (
                    <Card key={note.id} className="border-none shadow-sm hover:shadow-md transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          <div className="rounded-full bg-royal/10 p-2 mr-3">
                            <FileText className="h-4 w-4 text-royal" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">{note.title}</CardTitle>
                            <CardDescription className="text-xs">{note.description}</CardDescription>
                          </div>
                          {isAdmin && (
                            <div className="flex items-center space-x-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id, note.title)}
                                className="admin-only text-red-600 hover:text-red-800 h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardFooter className="flex justify-between items-center pt-0">
                        <Button
                          size="sm"
                          onClick={() => handleDownloadClick(note.id, (note as any).file_link)}
                          className="bg-royal hover:bg-royal-dark text-white text-xs"
                          disabled={!(note as any).file_link}
                        >
                          <Download className="h-3 w-3 mr-1" /> Download
                        </Button>
                        <ShareButton
                          url={buildIITMNoteUrl(subject, level)}
                          title={note.title}
                          description={note.description}
                          size="sm"
                          variant="ghost"
                        />
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500">{downloadCounts[note.id] || note.downloads || 0}</span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
      {!loading && currentSubjects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No subjects available for this selection. Please try a different branch or level.
        </div>
      )}
    </div>
  );
};

export default BranchNotesAccordion;
