import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Type for a single note
export interface Note {
  id: string;
  title: string;
  description?: string;
  file_link: string;
  download_count: number;
  subject: string; // Ensure subject is part of the type
}

// Type for a subject row from your new table
export interface SubjectStructure {
  id: number;
  branch: string;
  level: string;
  subject_name: string;
  week: number | null;
  specialization: string | null;
  display_order: number;
}

// Type for a subject that also contains its notes
export interface SubjectWithNotes extends SubjectStructure {
  notes: Note[];
}

// The final data structure: an array of weeks, each containing subjects with their notes
export interface GroupedData {
  week: number;
  subjects: SubjectWithNotes[];
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
    if (!branch || !level) return; // Don't fetch if filters aren't set

    setLoading(true);
    setGroupedData([]);
    setAvailableSpecializations([]);

    // --- FIX: Capitalize branch and level ---
    const dbBranchName = formatBranchName(branch);
    const dbLevelName = formatLevelName(level);
    // ----------------------------------------

    try {
      // 1. Fetch the subject structure from the new table
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('iitm_bs_subjects')
        .select('*')
        .eq('branch', dbBranchName)
        .eq('level', dbLevelName) // Use capitalized level
        .order('week', { ascending: true })
        .order('display_order', { ascending: true });

      if (subjectsError) throw subjectsError;
      if (!subjectsData || subjectsData.length === 0) {
        setLoading(false);
        // This is normal if no subjects are in the DB for this filter
        return; 
      }

      // 2. Fetch all notes for this branch and level
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id, title, description, file_link, download_count, subject')
        .eq('exam_type', 'IITM_BS')
        .eq('branch', dbBranchName)
        .eq('level', dbLevelName); // Use capitalized level

      if (notesError) throw notesError;

      // 3. Process and group the data
      const notesMap = new Map<string, Note[]>();
      if (notesData) {
        for (const note of notesData) {
          if (!note.subject) continue;
          if (!notesMap.has(note.subject)) {
            notesMap.set(note.subject, []);
          }
          notesMap.get(note.subject)!.push(note as Note);
        }
      }

      const weeksMap = new Map<number, SubjectWithNotes[]>();
      const specializations = new Set<string>();

      for (const subject of subjectsData as SubjectStructure[]) {
        const week = subject.week || 0; 
        
        // Find notes for this subject
        const notes = notesMap.get(subject.subject_name) || [];

        if (!weeksMap.has(week)) {
          weeksMap.set(week, []);
        }
        weeksMap.get(week)!.push({ ...subject, notes });

        if (subject.specialization) {
          specializations.add(subject.specialization);
        }
      }

      // 4. Convert maps to the final array structure
      const finalGroupedData: GroupedData[] = Array.from(weeksMap.keys())
        .sort((a, b) => a - b) // Sort by week number
        .map(week => ({
          week,
          subjects: weeksMap.get(week)!,
        }));

      setGroupedData(finalGroupedData);
      setAvailableSpecializations(Array.from(specializations));
      
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
