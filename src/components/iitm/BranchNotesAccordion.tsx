import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Info, Download, ChevronRight } from "lucide-react";
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
      <article 
        key={note.id} 
        // Mobile: Fixed width for side-scroll; Desktop: flex-1
        className="bg-white rounded-lg p-5 flex flex-col justify-between h-full border border-transparent hover:border-gray-200 snap-start shrink-0 w-[85vw] max-w-[300px] sm:w-auto sm:max-w-none"
        style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
      >
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="text-[#b93a3a]">
              <FileText className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <Download className="w-4 h-4 mr-1" strokeWidth={1.5} />
              <span>{displayDownloads}</span>
            </div>
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-sm leading-tight line-clamp-2">
            {note.title}
          </h3>
          <p className="text-xs text-gray-600 mb-6 line-clamp-2">
            {note.description || `Notes and practice for ${note.title}`}
          </p>
        </div>

        <div className="flex space-x-3 mt-auto font-sans">
          <button 
            className="flex-1 border-[1.5px] border-[#1E3A8A] text-[#1E3A8A] h-[38px] text-[11px] font-normal uppercase transition-colors hover:bg-blue-50 rounded-md"
            onClick={() => note.file_link && window.open(note.file_link, '_blank')}
          >
            View
          </button>
          <button 
            className="flex-1 bg-[#1E3A8A] text-white h-[38px] text-[11px] font-normal uppercase transition-opacity hover:opacity-90 rounded-md"
            onClick={() => handleDownload(note.id, 'notes', note.file_link)}
          >
            Get PDF
          </button>
        </div>
      </article>
    );
  };

  if (loading) {
    return <div className="space-y-12">{[1, 2].map(i => <Skeleton key={i} className="h-64 w-full rounded-md" />)}</div>;
  }

  const filteredSubjects = specialization === "all"
    ? groupedData
    : groupedData.filter(s => !s.specialization || s.specialization === specialization);

  return (
    <div className="space-y-16 pb-20">
      {filteredSubjects.map((subjectData) => (
        <section key={subjectData.subjectName} className="w-full">
          {/* Header Area - Maintained font and alignment */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {subjectData.subjectName}
            </h2>
            <ShareButton
              url={`${window.location.origin}/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`}
              title={`${subjectData.subjectName} Notes`}
              showText={true} // Hidden on mobile via component logic
              className="bg-white"
            />
          </div>

          {/* Cards Grid: Side-scroll on mobile, Grid on desktop */}
          <div className="flex overflow-x-auto snap-x no-scrollbar gap-6 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {subjectData.notes.length > 0 ? (
              subjectData.notes.slice(0, 3).map(renderNoteCard)
            ) : (
              <div className="col-span-full py-10 text-center text-gray-400 text-sm italic">
                No materials available for this subject.
              </div>
            )}
          </div>

          {/* View All Button */}
          {subjectData.notes.length > 3 && (
            <button 
              className="w-full bg-[#EFF6FF] text-[#1E3A8A] font-semibold py-3 px-8 rounded-md transition-all hover:bg-[#DBEAFE] flex justify-center items-center gap-2 text-[13px] border border-blue-100 shadow-sm"
              onClick={() => navigate(`/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`)}
            >
              View all materials <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </section>
      ))}
    </div>
  );
};

export default BranchNotesAccordion;
