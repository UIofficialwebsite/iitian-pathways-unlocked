import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Info, ChevronRight } from "lucide-react";
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
}

const BranchNotesAccordion = ({
  loading,
  groupedData,
  specialization,
  branch,
  level,
}: BranchNotesAccordionProps) => {
  const { handleDownload, downloadCounts } = useDownloadHandler();
  const navigate = useNavigate();

  const renderNoteCard = (note: Note) => {
    const dCount = downloadCounts[note.id] || note.download_count || 0;
    const displayDownloads = dCount >= 1000 ? `${(dCount / 1000).toFixed(1)}k` : dCount;

    return (
      <div 
        key={note.id} 
        className="flex-shrink-0 w-[85vw] max-w-[280px] sm:w-[45vw] sm:max-w-[320px] lg:w-auto lg:max-w-none flex flex-col gap-3 p-3 bg-white border border-slate-200 rounded-md transition-all duration-200 hover:border-black hover:ring-1 hover:ring-black snap-start"
      >
        <div className="flex gap-3 items-start">
          <div className="relative flex flex-col items-center justify-center w-8 h-10 bg-red-50 border border-red-100 rounded flex-shrink-0">
            <FileText className="h-3.5 w-3.5 text-red-500 -mt-1" />
            <span className="absolute bottom-0.5 text-[6px] font-black text-red-500 uppercase">PDF</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <h4 className="font-semibold text-[12px] text-slate-900 truncate">{note.title}</h4>
            <span className="w-fit bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded border border-slate-200 uppercase">
              {displayDownloads} Downloads
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="outline"
            className="h-7 text-[10px] font-bold bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={() => note.file_link && window.open(note.file_link, '_blank')}
          >
            PREVIEW
          </Button>
          <Button
            className="h-7 text-[10px] font-bold bg-blue-600 text-white border-blue-600 rounded-sm"
            onClick={() => handleDownload(note.id, 'notes', note.file_link)}
          >
            DOWNLOAD
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="space-y-12">{[1, 2].map((i) => <Skeleton key={i} className="h-48 w-full rounded-md" />)}</div>;
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
    <div className="w-full space-y-14">
      {filteredSubjects.map((subjectData) => (
        <div key={subjectData.subjectName} className="relative">
          {/* Heading - Exactly like Courses Page */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg md:text-xl font-bold text-[#1a1a1a] font-['Inter',sans-serif] truncate">
                  {subjectData.subjectName}
                </h3>
                <ShareButton
                  url={`${window.location.origin}/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`}
                  title={`${subjectData.subjectName} Notes`}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-blue-600"
                />
              </div>
              <div className="h-0.5 w-10 bg-[#1E3A8A] mt-1.5 rounded-full" />
            </div>
          </div>

          {/* Note Grid / Horizontal Scroll (Max 3 Cards) */}
          <div className="flex overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 gap-5 lg:gap-6 no-scrollbar pb-4 lg:pb-0 snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
            {subjectData.notes.length > 0 ? (
              subjectData.notes.slice(0, 3).map(renderNoteCard)
            ) : (
              <div className="w-full text-center py-10 bg-slate-50 border border-dashed rounded-md col-span-3">
                <p className="text-xs text-slate-500">No materials available for this subject yet.</p>
              </div>
            )}
          </div>

          {/* View All Button - Exactly like Courses Page */}
          {subjectData.notes.length > 3 && (
            <div className="flex justify-center mt-6">
              <button 
                className="bg-[#EFF6FF] text-[#1E3A8A] font-semibold font-['Inter',sans-serif] py-2.5 px-8 rounded-md transition-all hover:bg-[#DBEAFE] flex items-center gap-2 text-[13px] border border-blue-100 shadow-sm"
                onClick={() => navigate(`/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`)}
              >
                View all materials <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BranchNotesAccordion;
