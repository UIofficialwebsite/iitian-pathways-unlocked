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

// Define your content types
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
  recommendedCourses: Course[]; // <-- ADDED
  loading: boolean;
  error: Error | null;
  getFilteredContent: (
    profile: Database["public"]["Tables"]["profiles"]["Row"] | null
  ) => {
    courses: Course[];
    notes: Note[];
    pyqs: Pyq[];
    importantDates: ImportantDate[];
    newsUpdates: NewsUpdate[];
    communities: Community[];
  };
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
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]); // <-- ADDED
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

  // --- NEW FUNCTION TO FETCH RECOMMENDATIONS ---
  const fetchRecommendedCourses = useCallback(async () => {
    if (!user) return; // Only fetch if logged in

    try {
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
        // Log the error but don't crash the whole wrapper
        console.error("Error fetching recommended courses:", error);
        if (error.code === '42P01') {
          console.warn('"user_recommendations" table not found. Did you run the migration and update types?');
        }
        setRecommendedCourses([]); // Set empty array on error
        return; // Don't throw, just fail silently
      }

      if (data) {
        const formattedData = data
          .filter((rec) => rec.courses)
          .map((rec) => rec.courses);
        setRecommendedCourses(formattedData as unknown as Course[]);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setRecommendedCourses([]); // Set empty array on error
    }
  }, [user]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch recommendations in parallel with all other data
      const [
        coursesRes,
        notesRes,
        pyqsRes,
        datesRes,
        newsRes,
        commRes,
        iitmNotesRes,
        iitmPyqsRes,
        _recRes, // Fetch recs, but we'll handle its state in its own function
      ] = await Promise.allSettled([
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
        fetchRecommendedCourses(), // <-- CALL THE NEW FUNCTION
      ]);

      // Handle setting state from Promise.allSettled
      if (coursesRes.status === "fulfilled" && coursesRes.value.data)
        setCourses(coursesRes.value.data as unknown as Course[]);
      if (notesRes.status === "fulfilled" && notesRes.value.data)
        setNotes(notesRes.value.data);
      if (pyqsRes.status === "fulfilled" && pyqsRes.value.data)
        setPyqs(pyqsRes.value.data);
      if (datesRes.status === "fulfilled" && datesRes.value.data)
        setImportantDates(datesRes.value.data);
      if (newsRes.status === "fulfilled" && newsRes.value.data)
        setNewsUpdates(newsRes.value.data);
      if (commRes.status === "fulfilled" && commRes.value.data)
        setCommunities(commRes.value.data);
      if (iitmNotesRes.status === "fulfilled" && iitmNotesRes.value.data)
        setIitmBranchNotes(iitmNotesRes.value.data);
      if (iitmPyqsRes.status === "fulfilled" && iitmPyqsRes.value.data)
        setIitmBranchPyqs(iitmPyqsRes.value.data);

      // Check for any critical errors
      const firstError = [
        coursesRes,
        notesRes,
        pyqsRes,
        datesRes,
        newsRes,
        commRes,
        iitmNotesRes,
        iitmPyqsRes,
      ].find((res) => res.status === "rejected");
      if (firstError && firstError.status === "rejected") {
        throw firstError.reason;
      }

    } catch (err: any) {
      setError(err);
      console.error("Error fetching initial data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchRecommendedCourses]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- THIS IS THE FIXED FUNCTION ---
  const getFilteredContent = useCallback(
    (profile: Database["public"]["Tables"]["profiles"]["Row"] | null) => {
      // THIS IS THE FIX: Return an empty structure if no profile
      if (!profile) {
        return {
          courses: courses as Course[],
          notes: notes,
          pyqs: pyqs,
          importantDates: importantDates,
          newsUpdates: newsUpdates,
          communities: communities,
        };
      }

      const programType = profile.program_type;
      const examType = profile.exam_type;
      const studentStatus = profile.student_status;
      const branch = profile.branch;
      const level = profile.level;

      // This logic is based on your PersonalizedDashboard.tsx
      const filteredCourses = courses.filter((course) => {
        if (programType === "IITM_BS") {
          return (
            course.exam_category === "IITM BS" &&
            course.branch === branch &&
            course.level === level
          );
        }
        if (programType === "COMPETITIVE_EXAM") {
          return course.exam_category === examType;
        }
        return true; // Return all if no specific program
      });

      const filteredNotes = notes.filter((note) => {
        if (programType === "IITM_BS") {
          return (
            (note.exam_type === "IITM_BS" || note.exam_type === "IITM BS") &&
            note.branch === branch &&
            note.level === level
          );
        }
        if (programType === "COMPETITIVE_EXAM") {
          return (
            note.exam_type === examType &&
            (!note.class_level || note.class_level === studentStatus)
          );
        }
        return false;
      });

      const filteredPyqs = pyqs.filter((pyq) => {
        if (programType === "IITM_BS") {
          return (
            (pyq.exam_type === "IITM_BS" || pyq.exam_type === "IITM BS") &&
            pyq.branch === branch &&
            pyq.level === level
          );
        }
        if (programType === "COMPETITIVE_EXAM") {
          return (
            pyq.exam_type === examType &&
            (!pyq.class_level || pyq.class_level === studentStatus)
          );
        }
        return false;
      });

      const filteredDates = importantDates.filter((date) => {
        if (programType === "IITM_BS") {
          return (
            (date.exam_type === "IITM_BS" || date.exam_type === "IITM BS") &&
            date.branch === branch &&
            date.level === level
          );
        }
        if (programType === "COMPETITIVE_EXAM") {
          return date.exam_type === examType;
        }
        return false;
      });

      const filteredNews = newsUpdates.filter((news) => {
        if (programType === "IITM_BS") {
          return (
            (news.exam_type === "IITM_BS" || news.exam_type === "IITM BS") &&
            news.branch === branch &&
            news.level === level
          );
        }
        if (programType === "COMPETITIVE_EXAM") {
          return news.exam_type === examType;
        }
        return false;
      });

      const filteredCommunities = communities.filter((comm) => {
        if (programType === "IITM_BS") {
          return (
            (comm.exam_type === "IITM_BS" || comm.exam_type === "IITM BS") &&
            comm.branch === branch &&
            comm.level === level
          );
        }
        if (programType === "COMPETITIVE_EXAM") {
          return (
            comm.exam_type === examType &&
            (!comm.class_level || comm.class_level === studentStatus)
          );
        }
        return false;
      });

      return {
        courses: filteredCourses as Course[],
        notes: filteredNotes,
        pyqs: filteredPyqs,
        importantDates: filteredDates,
        newsUpdates: filteredNews,
        communities: filteredCommunities,
      };
    },
    [courses, notes, pyqs, importantDates, newsUpdates, communities]
  );

  const value = {
    courses: courses as Course[],
    notes,
    pyqs,
    importantDates,
    newsUpdates,
    communities,
    iitmBranchNotes,
    iitmBranchPyqs,
    recommendedCourses, // <-- PASS TO CONTEXT
    loading,
    error,
    getFilteredContent,
    handleDownload: incrementDownloadCount,
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
