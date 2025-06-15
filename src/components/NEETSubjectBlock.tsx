
import React from "react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import ChapterList from "./ChapterList";

interface SubjectBlockProps {
  subject: string;
  selectedClass: string;
}

const NEETSubjectBlock = ({ subject, selectedClass }: SubjectBlockProps) => {
  const { notes, handleDownload, downloadCounts, contentLoading } = useBackend();
  
  const neetNotes = notes.filter(note => note.exam_type === 'NEET');

  const chapters = neetNotes.filter(
    note => note.subject === subject && note.class_level === selectedClass
  );

  const handleDownloadClick = async (noteId: string, fileUrl?: string) => {
    await handleDownload(noteId, 'notes', fileUrl);
  };
  
  if (contentLoading) {
    return (
        <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
        </div>
    );
  }

  return (
    <ChapterList chapters={chapters} downloadCounts={downloadCounts} onDownload={handleDownloadClick} />
  );
};

export default NEETSubjectBlock;
