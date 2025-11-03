
import React from "react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import ChapterList from "./ChapterList";
import AdminAddButton from "./admin/AdminAddButton";

interface SubjectBlockProps {
  subject: string;
  selectedClass: string;
  examType: 'JEE' | 'NEET';
}

const SubjectBlock = ({ subject, selectedClass, examType }: SubjectBlockProps) => {
  const { notes, handleDownload, downloadCounts, contentLoading, isAdmin, deleteNote } = useBackend();
  
  const chapters = notes.filter(
    note => note.exam_type === examType && note.subject === subject && note.class_level === selectedClass
  );

  const handleDownloadClick = async (noteId: string, fileUrl?: string) => {
    await handleDownload(noteId, 'notes', fileUrl);
  };

  const handleDeleteClick = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };
  
  if (contentLoading) {
    return (
        <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <AdminAddButton
          contentType="notes"
          examType={examType}
          prefilledSubject={subject}
          classLevel={selectedClass}
        >
          Add Note
        </AdminAddButton>
      </div>
      <ChapterList
        chapters={chapters}
        downloadCounts={downloadCounts}
        onDownload={handleDownloadClick}
        isAdmin={isAdmin}
        onDelete={handleDeleteClick}
        contentType="notes"
      />
    </div>
  );
};

export default SubjectBlock;
