import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';

interface Note {
  week: number;
  topic: string;
  pdfUrl: string;
}

interface Subject {
  name: string;
  notes: Note[];
}

export const useIITMBranchNotes = (branch: string, level: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('iitm_bs_notes')
        .select('subject_name, week, topic, pdf_url')
        .eq('branch', branch)
        .eq('level', level);

      // DEBUG LINE: This will show us the raw data from the database
      console.log(`Notes data for ${branch}/${level}:`, data);

      if (error) {
        setError(error.message);
        setSubjects([]);
      } else if (data) {
        const groupedSubjects: { [key: string]: Subject } = {};

        data.forEach(item => {
          if (!groupedSubjects[item.subject_name]) {
            groupedSubjects[item.subject_name] = {
              name: item.subject_name,
              notes: [],
            };
          }
          groupedSubjects[item.subject_name].notes.push({
            week: item.week,
            topic: item.topic,
            pdfUrl: item.pdf_url,
          });
        });

        setSubjects(Object.values(groupedSubjects));
      } else {
        setSubjects([]);
      }
      
      setLoading(false);
    };

    fetchNotes();
  }, [branch, level]);

  return { subjects, loading, error };
};
