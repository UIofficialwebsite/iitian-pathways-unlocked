import React from "react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import ChapterList from "./ChapterList";
import AdminAddButton from "./admin/AdminAddButton";

interface SubjectBlockProps {
  subjects: string[]; // Changed from single subject to array
  selectedClass: string;
  examType: 'JEE' | 'NEET';
}

const SubjectBlock = ({ subjects, selectedClass, examType }: SubjectBlockProps) => {
  const { notes, handleDownload, downloadCounts, contentLoading, isAdmin, deleteNote } = useBackend();
  
  // Filter notes that match any of the selected subjects
  const chapters = notes.filter(
    note => 
      note.exam_type === examType && 
      subjects.includes(note.subject || '') && 
      note.class_level === selectedClass
  ).sort((a, b) => (a.display_order_no || 0) - (b.display_order_no || 0));

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
          // Prefill with first subject for admin convenience
          prefilledSubject={subjects[0] || ""}
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
