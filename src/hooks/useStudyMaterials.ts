import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type MaterialType = 'note' | 'question_bank' | 'mindmap' | 'pyq';

export interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  material_type: MaterialType;
  
  // Categorization
  exam_category: 'JEE' | 'NEET' | 'IITM_BS' | 'General' | null;
  subject: string | null;
  topic: string | null;
  
  // Specifics
  class_level: string | null;
  branch: string | null;
  level: string | null;
  week_number: number | null;
  year: number | null;
  session: string | null;
  
  // File info
  file_url: string;
  download_count: number;
  created_at: string;
}

export const useStudyMaterials = (typeFilter?: MaterialType) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (typeFilter) {
        query = query.eq('material_type', typeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMaterials(data as any[]);
    } catch (error: any) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Error",
        description: "Could not load study materials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [typeFilter]);

  return { materials, loading, refresh: fetchMaterials };
};
