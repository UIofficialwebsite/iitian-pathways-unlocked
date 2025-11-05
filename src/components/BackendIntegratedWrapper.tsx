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
import { Course } from "@/components/admin/courses/types";
import { useDownloadHandler } from "@/hooks/useDownloadHandler";
import { useToast } from "@/components/ui/use-toast";

// Define content types
type Note = Database["public"]["Tables"]["notes"]["Row"];
type Pyq = Database["public"]["Tables"]["pyqs"]["Row"];
type ImportantDate = Database["public"]["Tables"]["important_dates"]["Row"];
type NewsUpdate = Database["public"]["Tables"]["news_updates"]["Row"];
type Community = Database["public"]["Tables"]["communities"]["Row"];
type IITMBranchNote = Database["public"]["Tables"]["iitm_branch_notes"]["Row"];
type IITMBranchPyq = Pyq;
type Job = Database["public"]["Tables"]["jobs"]["Row"];

interface BackendContextType {
  courses: Course[];
  notes: Note[];
  pyqs: Pyq[];
  importantDates: ImportantDate[];
  newsUpdates: NewsUpdate[];
  communities: Community[];
  iitmBranchNotes: IITMBranchNote[];
  iitmBranchPyqs: IITMBranchPyq[];
  recommendedCourses: any[];
  jobs: Job[];
  loading: boolean;
  contentLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  downloadCounts: Record<string, number>;
  isDownloadCountsInitialized: boolean;
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
  updateDownloadCount: (contentId: string, count: number) => void;
  addNote: (note: any) => Promise<boolean>;
  addPyq: (pyq: any) => Promise<boolean>;
  updateNote: (id: string, note: any) => Promise<boolean>;
  updatePyq: (id: string, pyq: any) => Promise<boolean>;
  deleteNote: (id: string) => Promise<void>;
  deletePyq: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  refreshPyqs: () => Promise<void>;
  createCourse: (course: any) => Promise<boolean>;
  updateCourse: (id: string, course: any) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<void>;
}

const BackendContext = createContext<BackendContextType | undefined>(undefined);

const emptyFilteredContent = {
  courses: [] as Course[],
  notes: [] as Note[],
  pyqs: [] as Pyq[],
  importantDates: [] as ImportantDate[],
  newsUpdates: [] as NewsUpdate[],
  communities: [] as Community[],
};

export const BackendIntegratedWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [pyqs, setPyqs] = useState<Pyq[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [iitmBranchNotes, setIitmBranchNotes] = useState<IITMBranchNote[]>([]);
  const [iitmBranchPyqs, setIitmBranchPyqs] = useState<IITMBranchPyq[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { 
    handleDownload, 
    downloadCounts, 
    updateDownloadCount,
    isInitialized: isDownloadCountsInitialized 
  } = useDownloadHandler();

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        const { data } = await supabase.rpc('is_current_user_admin');
        setIsAdmin(data || false);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user]);

  const fetchRecommendedCourses = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_recommendations")
        .select(`
          score,
          courses (
            id, title, description, price, discounted_price,
            duration, rating, features, bestseller, image_url,
            created_at, updated_at, subject, start_date, course_type,
            branch, level, enroll_now_link, students_enrolled,
            end_date, language, is_live, expiry_date, tags, exam_category
          )
        `)
        .order("score", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching recommended courses:", error);
        setRecommendedCourses([]);
        return;
      }

      if (data) {
        const formattedData = data
          .filter((rec) => rec.courses)
          .map((rec) => rec.courses);
        setRecommendedCourses(formattedData);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setRecommendedCourses([]);
    }
  }, [user]);

  const refreshNotes = useCallback(async () => {
    setContentLoading(true);
    try {
      const { data, error } = await supabase.from("notes").select("*");
      if (error) throw error;
      if (data) setNotes(data);
    } catch (err) {
      console.error("Error refreshing notes:", err);
    } finally {
      setContentLoading(false);
    }
  }, []);

  const refreshPyqs = useCallback(async () => {
    setContentLoading(true);
    try {
      const { data, error } = await supabase.from("pyqs").select("*");
      if (error) throw error;
      if (data) setPyqs(data);
    } catch (err) {
      console.error("Error refreshing pyqs:", err);
    } finally {
      setContentLoading(false);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        coursesRes,
        notesRes,
        pyqsRes,
        datesRes,
        newsRes,
        commRes,
        iitmNotesRes,
        iitmPyqsRes,
        jobsRes,
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
        supabase.from("jobs").select("*"),
      ]);

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
      if (jobsRes.status === "fulfilled" && jobsRes.value.data)
        setJobs(jobsRes.value.data);

      await fetchRecommendedCourses();

      const firstError = [
        coursesRes, notesRes, pyqsRes, datesRes,
        newsRes, commRes, iitmNotesRes, iitmPyqsRes, jobsRes,
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

  const getFilteredContent = useCallback(
    (profile: Database["public"]["Tables"]["profiles"]["Row"] | null) => {
      if (!profile) {
        return emptyFilteredContent;
      }

      const programType = profile.program_type;
      const examType = profile.exam_type;
      const studentStatus = profile.student_status;
      const branch = profile.branch;
      const level = profile.level;

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
        return true;
      });

      // Notes don't have branch/level, only exam_type and class_level
      const filteredNotes = notes.filter((note) => {
        if (programType === "IITM_BS") {
          return (note.exam_type === "IITM_BS" || note.exam_type === "IITM BS");
        }
        if (programType === "COMPETITIVE_EXAM") {
          return (
            note.exam_type === examType &&
            (!note.class_level || note.class_level === studentStatus)
          );
        }
        return false;
      });

      // PYQs do have branch/level
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

  const addNote = useCallback(async (note: any): Promise<boolean> => {
    try {
      const { error } = await supabase.from("notes").insert([note]);
      if (error) throw error;
      toast({ title: "Note added successfully" });
      await refreshNotes();
      return true;
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ title: "Error adding note", variant: "destructive" });
      return false;
    }
  }, [toast, refreshNotes]);

  const addPyq = useCallback(async (pyq: any): Promise<boolean> => {
    try {
      const { error } = await supabase.from("pyqs").insert([pyq]);
      if (error) throw error;
      toast({ title: "PYQ added successfully" });
      await refreshPyqs();
      return true;
    } catch (error) {
      console.error("Error adding PYQ:", error);
      toast({ title: "Error adding PYQ", variant: "destructive" });
      return false;
    }
  }, [toast, refreshPyqs]);

  const updateNote = useCallback(async (id: string, note: any): Promise<boolean> => {
    try {
      const { error } = await supabase.from("notes").update(note).eq("id", id);
      if (error) throw error;
      toast({ title: "Note updated successfully" });
      await refreshNotes();
      return true;
    } catch (error) {
      console.error("Error updating note:", error);
      toast({ title: "Error updating note", variant: "destructive" });
      return false;
    }
  }, [toast, refreshNotes]);

  const updatePyq = useCallback(async (id: string, pyq: any): Promise<boolean> => {
    try {
      const { error } = await supabase.from("pyqs").update(pyq).eq("id", id);
      if (error) throw error;
      toast({ title: "PYQ updated successfully" });
      await refreshPyqs();
      return true;
    } catch (error) {
      console.error("Error updating PYQ:", error);
      toast({ title: "Error updating PYQ", variant: "destructive" });
      return false;
    }
  }, [toast, refreshPyqs]);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Note deleted successfully" });
      await refreshNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({ title: "Error deleting note", variant: "destructive" });
    }
  }, [toast, refreshNotes]);

  const deletePyq = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from("pyqs").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "PYQ deleted successfully" });
      await refreshPyqs();
    } catch (error) {
      console.error("Error deleting PYQ:", error);
      toast({ title: "Error deleting PYQ", variant: "destructive" });
    }
  }, [toast, refreshPyqs]);

  const createCourse = useCallback(async (course: any): Promise<boolean> => {
    try {
      const { error } = await supabase.from("courses").insert([course]);
      if (error) throw error;
      toast({ title: "Course created successfully" });
      await fetchInitialData();
      return true;
    } catch (error) {
      console.error("Error creating course:", error);
      toast({ title: "Error creating course", variant: "destructive" });
      return false;
    }
  }, [toast, fetchInitialData]);

  const updateCourse = useCallback(async (id: string, course: any): Promise<boolean> => {
    try {
      const { error } = await supabase.from("courses").update(course).eq("id", id);
      if (error) throw error;
      toast({ title: "Course updated successfully" });
      await fetchInitialData();
      return true;
    } catch (error) {
      console.error("Error updating course:", error);
      toast({ title: "Error updating course", variant: "destructive" });
      return false;
    }
  }, [toast, fetchInitialData]);

  const deleteCourse = useCallback(async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Course deleted successfully" });
      await fetchInitialData();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({ title: "Error deleting course", variant: "destructive" });
    }
  }, [toast, fetchInitialData]);

  const value = {
    courses: courses as Course[],
    notes,
    pyqs,
    importantDates,
    newsUpdates,
    communities,
    iitmBranchNotes,
    iitmBranchPyqs,
    recommendedCourses,
    jobs,
    loading,
    contentLoading,
    error,
    isAdmin,
    downloadCounts,
    isDownloadCountsInitialized,
    getFilteredContent,
    handleDownload,
    updateDownloadCount,
    addNote,
    addPyq,
    updateNote,
    updatePyq,
    deleteNote,
    deletePyq,
    refreshNotes,
    refreshPyqs,
    createCourse,
    updateCourse,
    deleteCourse,
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
