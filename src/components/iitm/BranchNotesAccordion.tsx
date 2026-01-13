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
        className="flex-shrink-0 w-[85vw] max-w-[280px] sm:w-[45vw] sm:max-w-[320px] lg:w-auto flex flex-col items-center text-center p-5 bg-white border border-slate-200 rounded-xl transition-all duration-200 hover:border-black hover:shadow-lg snap-start aspect-square justify-between"
      >
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Square Type PDF Icon Area */}
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
            <FileText className="h-8 w-8 text-red-500" />
          </div>

          <div className="w-full">
            <h4 className="font-bold text-[14px] text-slate-900 line-clamp-2 min-h-[40px] leading-tight">
              {note.title}
            </h4>
            <div className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {displayDownloads} DOWNLOADS
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full mt-4">
          <Button
            variant="outline"
            className="h-8 text-[10px] font-bold border-slate-200 hover:bg-slate-50"
            onClick={() => note.file_link && window.open(note.file_link, '_blank')}
          >
            PREVIEW
          </Button>
          <Button
            className="h-8 text-[10px] font-bold bg-[#1E3A8A] hover:bg-[#1e40af] text-white"
            onClick={() => handleDownload(note.id, 'notes', note.file_link)}
          >
            GET PDF
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-16">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-6">
            <Skeleton className="h-8 w-64 rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((j) => <Skeleton key={j} className="aspect-square rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredSubjects = specialization === "all"
    ? groupedData
    : groupedData.filter(s => !s.specialization || s.specialization === specialization);

  if (filteredSubjects.length === 0) {
    return (
      <div className="py-20 text-center">
        <Alert className="max-w-md mx-auto bg-white border-slate-200 rounded-xl">
          <Info className="h-4 w-4 text-slate-400" />
          <AlertDescription className="text-sm text-slate-600">No subjects found for this selection.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {filteredSubjects.map((subjectData) => (
        <div key={subjectData.subjectName} className="group">
          {/* Subject Heading - Courses Style */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-xl md:text-2xl font-bold text-[#1a1a1a] font-['Inter',sans-serif]">
                  {subjectData.subjectName}
                </h3>
                <ShareButton
                  url={`${window.location.origin}/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`}
                  title={`${subjectData.subjectName} Study Notes`}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-300 hover:text-blue-600"
                />
              </div>
              <div className="h-0.5 w-10 bg-[#1E3A8A] mt-2 rounded-full transition-all group-hover:w-20" />
            </div>
          </div>

          {/* Grid Layout - 3 per row on PC, scroll on Mobile */}
          <div className="flex overflow-x-auto lg:overflow-x-visible lg:grid lg:grid-cols-3 gap-6 lg:gap-8 no-scrollbar pb-4 lg:pb-0 snap-x -mx-4 px-4 lg:mx-0 lg:px-0">
            {subjectData.notes.length > 0 ? (
              subjectData.notes.slice(0, 3).map(renderNoteCard)
            ) : (
              <div className="w-full text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl col-span-3">
                <p className="text-sm text-slate-500 font-medium">Coming soon: Study materials are being prepared.</p>
              </div>
            )}
          </div>

          {/* View All Materials Button */}
          {subjectData.notes.length > 3 && (
            <div className="flex justify-center mt-10">
              <button 
                className="bg-[#EFF6FF] text-[#1E3A8A] font-bold font-['Inter',sans-serif] py-3 px-10 rounded-xl transition-all hover:bg-[#DBEAFE] hover:scale-105 flex items-center gap-2 text-sm border border-blue-100 shadow-sm"
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
