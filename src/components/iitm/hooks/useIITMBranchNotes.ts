import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Type for a single note
export interface Note {
  id: string;
  title: string;
  description?: string;
  file_link: string;
  download_count: number;
  // Add other note fields if needed
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

export const useIITMBranchNotes = (branch: string, level: string) => {
  const [loading, setLoading] = useState(false);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);

  const reloadNotes = useCallback(async () => {
    setLoading(true);
    setGroupedData([]);
    setAvailableSpecializations([]);

    try {
      const dbBranchName = formatBranchName(branch);

      // 1. Fetch the subject structure from the new table
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('iitm_bs_subjects')
        .select('*')
        .eq('branch', dbBranchName)
        .eq('level', level)
        .order('week', { ascending: true })
        .order('display_order', { ascending: true });

      if (subjectsError) throw subjectsError;
      if (!subjectsData || subjectsData.length === 0) {
        setLoading(false);
        return; // No subjects found
      }

      // 2. Fetch all notes for this branch and level
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('id, title, description, file_link, download_count, subject') // Only select needed fields
        .eq('exam_type', 'IITM_BS')
        .eq('branch', dbBranchName)
        .eq('level', level);

      if (notesError) throw notesError;

      // 3. Process and group the data
      
      // Create a quick lookup map for notes
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

      // Create a map to hold subjects grouped by week
      const weeksMap = new Map<number, SubjectWithNotes[]>();
      const specializations = new Set<string>();

      for (const subject of subjectsData as SubjectStructure[]) {
        const week = subject.week || 0; // Group subjects with null week under 'Week 0' or similar
        
        // Find notes for this subject
        const notes = notesMap.get(subject.subject_name) || [];

        // Add to week map
        if (!weeksMap.has(week)) {
          weeksMap.set(week, []);
        }
        weeksMap.get(week)!.push({ ...subject, notes });

        // Collect specializations
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
  }, [branch, level]);

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
