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
        className="pdf-card group relative flex flex-col gap-5 p-5 bg-white border border-[#e2e8f0] rounded-[10px] transition-all duration-100 hover:border-black hover:outline hover:outline-1 hover:outline-black snap-start shadow-sm"
      >
        <div className="flex gap-3 items-start">
          {/* MacBook-style PDF Icon */}
          <div className="macbook-pdf-icon relative flex flex-col items-center justify-center w-[44px] h-[52px] bg-[#fef2f2] border border-[#fee2e2] rounded-[6px] flex-shrink-0 shadow-[inset_0_-4px_0_rgba(239,68,68,0.1)]">
            <FileText className="h-[22px] w-[22px] text-[#ef4444] -mt-[10px]" />
            <span className="absolute bottom-[4px] text-[8px] font-[900] text-[#ef4444] tracking-[0.5px] uppercase">PDF</span>
          </div>

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-[0.9rem] text-[#0f172a] truncate">
                {note.title}
              </h4>
              <span className="download-tag bg-[#f1f5f9] text-[#64748b] text-[0.65rem] font-bold px-2 py-[2px] rounded-[4px] border border-[#e2e8f0] uppercase flex-shrink-0">
                {displayDownloads}
              </span>
            </div>
            {note.description && (
              <p className="text-[0.8rem] text-[#64748b] mt-1 line-clamp-2 leading-normal">
                {note.description}
              </p>
            )}
          </div>
        </div>

        <div className="action-group grid grid-cols-2 gap-[10px]">
          <Button
            variant="outline"
            className="h-9 text-[0.75rem] font-normal bg-white border-[#e2e8f0] text-[#0f172a] hover:bg-[#f8fafc] hover:border-[#cbd5e1] rounded-[6px] uppercase tracking-[0.05em]"
            onClick={() => note.file_link && window.open(note.file_link, '_blank')}
          >
            View
          </Button>
          <Button
            className="h-9 text-[0.75rem] font-normal bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-[#2563eb] rounded-[6px] uppercase tracking-[0.05em]"
            onClick={() => handleDownload(note.id, 'notes', note.file_link)}
          >
            Get PDF
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((j) => <Skeleton key={j} className="aspect-square rounded-[10px]" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filteredSubjects = specialization === "all"
    ? groupedData
    : groupedData.filter(s => !s.specialization || s.specialization === specialization);

  return (
    <div className="space-y-16 pb-20">
      {filteredSubjects.map((subjectData) => (
        <div key={subjectData.subjectName} className="subject-section-transparent">
          {/* Section Header with Pill Share Button - Background Removed */}
          <div className="flex items-center justify-between py-4 mb-4">
            <div className="flex-1">
              <h3 className="text-[1.1rem] font-bold text-[#0f172a] tracking-[-0.01em]">
                {subjectData.subjectName}
              </h3>
              <div className="h-[2px] w-10 bg-[#1E3A8A] mt-1.5 rounded-full" />
            </div>
            
            <div className="header-controls flex items-center gap-3">
              <ShareButton
                url={`${window.location.origin}/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`}
                title={`${subjectData.subjectName} Study Notes`}
                className="btn-share flex items-center gap-2 px-4 py-[7px] bg-white border border-[#e2e8f0] rounded-full text-[0.8rem] font-semibold text-[#0f172a] hover:border-black hover:bg-[#f8fafc] transition-all shadow-sm"
                showText={true}
              />
            </div>
          </div>

          <div className="py-2">
            {/* Asset Grid: 2 columns mobile, 3 columns PC */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {subjectData.notes.length > 0 ? (
                subjectData.notes.slice(0, 3).map(renderNoteCard)
              ) : (
                <div className="col-span-full py-10 text-center text-slate-400 text-sm italic bg-white border border-dashed rounded-[10px]">
                  No materials currently available for this subject.
                </div>
              )}
            </div>

            {/* View All Materials Button */}
            {subjectData.notes.length > 3 && (
              <div className="flex justify-center mt-10">
                <button 
                  className="bg-[#EFF6FF] text-[#1E3A8A] font-bold py-2.5 px-8 rounded-[10px] transition-all hover:bg-[#DBEAFE] flex items-center gap-2 text-[13px] border border-blue-100 shadow-sm"
                  onClick={() => navigate(`/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`)}
                >
                  View all materials <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BranchNotesAccordion;
