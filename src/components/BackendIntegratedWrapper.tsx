import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeContentManagement } from '@/hooks/useRealtimeContentManagement';

// Define the shape of the content
interface Content {
  id: string;
  [key: string]: any;
}

// Define the shape of the backend context
interface BackendContextType {
  courses: Content[];
  notes: Content[];
  pyqs: Content[];
  contentLoading: boolean;
  getFilteredContent: (profile: any) => { 
    notes: Content[], 
    pyqs: Content[],
    courses: Content[],
    importantDates: Content[],
    newsUpdates: Content[]
  };
  refetch: () => void;
  // Other potential values
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  user?: any;
}

// Create the context
const BackendContext = createContext<BackendContextType | undefined>(undefined);

// BackendIntegratedWrapper component
export const BackendIntegratedWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  
  const {
    courses,
    notes,
    pyqs,
    importantDates,
    newsUpdates,
    loading: contentLoading,
    refetch,
  } = useRealtimeContentManagement();

  const getFilteredContent = (profile: any) => {
    if (!profile) {
      return { notes, pyqs, courses, importantDates, newsUpdates };
    }

    const filterByProfile = (content: any[]) => {
      return content.filter(item => {
        if (item.program_type && item.program_type !== profile.program_type) {
          return false;
        }

        if (profile.program_type === 'IITM_BS') {
          if (item.branch && item.branch !== 'all' && item.branch !== profile.branch) return false;
          if (item.level && item.level !== 'all' && item.level !== profile.level) return false;
        } else if (profile.program_type === 'COMPETITIVE_EXAM') {
          if (item.exam_type && item.exam_type !== 'all' && item.exam_type !== profile.exam_type) return false;
        }

        return true;
      });
    };

    return {
      notes: filterByProfile(notes),
      pyqs: filterByProfile(pyqs),
      courses: filterByProfile(courses),
      importantDates: filterByProfile(importantDates),
      newsUpdates: filterByProfile(newsUpdates),
    };
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isAdmin,
    isSuperAdmin,
    courses,
    notes,
    pyqs,
    contentLoading: authLoading || contentLoading,
    getFilteredContent,
    refetch,
  }), [
    user,
    isAdmin,
    isSuperAdmin,
    courses,
    notes,
    pyqs,
    authLoading,
    contentLoading,
    refetch,
  ]);

  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
};

// Custom hook to use the backend context
export const useBackend = (): BackendContextType => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendIntegratedWrapper');
  }
  return context;
};
