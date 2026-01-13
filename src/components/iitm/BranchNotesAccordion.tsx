import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Download, ChevronDown, Info } from "lucide-react";
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
        className="flex-shrink-0 w-[280px] sm:w-auto flex flex-col gap-3 p-3 bg-white border border-slate-200 rounded-md transition-all duration-200 hover:border-black hover:ring-1 hover:ring-black"
      >
        <div className="flex gap-3 items-start">
          {/* Premium PDF Icon - Reduced Zoom */}
          <div className="relative flex flex-col items-center justify-center w-9 h-11 bg-red-50 border border-red-100 rounded flex-shrink-0">
            <FileText className="h-4 w-4 text-red-500 -mt-1.5" />
            <span className="absolute bottom-1 text-[7px] font-black text-red-500 uppercase">PDF</span>
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex flex-col gap-0.5 mb-1">
              <h4 className="font-semibold text-[13px] text-slate-900 truncate">
                {note.title}
              </h4>
              <span className="w-fit bg-slate-100 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                {displayDownloads} Downloads
              </span>
            </div>
            {note.description && (
              <p className="text-[11px] text-slate-500 line-clamp-1">{note.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-7 text-[10px] font-semibold bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={() => note.file_link && window.open(note.file_link, '_blank')}
            disabled={!note.file_link}
          >
            Preview
          </Button>
          <Button
            className="h-7 text-[10px] font-semibold bg-blue-600 hover:bg-blue-700 text-white border-blue-600 rounded-sm"
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
    return <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}</div>;
  }

  const filteredSubjects = specialization === "all"
    ? groupedData
    : groupedData.filter(s => !s.specialization || s.specialization === specialization);

  if (filteredSubjects.length === 0) {
    return (
      <Alert className="bg-white border-slate-200 rounded-md">
        <Info className="h-4 w-4 text-slate-400" />
        <AlertDescription className="text-xs text-slate-600">No subjects defined yet.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-3" value={openSubjects} onValueChange={handleAccordionChange}>
      {filteredSubjects.map((subjectData) => (
        <AccordionItem
          value={`subject-${subjectData.subjectName}`}
          key={subjectData.subjectName}
          className="border border-slate-200 rounded-md bg-white overflow-hidden shadow-sm"
        >
          {/* Header with Right-Aligned Filled Dropdown and Left-Aligned Subject Name */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 pl-4 py-3 flex-1 min-w-0">
               <h3 className="text-[14px] font-bold text-slate-900 truncate text-left">{subjectData.subjectName}</h3>
               <ShareButton
                url={buildSubjectUrl(subjectData.subjectName)}
                title={`${subjectData.subjectName} Notes`}
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-blue-600"
              />
            </div>
            
            <AccordionTrigger className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border-l border-slate-200 transition-colors [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-4 w-4 text-slate-600 transition-transform duration-200" />
            </AccordionTrigger>
          </div>

          <AccordionContent className="bg-slate-50/30 border-t border-slate-100">
            <div className="p-3">
              {subjectData.notes.length > 0 ? (
                /* Mobile: 1 Column, 2 Rows visible, rest Side Scroll. Desktop: 3 Columns. */
                <div className="flex overflow-x-auto pb-2 gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 no-scrollbar snap-x">
                  {subjectData.notes.map(renderNoteCard)}
                </div>
              ) : (
                <div className="text-center py-6 bg-white border border-dashed border-slate-300 rounded-md">
                  <p className="text-[11px] text-slate-500">No notes available yet.</p>
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
