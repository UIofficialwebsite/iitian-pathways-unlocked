
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDownloadHandler } from '@/hooks/useDownloadHandler';
import { useRealtimeContentManagement } from '@/hooks/useRealtimeContentManagement';
import { useContentManagement } from '@/hooks/useContentManagement';
import { Course } from '@/components/admin/courses/types';

interface BackendContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAdminLoading: boolean;
  handleDownload: (contentId: string, tableName: 'notes' | 'pyqs', fileUrl?: string) => Promise<void>;
  downloadCounts: Record<string, number>;
  updateDownloadCount: (contentId: string, count: number) => void;
  isDownloadCountsInitialized: boolean;
  notes: any[];
  pyqs: any[];
  courses: Course[];
  importantDates: any[];
  newsUpdates: any[];
  studyGroups: any[];
  jobs: any[];
  communities: any[];
  contentLoading: boolean;
  getFilteredContent: (profile: any) => any;
  refreshAll: () => Promise<void>;
  // CRUD operations - Updated to match actual hook return types
  addNote: (data: any) => Promise<boolean>;
  addPyq: (data: any) => Promise<boolean>;
  deleteNote: (id: string) => Promise<boolean>;
  deletePyq: (id: string) => Promise<boolean>;
  updateNote: (id: string, data: any) => Promise<boolean>;
  updatePyq: (id: string, data: any) => Promise<boolean>;
  createCourse: (data: any) => Promise<void>;
  updateCourse: (id: string, data: any) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  refreshPyqs: () => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackend must be used within a BackendIntegratedWrapper');
  }
  return context;
};

interface BackendIntegratedWrapperProps {
  children: ReactNode;
}

export const BackendIntegratedWrapper: React.FC<BackendIntegratedWrapperProps> = ({ children }) => {
  const { isAdmin, isSuperAdmin, isLoading: isAdminLoading } = useAuth();
  const { handleDownload, downloadCounts, updateDownloadCount, isInitialized: isDownloadCountsInitialized } = useDownloadHandler();
  
  const {
    notes,
    pyqs,
    courses,
    importantDates,
    newsUpdates,
    studyGroups,
    jobs,
    communities,
    loading: contentLoading,
    getFilteredContent,
    refreshAll
  } = useRealtimeContentManagement();

  // Get CRUD operations from content management hook
  const {
    addNote,
    addPyq,
    deleteNote,
    deletePyq,
    updateNote,
    updatePyq,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshNotes,
    refreshPyqs
  } = useContentManagement();

  console.log('BackendIntegratedWrapper - Admin status:', { isAdmin, isSuperAdmin, isAdminLoading });
  console.log('BackendIntegratedWrapper - Content loaded:', { 
    notes: notes.length, 
    pyqs: pyqs.length, 
    courses: courses.length,
    jobs: jobs.length
  });

  const contextValue: BackendContextType = {
    isAdmin,
    isSuperAdmin,
    isAdminLoading,
    handleDownload,
    downloadCounts,
    updateDownloadCount,
    isDownloadCountsInitialized,
    notes,
    pyqs,
    courses,
    importantDates,
    newsUpdates,
    studyGroups,
    jobs,
    communities,
    contentLoading,
    getFilteredContent,
    refreshAll,
    // CRUD operations
    addNote,
    addPyq,
    deleteNote,
    deletePyq,
    updateNote,
    updatePyq,
    createCourse,
    updateCourse,
    deleteCourse,
    refreshNotes,
    refreshPyqs
  };

  return (
    <BackendContext.Provider value={contextValue}>
      {children}
    </BackendContext.Provider>
  );
};
