import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Type for a single note from your iitm_branch_notes table
export interface Note {
  id: string;
  title: string;
  description?: string;
  file_link: string;
  download_count: number;
  subject: string;
  week_number: number;
  diploma_specialization?: string;
}

// Type for a subject from your iitm_bs_subjects table
export interface Subject {
  id: number;
  branch: string;
  level: string;
  subject_name: string;
  specialization: string | null;
}

// The final data structure: an array of Subjects, each containing its notes
export interface GroupedData {
  subjectName: string;
  specialization: string | null;
  notes: Note[]; // A simple array of notes, ordered by week
}

// Helper to convert 'data-science' to 'Data Science'
const formatBranchName = (branch: string) => {
  return branch
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper to convert 'foundation' to 'Foundation'
const formatLevelName = (level: string) => {
  return level.charAt(0).toUpperCase() + level.slice(1);
};

export const useIITMBranchNotes = (branch: string, level: string) => {
  const [loading, setLoading] = useState(false);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const { toast } = useToast();

  const reloadNotes = useCallback(async () => {
    if (!branch || !level) return;

    setLoading(true);
    setGroupedData([]);
    setAvailableSpecializations([]);

    const dbBranchName = formatBranchName(branch);
    const dbLevelName = formatLevelName(level);

    try {
      // 1. Fetch the Subject Structure (The "Scaffolding")
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('iitm_bs_subjects' as any)
        .select('*')
        .eq('branch', dbBranchName)
        .eq('level', dbLevelName)
        .order('display_order', { ascending: true });

      if (subjectsError) throw subjectsError;
      if (!subjectsData || subjectsData.length === 0) {
        setLoading(false);
        return; // No subjects defined for this course
      }

      // 2. Fetch all available Notes (The "Content")
      const { data: notesData, error: notesError } = await supabase
        .from('iitm_branch_notes')
        .select('*')
        .eq('branch', dbBranchName)
        .eq('level', dbLevelName)
        .order('week_number', { ascending: true }) // Order notes by week
        .order('title', { ascending: true });

      if (notesError) throw notesError;

      // 3. Create a fast lookup map for the notes
      // Map<SubjectName, Note[]>
      const notesMap = new Map<string, Note[]>();
      if (notesData) {
        for (const note of notesData as Note[]) {
          if (!notesMap.has(note.subject)) {
            notesMap.set(note.subject, []);
          }
          notesMap.get(note.subject)!.push(note);
        }
      }
      
      // 4. Collect all unique specializations
      const specializationsSet = new Set<string>();
      (subjectsData as any[]).forEach((s: any) => {
        if(s.specialization) specializationsSet.add(s.specialization);
      });

      // 5. Build the final structure (Subject > Notes)
      const finalGroupedData: GroupedData[] = (subjectsData as any[]).map((subject: any) => {
        // Find all notes for this subject, or use an empty array
        const notesForSubject = notesMap.get(subject.subject_name) || [];

        return {
          subjectName: subject.subject_name,
          specialization: subject.specialization || null,
          notes: notesForSubject,
        };
      });

      setGroupedData(finalGroupedData);
      setAvailableSpecializations(Array.from(specializationsSet));
      
    } catch (error: any) {
      toast({
        title: "Error fetching notes",
        description: error.message || "Could not load data from the database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [branch, level, toast]);

  useEffect(() => {
    reloadNotes();
  }, [reloadNotes]);

  return {
    loading,
    groupedData,
    availableSpecializations,
    reloadNotes,
  };
};
