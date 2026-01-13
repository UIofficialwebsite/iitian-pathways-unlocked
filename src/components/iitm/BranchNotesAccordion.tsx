import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, ChevronDown, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupedData, Note } from "./hooks/useIITMBranchNotes";
import { useDownloadHandler } from "@/hooks/useDownloadHandler";
import { ShareButton } from "@/components/ShareButton";
import { slugify } from "@/utils/urlHelpers";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedSubject) {
      setOpenSubjects([`subject-${selectedSubject}`]);
    }
  }, [selectedSubject]);

  const buildSubjectUrl = (subjectName: string) => {
    const slugifiedSubject = slugify(subjectName);
    return `/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugifiedSubject}`;
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
        className="flex-shrink-0 w-[260px] sm:w-auto flex flex-col gap-2.5 p-3 bg-white border border-slate-200 rounded-md transition-all duration-200 hover:border-black hover:ring-1 hover:ring-black snap-start"
      >
        <div className="flex gap-2.5 items-start">
          {/* Premium PDF Icon - Reduced Zoom */}
          <div className="relative flex flex-col items-center justify-center w-8 h-10 bg-red-50 border border-red-100 rounded flex-shrink-0">
            <FileText className="h-3.5 w-3.5 text-red-500 -mt-1" />
            <span className="absolute bottom-0.5 text-[6px] font-black text-red-500 uppercase">PDF</span>
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex flex-col gap-0.5 mb-1">
              <h4 className="font-semibold text-[12px] text-slate-900 truncate">
                {note.title}
              </h4>
              <span className="w-fit bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                {displayDownloads} Downloads
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="outline"
            className="h-6 text-[9px] font-semibold bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 rounded-sm px-2"
            onClick={() => note.file_link && window.open(note.file_link, '_blank')}
            disabled={!note.file_link}
          >
            Preview
          </Button>
          <Button
            className="h-6 text-[9px] font-semibold bg-blue-600 hover:bg-blue-700 text-white border-blue-600 rounded-sm px-2"
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
    return <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-md" />)}</div>;
  }

  const filteredSubjects = specialization === "all"
    ? groupedData
    : groupedData.filter(s => !s.specialization || s.specialization === specialization);

  return (
    <Accordion type="multiple" className="w-full space-y-3" value={openSubjects} onValueChange={handleAccordionChange}>
      {filteredSubjects.map((subjectData) => (
        <AccordionItem
          value={`subject-${subjectData.subjectName}`}
          key={subjectData.subjectName}
          className="border border-slate-200 rounded-md bg-white overflow-hidden shadow-sm"
        >
          {/* Header: Left-Aligned Name, Right-Aligned Filled Trigger */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 pl-4 py-2.5 flex-1 min-w-0">
               <h3 className="text-[13px] font-bold text-slate-900 truncate text-left">{subjectData.subjectName}</h3>
               <ShareButton
                url={`${window.location.origin}${buildSubjectUrl(subjectData.subjectName)}`}
                title={`${subjectData.subjectName} Notes`}
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-slate-400 hover:text-blue-600"
              />
            </div>
            
            <AccordionTrigger className="w-10 h-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border-l border-slate-200 transition-colors [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-3.5 w-3.5 text-slate-600 transition-transform duration-200" />
            </AccordionTrigger>
          </div>

          <AccordionContent className="bg-slate-50/30 border-t border-slate-100">
            <div className="p-3">
              {subjectData.notes.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {/* Mobile Side-Scroll / Desktop Grid: Showing first 3 notes only */}
                  <div className="flex overflow-x-auto pb-1 gap-3 sm:grid sm:grid-cols-3 no-scrollbar snap-x">
                    {subjectData.notes.slice(0, 3).map(renderNoteCard)}
                  </div>
                  
                  {/* Middle-Aligned View All Button */}
                  <div className="flex justify-center pt-2">
                    <Button 
                      variant="ghost" 
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 h-8"
                      onClick={() => navigate(buildSubjectUrl(subjectData.subjectName))}
                    >
                      View all materials
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 bg-white border border-dashed border-slate-300 rounded-md">
                  <p className="text-[10px] text-slate-500">No notes available yet.</p>
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
