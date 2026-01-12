import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Note {
  id: string;
  title: string;
  description?: string;
  file_link: string;
  download_count: number;
  subject: string;
  subject_id: number; // Added field
  week_number: number;
  diploma_specialization?: string;
}

export interface GroupedData {
  subjectName: string;
  subjectId: number; // Added field
  specialization: string | null;
  notes: Note[];
}

const formatBranchName = (branch: string) => {
  return branch.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

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
    const dbBranchName = formatBranchName(branch);
    const dbLevelName = formatLevelName(level);

    try {
      // 1. Fetch Subjects (The Scaffolding)
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('iitm_bs_subjects')
        .select('*')
        .eq('branch', dbBranchName)
        .eq('level', dbLevelName)
        .order('display_order', { ascending: true });

      if (subjectsError) throw subjectsError;
      if (!subjectsData || subjectsData.length === 0) {
        setGroupedData([]);
        setLoading(false);
        return;
      }

      // 2. Fetch Notes using the Subject IDs
      const subjectIds = subjectsData.map(s => s.id);
      const { data: notesData, error: notesError } = await supabase
        .from('iitm_branch_notes')
        .select('*')
        .in('subject_id', subjectIds) // Filter by IDs for 100% accuracy
        .eq('is_active', true)
        .order('week_number', { ascending: true });

      if (notesError) throw notesError;

      // 3. Group Notes into Subjects
      const finalGroupedData: GroupedData[] = subjectsData.map((subject) => ({
        subjectName: subject.subject_name,
        subjectId: subject.id,
        specialization: subject.specialization || null,
        notes: (notesData as Note[] || []).filter(n => n.subject_id === subject.id),
      }));

      // 4. Update state
      const specializations = Array.from(new Set(subjectsData.map(s => s.specialization).filter(Boolean)));
      setGroupedData(finalGroupedData);
      setAvailableSpecializations(specializations as string[]);
      
    } catch (error: any) {
      toast({
        title: "Error fetching notes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [branch, level, toast]);

  useEffect(() => {
    reloadNotes();
  }, [reloadNotes]);

  return { loading, groupedData, availableSpecializations, reloadNotes };
};
