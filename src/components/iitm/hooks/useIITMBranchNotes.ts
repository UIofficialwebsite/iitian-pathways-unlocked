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

// Type for a subject from your new iitm_bs_subjects table
export interface Subject {
  id: number;
  branch: string;
  level: string;
  subject_name: string;
  specialization: string | null;
}

// Type for a Week that contains its notes
export interface WeekData {
  week: number;
  notes: Note[];
}

// The final data structure: an array of Subjects, each containing weeks with their notes
export interface GroupedData {
  subjectName: string;
  specialization: string | null;
  weeks: WeekData[];
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
        .from('iitm_bs_subjects')
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
        .eq('level', dbLevelName);

      if (notesError) throw notesError;

      // 3. Create a fast lookup map for the notes
      // Map<SubjectName, Map<WeekNumber, Note[]>>
      const notesMap = new Map<string, Map<number, Note[]>>();
      if (notesData) {
        for (const note of notesData as Note[]) {
          if (!notesMap.has(note.subject)) {
            notesMap.set(note.subject, new Map<number, Note[]>());
          }
          if (!notesMap.get(note.subject)!.has(note.week_number)) {
            notesMap.get(note.subject)!.set(note.week_number, []);
          }
          notesMap.get(note.subject)!.get(note.week_number)!.push(note);
        }
      }
      
      // 4. Collect all unique specializations
      const specializationsSet = new Set<string>();
      subjectsData.forEach(s => {
        if(s.specialization) specializationsSet.add(s.specialization);
      });

      // 5. Build the final structure (Subject > Week 1-12 > Notes)
      const finalGroupedData: GroupedData[] = subjectsData.map((subject: Subject) => {
        const weeks: WeekData[] = [];
        const subjectNotes = notesMap.get(subject.subject_name);

        // Create all 12 weeks for this subject
        for (let i = 1; i <= 12; i++) {
          // Find notes for this specific week, or use an empty array
          const notesForWeek = subjectNotes ? (subjectNotes.get(i) || []) : [];
          
          weeks.push({
            week: i,
            notes: notesForWeek,
          });
        }

        return {
          subjectName: subject.subject_name,
          specialization: subject.specialization || null,
          weeks: weeks,
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
