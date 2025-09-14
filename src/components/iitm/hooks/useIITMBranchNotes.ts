import { useState, useEffect, useCallback } from "react";
// THIS IS THE CORRECTED IMPORT PATH TO FIX THE BUILD
import { supabase } from "../../../integrations/supabase/client";

export interface Note {
  id: string;
  title: string;
  description: string;
  week: number;
  downloads: number;
  subject?: string | null;
  diploma_specialization?: string | null;
}

export interface UseIITMBranchNotesResult {
  notes: Note[];
  loading: boolean;
  groupedNotes: Record<string, Note[]>;
  getCurrentSubjects: (specialization?: string | null) => string[];
  getAvailableSpecializations: () => string[];
  reloadNotes: () => void;
}

export function useIITMBranchNotes(branch: string, level: string): UseIITMBranchNotesResult {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadFlag, setReloadFlag] = useState(0);
  const reloadNotes = useCallback(() => setReloadFlag((x) => x + 1), []);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("iitm_branch_notes")
          .select("*")
          .eq("is_active", true)
          .eq("branch", branch)
          .eq("level", level)
          .order("subject", { ascending: true })
          .order("week_number", { ascending: true });

        if (error) {
          throw error;
        }

        const mappedNotes: Note[] = (data || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          description: n.description || "",
          week: n.week_number || 1,
          downloads: n.download_count ?? 0,
          subject: n.subject || null,
          diploma_specialization: n.diploma_specialization || null,
        }));
        setNotes(mappedNotes);
      } catch (error) {
        console.error("Error fetching IITM notes:", error);
        setNotes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [branch, level, reloadFlag]);

  useEffect(() => {
    const channel = supabase
      .channel('public:iitm_branch_notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'iitm_branch_notes' },
        () => {
          reloadNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reloadNotes]);

  const getAvailableSpecializations = () => {
    if (level !== 'diploma') return [];
    const specializations = new Set<string>();
    notes.forEach(note => {
      if (note.diploma_specialization) {
        specializations.add(note.diploma_specialization);
      }
    });
    return Array.from(specializations).sort();
  };

  const groupedNotes = notes.reduce((acc: Record<string, Note[]>, note) => {
    if (note.subject) {
      if (!acc[note.subject]) {
        acc[note.subject] = [];
      }
      acc[note.subject].push(note);
    }
    return acc;
  }, {});

  const getCurrentSubjects = (specialization?: string | null) => {
    let filteredNotes = notes;
    if (level === 'diploma' && specialization && specialization !== 'all') {
      filteredNotes = notes.filter(n => n.diploma_specialization === specialization);
    }
    
    const subjects = new Set<string>();
    filteredNotes.forEach(note => {
        if (note.subject) {
            subjects.add(note.subject);
        }
    });
    return Array.from(subjects).sort();
  };

  return { notes, loading, groupedNotes, getCurrentSubjects, getAvailableSpecializations, reloadNotes };
}
