import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Share2, ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupedData, Note } from "./hooks/useIITMBranchNotes";
import { useDownloadHandler } from "@/hooks/useDownloadHandler";
import { ShareButton } from "@/components/ShareButton";
import { slugify } from "@/utils/urlHelpers";

interface BranchNotesAccordionProps {
  loading: boolean;
  groupedData: GroupedData[];
  specialization: string;
  onNotesChange: () => void;
  branch: string;
  level: string;
  selectedSubject?: string;
  onSubjectChange?: (subject: string) => void;
}

const BranchNotesAccordion = ({
  loading,
  groupedData,
  specialization,
  branch,
  level,
  selectedSubject,
  onSubjectChange,
}: BranchNotesAccordionProps) => {
  const { handleDownload, downloadCounts } = useDownloadHandler();
  const [openSubjects, setOpenSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (selectedSubject) {
      setOpenSubjects([`subject-${selectedSubject}`]);
    }
  }, [selectedSubject]);

  const buildSubjectUrl = (subjectName: string) => {
    const slugifiedSubject = slugify(subjectName);
    return `${window.location.origin}/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugifiedSubject}`;
  };

  const handleAccordionChange = (values: string[]) => {
    setOpenSubjects(values);
    if (values.length > 0) {
      const subjectName = values[values.length - 1].replace("subject-", "");
      onSubjectChange?.(subjectName);
    } else {
      onSubjectChange?.("");
    }
  };

  const renderNoteCard = (note: Note) => {
    const dCount = downloadCounts[note.id] || note.download_count || 0;
    const displayDownloads = dCount >= 1000 ? `${(dCount / 1000).toFixed(1)}k` : dCount;

    return (
      <div 
        key={note.id} 
        className="group relative flex flex-col gap-4 p-4 bg-white border border-slate-200 rounded-lg transition-all duration-200 hover:border-black hover:ring-1 hover:ring-black"
      >
        <div className="flex gap-3.5 items-center">
          {/* Premium PDF Icon */}
          <div className="relative flex flex-col items-center justify-center w-11 h-[52px] bg-red-50 border border-red-100 rounded flex-shrink-0">
            <FileText className="h-[22px] w-[22px] text-red-500 -mt-2.5" />
            <span className="absolute bottom-1 text-[9px] font-black text-red-500 uppercase">PDF</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h4 className="font-semibold text-sm text-slate-900 truncate pr-1">
                {note.title}
              </h4>
              <span className="flex-shrink-0 bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 uppercase">
                {displayDownloads} Downloads
              </span>
            </div>
            {note.description && (
              <p className="text-xs text-slate-500 line-clamp-1">{note.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-[12px] font-semibold bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100"
            onClick={() => note.file_link && window.open(note.file_link, '_blank')}
            disabled={!note.file_link}
          >
            Preview
          </Button>
          <Button
            size="sm"
            className="h-9 text-[12px] font-semibold bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            onClick={() => handleDownload(note.id, 'notes', note.file_link)}
            disabled={!note.file_link}
          >
            Download
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  const filteredSubjects = specialization === "all"
    ? groupedData
    : groupedData.filter(s => !s.specialization || s.specialization === specialization);

  if (filteredSubjects.length === 0) {
    return (
      <Alert className="bg-white border-slate-200 rounded-xl">
        <Info className="h-4 w-4 text-slate-400" />
        <AlertDescription className="text-slate-600">
          No subjects have been defined for this course level yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Accordion
      type="multiple"
      className="w-full space-y-4"
      value={openSubjects}
      onValueChange={handleAccordionChange}
    >
      {filteredSubjects.map((subjectData) => (
        <AccordionItem
          value={`subject-${subjectData.subjectName}`}
          key={subjectData.subjectName}
          className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm"
        >
          <div className="flex items-center justify-between w-full group">
            <AccordionTrigger className="flex-1 px-6 py-5 text-[17px] font-bold text-slate-900 hover:bg-slate-50/50 hover:no-underline transition-colors">
              <div className="flex items-center gap-3">
                {subjectData.subjectName}
              </div>
            </AccordionTrigger>
            
            <div className="flex items-center pr-4 gap-2">
              <ShareButton
                url={buildSubjectUrl(subjectData.subjectName)}
                title={`${subjectData.subjectName} - IITM BS Notes`}
                description={`View notes for ${subjectData.subjectName}`}
                variant="outline"
                size="sm"
                className="h-8 px-3 gap-2 text-xs font-semibold border-slate-200 hover:border-slate-900"
              />
            </div>
          </div>

          <AccordionContent className="bg-slate-50/30 border-t border-slate-100">
            <div className="p-6">
              {subjectData.notes.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                  {subjectData.notes.map(renderNoteCard)}
                </div>
              ) : (
                <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-xl">
                  <p className="text-sm text-slate-500">No notes available for this subject yet.</p>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default BranchNotesAccordion;
