import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ChevronRight } from "lucide-react";
import { GroupedData, Note } from "./hooks/useIITMBranchNotes";
import { useDownloadHandler } from "@/hooks/useDownloadHandler";
import { ShareButton } from "@/components/ShareButton";
import { slugify } from "@/utils/urlHelpers";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLoginModal } from "@/context/LoginModalContext";

interface BranchNotesAccordionProps {
  loading: boolean;
  groupedData: GroupedData[];
  branch: string;
  level: string;
}

const BranchNotesAccordion = ({
  loading,
  groupedData,
  branch,
  level,
}: BranchNotesAccordionProps) => {
  const { handleDownload, downloadCounts } = useDownloadHandler();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();

  const renderNoteCard = (note: Note) => {
    // Falls back to note.download_count (from DB fetch) if local state isn't ready yet
    const dCount = downloadCounts[note.id] !== undefined ? downloadCounts[note.id] : (note.download_count || 0);
    const displayDownloads = dCount >= 1000 ? `${(dCount / 1000).toFixed(1)}k` : dCount;

    return (
      <article 
        key={note.id} 
        className="bg-white rounded-lg p-5 flex flex-col justify-between h-full border border-black/[0.08] hover:border-black/20 transition-all snap-start shrink-0 w-[80vw] max-w-[280px] sm:w-auto sm:max-w-none shadow-sm"
        style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
      >
        <div>
          <div className="flex justify-between items-start mb-4">
            {/* Custom Logo Icon Area */}
            <div className="shrink-0">
              <img 
                src="https://i.ibb.co/mr3z2pF7/image.png" 
                alt="Notes logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            {/* Download Count */}
            <div className="flex items-center text-gray-400 text-[11px] font-medium">
              <Download className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
              <span>{displayDownloads}</span>
            </div>
          </div>
          
          <h3 className="font-bold text-gray-900 mb-2 text-sm leading-tight line-clamp-2">
            {note.title}
          </h3>
          <p className="text-xs text-gray-500 mb-6 line-clamp-2">
            {note.description || `Comprehensive study material for ${note.title}.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto font-sans">
          {user ? (
            <div className="flex space-x-3">
              {/* Removed View button as per previous request */}
              <button 
                className="flex-1 bg-[#1E3A8A] text-white h-[38px] text-[11px] font-bold uppercase rounded-md hover:opacity-90 transition-opacity shadow-sm"
                onClick={() => handleDownload(note.id, 'iitm_branch_notes', note.file_link)}
              >
                Get PDF
              </button>
            </div>
          ) : (
            <button 
              className="w-full bg-[#1E3A8A] text-white h-[38px] text-[11px] font-normal font-['Inter'] uppercase rounded-md hover:opacity-90 transition-opacity shadow-sm"
              onClick={() => {
                // Track intent (increments count locally & DB) but forces login
                handleDownload(note.id, 'iitm_branch_notes'); 
                openLogin();
              }}
            >
              Login to Download
            </button>
          )}
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <div className="space-y-12">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-6">
            <Skeleton className="h-8 w-64 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((j) => <Skeleton key={j} className="h-56 rounded-xl" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {groupedData.map((subjectData) => (
        <section 
          key={subjectData.subjectName} 
          className="w-full bg-white border border-gray-100 rounded-xl p-6 md:p-8 shadow-sm"
        >
          {/* Section Header with Responsive Share Button */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
              {subjectData.subjectName}
            </h2>
            <ShareButton
              url={`${window.location.origin}/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`}
              title={`${subjectData.subjectName} Notes`}
              showText={true}
              className="bg-white border-gray-200"
            />
          </div>

          {/* Cards Grid: Side-scroll on mobile, Grid on desktop */}
          <div className="flex overflow-x-auto snap-x no-scrollbar gap-6 mb-8 -mx-2 px-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {subjectData.notes.length > 0 ? (
              subjectData.notes.slice(0, 3).map(renderNoteCard)
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 text-sm italic border border-dashed rounded-lg bg-gray-50/50">
                No materials currently available for this subject.
              </div>
            )}
          </div>

          {/* View All Button */}
          {subjectData.notes.length > 3 && (
            <button 
              className="w-full bg-[#EFF6FF] text-[#1E3A8A] font-normal font-['Inter',sans-serif] py-3.5 px-8 rounded-md transition-all hover:bg-[#DBEAFE] flex justify-center items-center gap-2 text-[12px] border border-blue-100 shadow-sm"
              onClick={() => navigate(`/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`)}
            >
              View all materials <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </section>
      ))}
    </div>
  );
};

export default BranchNotesAccordion;
