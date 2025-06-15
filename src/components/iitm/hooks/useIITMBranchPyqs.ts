
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface IITMPYQ {
  id: string;
  title: string;
  description: string;
  year: number;
  downloads: number;
  subject?: string | null;
  branch?: string | null;
  level?: string | null;
  exam_type?: string | null;
  session?: string | null;
  shift?: string | null;
  file_link?: string | null;
  content_url?: string | null;
}

export interface UseIITMBranchPyqsResult {
  pyqs: IITMPYQ[];
  loading: boolean;
  groupedPyqs: Record<string, IITMPYQ[]>;
  getCurrentSubjects: (specialization?: string | null) => string[];
  getAvailableSpecializations: () => string[];
  reloadPyqs: () => void;
}

export function useIITMBranchPyqs(branch: string, level: string, examType?: string): UseIITMBranchPyqsResult {
  const [pyqs, setPyqs] = useState<IITMPYQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(0);
  const reloadPyqs = () => setReloadFlag((x) => x + 1);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        let query = supabase
          .from("pyqs")
          .select("*")
          .eq("is_active", true)
          .eq("exam_type", "IITM_BS")
          .eq("branch", branch)
          .eq("level", level);

        // Add exam type filter if provided (for non-qualifier levels)
        if (level !== 'qualifier' && examType) {
          // For IITM BS, we might use a different field structure
          // Adjust this based on how exam types are stored for IITM BS
        }

        const { data, error } = await query.order("year", { ascending: false });

        if (error) {
          throw error;
        }

        const mappedPyqs: IITMPYQ[] = (data || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          year: p.year || new Date().getFullYear(),
          downloads: p.download_count ?? 0,
          subject: p.subject || null,
          branch: p.branch || null,
          level: p.level || null,
          exam_type: p.exam_type || null,
          session: p.session || null,
          shift: p.shift || null,
          file_link: p.file_link || null,
          content_url: p.content_url || null,
        }));
        setPyqs(mappedPyqs);
      } catch (error) {
        console.error("Error fetching IITM PYQs:", error);
        setPyqs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [branch, level, examType, reloadFlag]);

  useEffect(() => {
    const channel = supabase
      .channel('iitm-pyqs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pyqs' },
        (payload) => {
          console.log('Real-time change detected in pyqs:', payload);
          reloadPyqs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getAvailableSpecializations = () => {
    if (level !== 'diploma') return [];
    const specializations = new Set<string>();
    // For PYQs, we might not have diploma specializations like notes
    // This can be extended based on requirements
    return Array.from(specializations).sort();
  };

  const groupedPyqs = pyqs.reduce((acc: Record<string, IITMPYQ[]>, pyq) => {
    const groupKey = pyq.subject || 'General';
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(pyq);
    return acc;
  }, {});

  const getCurrentSubjects = (specialization?: string | null) => {
    const subjects = new Set<string>();
    pyqs.forEach(pyq => {
      if (pyq.subject) {
        subjects.add(pyq.subject);
      }
    });
    return Array.from(subjects).sort();
  };

  return { pyqs, loading, groupedPyqs, getCurrentSubjects, getAvailableSpecializations, reloadPyqs };
}
