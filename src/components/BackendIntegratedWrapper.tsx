// src/components/BackendIntegratedWrapper.tsx
// (FINAL UPDATED FILE)

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { Course } from "@/components/admin/courses/types"; // Your existing type
import { useDownloadHandler } from "@/hooks/useDownloadHandler";

// Define your content types (you already have these)
type Note = Database["public"]["Tables"]["notes"]["Row"];
type Pyq = Database["public"]["Tables"]["pyqs"]["Row"];
type ImportantDate = Database["public"]["Tables"]["important_dates"]["Row"];
type NewsUpdate = Database["public"]["Tables"]["news_updates"]["Row"];
type Community = Database["public"]["Tables"]["communities"]["Row"];
type IITMBranchNote =
  Database["public"]["Tables"]["iitm_branch_notes"]["Row"];
type IITMBranchPyq = Database["public"]["Tables"]["pyqs"]["Row"]; // Assuming pyqs are used for IITM PYQs

interface BackendContextType {
  courses: Course[];
  notes: Note[];
  pyqs: Pyq[];
  importantDates: ImportantDate[];
  newsUpdates: NewsUpdate[];
  communities: Community[];
  iitmBranchNotes: IITMBranchNote[];
  iitmBranchPyqs: IITMBranchPyq[];
  recommendedCourses: Course[]; // --- 1. ADD THIS NEW LINE ---
  loading: boolean;
  error: Error | null;
  getFilteredContent: (profile: any) => any;
  handleDownload: (
    contentId: string,
    type: "notes" | "pyqs" | "iitm_branch_notes",
    fileUrl?: string | null
  ) => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

export const BackendIntegratedWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  // --- 2. ADD THIS NEW STATE ---
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pyqs, setPyqs] = useState<Pyq[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [iitmBranchNotes, setIitmBranchNotes] = useState<IITMBranchNote[]>([]);
  const [iitmBranchPyqs, setIitmBranchPyqs] = useState<IITMBranchPyq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { handleDownload, incrementDownloadCount } = useDownloadHandler(
    user?.email
  );

  // --- 3. CREATE THIS NEW FUNCTION TO FETCH RECOMMENDATIONS ---
  const fetchRecommendedCourses = useCallback(async () => {
    if (!user) return; // Only fetch if logged in

    try {
      // This is our high-performance query.
      // RLS ensures it only gets data for the current user.
      const { data, error } = await supabase
        .from("user_recommendations")
        .select(
          `
          score,
          courses (
            id,
            title,
            description,
            price,
            discounted_price,
            duration,
            rating,
            features,
            bestseller,
            image_url,
            created_at,
            updated_at,
            subject,
            start_date,
            course_type,
            branch,
            level,
            enroll_now_link,
            students_enrolled,
            end_date,
            language,
            is_live,
            expiry_date,
            tags,
            exam_category
          )
        `
        )
        .order("score", { ascending: false })
        .limit(3); // Get the top 3 recommendations

      if (error) {
        throw error;
      }

      if (data) {
        // Format the data into a clean Course[] array
        const formattedData = data
          .filter((rec) => rec.courses) // Filter out any null courses
          .map((rec) => rec.courses); // Get just the course object
        setRecommendedCourses(formattedData as unknown as Course[]);
      }
    } catch (err) {
      console.error("Error fetching recommended courses:", err);
      // Don't set a main error, just fail silently on recommendations
    }
  }, [user]); // Re-run if the user changes

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // --- 4. CALL THE NEW FUNCTION ---
      // We call this *alongside* other data fetches
      fetchRecommendedCourses();

      // All your existing data fetches (abbreviated)
      const [
        coursesRes,
        notesRes,
        pyqsRes,
        datesRes,
        newsRes,
        commRes,
        iitmNotesRes,
        iitmPyqsRes,
      ] = await Promise.all([
        supabase.from("courses").select("*"),
        supabase.from("notes").select("*"),
        supabase.from("pyqs").select("*"),
        supabase.from("important_dates").select("*"),
        supabase.from("news_updates").select("*"),
        supabase.from("communities").select("*"),
        supabase.from("iitm_branch_notes").select("*"),
        supabase
          .from("pyqs")
          .select("*")
          .or("exam_type.eq.IITM_BS,exam_type.eq.IITM BS"),
      ]);

      // Set states
      if (coursesRes.data) setCourses(coursesRes.data as unknown as Course[]);
      if (notesRes.data) setNotes(notesRes.data);
      if (pyqsRes.data) setPyqs(pyqsRes.data);
      if (datesRes.data) setImportantDates(datesRes.data);
      if (newsRes.data) setNewsUpdates(newsRes.data);
      if (commRes.data) setCommunities(commRes.data);
      if (iitmNotesRes.data) setIitmBranchNotes(iitmNotesRes.data);
      if (iitmPyqsRes.data) setIitmBranchPyqs(iitmPyqsRes.data);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching initial data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchRecommendedCourses]); // Add fetchRecommendedCourses to dependency array

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // This function filters content based on profile
  const getFilteredContent = useCallback(
    (profile: any) => {
      if (!profile) return { ... }; // Your existing logic

      // ... All your existing filtering logic ...
      // (This function does not need to change)
    },
    [courses, notes, pyqs, importantDates, newsUpdates, communities]
  );

  const value = {
    courses,
    notes,
    pyqs,
    importantDates,
    newsUpdates,
    communities,
    iitmBranchNotes,
    iitmBranchPyqs,
    recommendedCourses, // --- 5. ADD TO THE CONTEXT VALUE ---
    loading,
    error,
    getFilteredContent,
    handleDownload: incrementDownloadCount, // Use the wrapped handler
  };

  return (
    <BackendContext.Provider value={value}>{children}</BackendContext.Provider>
  );
};

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error(
      "useBackend must be used within a BackendIntegratedWrapper"
    );
  }
  return context;
};
