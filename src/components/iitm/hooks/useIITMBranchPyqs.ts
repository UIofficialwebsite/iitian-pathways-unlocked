import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase';

interface PYQ {
  year: number;
  type: string;
  pdfUrl: string;
}

interface Subject {
  name:string;
  pyqs: PYQ[];
}

export const useIITMBranchPyqs = (branch: string, level: string) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPyqs = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('iitm_bs_pyqs')
        .select('subject_name, year, type, pdf_url')
        .eq('branch', branch)
        .eq('level', level);

      // DEBUG LINE: This will show us the raw data from the database
      console.log(`PYQs data for ${branch}/${level}:`, data);

      if (error) {
        setError(error.message);
        setSubjects([]);
      } else if (data) {
        const groupedSubjects: { [key: string]: Subject } = {};

        data.forEach(item => {
          if (!groupedSubjects[item.subject_name]) {
            groupedSubjects[item.subject_name] = {
              name: item.subject_name,
              pyqs: [],
            };
          }
          groupedSubjects[item.subject_name].pyqs.push({
            year: item.year,
            type: item.type,
            pdfUrl: item.pdf_url,
          });
        });

        setSubjects(Object.values(groupedSubjects));
      } else {
        setSubjects([]);
      }

      setLoading(false);
    };

    fetchPyqs();
  }, [branch, level]);

  return { subjects, loading, error };
};
