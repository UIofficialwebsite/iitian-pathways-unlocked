import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Info, Download, Share2 } from "lucide-react";
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
      <article 
        key={note.id} 
        className="bg-white rounded-lg p-5 flex flex-col justify-between h-full transition-shadow duration-200 border border-transparent hover:border-gray-200"
        style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
      >
        <div>
          <div className="flex justify-between items-start mb-4">
            {/* PDF Icon */}
            <div className="text-[#b93a3a]">
              <FileText className="w-8 h-8" strokeWidth={1.5} />
            </div>
            {/* Download Count */}
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

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-auto">
          <button 
            className="flex-1 py-2 px-4 rounded-[4px] border border-gray-300 bg-white text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors uppercase"
            onClick={() => note.file_link && window.open(note.file_link, '_blank')}
          >
            View
          </button>
          <button 
            className="flex-1 py-2 px-4 rounded-[4px] text-white text-xs font-semibold hover:bg-[#777777] transition-colors uppercase bg-[#808080]"
            onClick={() => handleDownload(note.id, 'notes', note.file_link)}
          >
            Get PDF
          </button>
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
              {[1, 2, 3].map((j) => <Skeleton key={j} className="h-48 rounded-lg" />)}
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
        <Alert className="max-w-md mx-auto bg-white border-gray-200">
          <Info className="h-4 w-4 text-gray-400" />
          <AlertDescription className="text-sm text-gray-600">No materials found for this selection.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20">
      {filteredSubjects.map((subjectData) => (
        <section key={subjectData.subjectName} className="w-full">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
            <h2 className="text-2xl font-bold text-gray-900">{subjectData.subjectName}</h2>
            <div className="flex items-center space-x-2">
              <ShareButton
                url={`${window.location.origin}/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`}
                title={`${subjectData.subjectName} Study Materials`}
                className="p-2 rounded border border-gray-200 hover:bg-gray-50 text-gray-500"
                variant="ghost"
                size="icon"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {subjectData.notes.length > 0 ? (
              subjectData.notes.slice(0, 3).map(renderNoteCard)
            ) : (
              <div className="col-span-full py-10 text-center text-gray-400 text-sm italic">
                No materials currently available for this subject.
              </div>
            )}
          </div>

          {/* View All Button */}
          {subjectData.notes.length > 3 && (
            <button 
              className="w-full bg-[#e5e7eb] text-gray-700 font-medium rounded-full text-sm hover:bg-gray-300 transition-colors flex justify-center items-center py-4"
              onClick={() => navigate(`/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectData.subjectName)}`)}
            >
              View all materials <span className="ml-1 text-lg">›</span>
            </button>
          )}
        </section>
      ))}
    </div>
  );
};

export default BranchNotesAccordion;
