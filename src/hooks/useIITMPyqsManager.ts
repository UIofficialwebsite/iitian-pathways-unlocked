import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IITMPyqData {
  title: string;
  description?: string;
  year?: number;
  subject?: string;
  branch?: string;
  level?: string;
  session?: string; // This is where "Quiz 1", "End Term" goes
  shift?: string;
  file_link?: string;
  content_url?: string;
}

export const useIITMPyqsManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addIITMPyq = useCallback(async (pyqData: IITMPyqData): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pyqs')
        .insert([{
          title: pyqData.title,
          description: pyqData.description,
          year: pyqData.year,
          subject: pyqData.subject,
          exam_type: 'IITM_BS', // Hardcoded as the main category
          branch: pyqData.branch,
          level: pyqData.level,
          session: pyqData.session, // Sub-exam name stored here
          shift: pyqData.shift,
          file_link: pyqData.file_link,
          content_url: pyqData.content_url,
          is_active: true,
          download_count: 0
        }]);

      if (error) {
        console.error('Error adding IITM PYQ:', error);
        toast({
          title: "Error",
          description: "Failed to add PYQ. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "IITM PYQ added successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error adding IITM PYQ:', error);
      toast({
        title: "Error",
        description: "Failed to add PYQ. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ... rest of update/delete functions (same as before) ...
  const updateIITMPyq = useCallback(async (pyqId: string, updateData: Partial<IITMPyqData>): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pyqs')
        .update({
          title: updateData.title,
          description: updateData.description,
          year: updateData.year,
          subject: updateData.subject,
          branch: updateData.branch,
          level: updateData.level,
          session: updateData.session,
          shift: updateData.shift,
          file_link: updateData.file_link,
          content_url: updateData.content_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', pyqId)
        .eq('exam_type', 'IITM_BS');

      if (error) {
        console.error('Error updating IITM PYQ:', error);
        toast({
          title: "Error",
          description: "Failed to update PYQ. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "IITM PYQ updated successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error updating IITM PYQ:', error);
      toast({
        title: "Error",
        description: "Failed to update PYQ. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteIITMPyq = useCallback(async (pyqId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pyqs')
        .update({ is_active: false })
        .eq('id', pyqId)
        .eq('exam_type', 'IITM_BS');

      if (error) {
        console.error('Error deleting IITM PYQ:', error);
        toast({
          title: "Error",
          description: "Failed to delete PYQ. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "IITM PYQ deleted successfully!",
      });
      return true;
    } catch (error) {
      console.error('Error deleting IITM PYQ:', error);
      toast({
        title: "Error",
        description: "Failed to delete PYQ. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    addIITMPyq,
    updateIITMPyq,
    deleteIITMPyq,
    loading
  };
};
