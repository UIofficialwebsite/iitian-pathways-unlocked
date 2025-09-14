import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';

// Define the structure of a note and a subject
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
  const [subjects, setSubjects] = useState<Subject[]>([]); // Initialize with empty array
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

      if (error) {
        setError(error.message);
        setSubjects([]); // Ensure subjects is an empty array on error
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
        setSubjects([]); // Ensure subjects is an empty array if no data
      }
      
      setLoading(false);
    };

    fetchNotes();
  }, [branch, level]);

  return { subjects, loading, error };
};
