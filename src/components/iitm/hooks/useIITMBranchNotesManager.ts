import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface IITMNoteData {
  title: string;
  description?: string;
  subject: string;
  subject_id: number; // Linked to iitm_bs_subjects table
  branch: string;
  level: string;
  week_number: number;
  diploma_specialization?: string;
  file_link?: string;
}

export const useIITMBranchNotesManager = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const addIITMNote = useCallback(async (noteData: IITMNoteData): Promise<boolean> => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can add IITM notes.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('iitm_branch_notes')
        .insert([{
          title: noteData.title,
          description: noteData.description,
          subject: noteData.subject,
          subject_id: noteData.subject_id, // New required field
          branch: noteData.branch,
          level: noteData.level,
          week_number: noteData.week_number,
          diploma_specialization: noteData.diploma_specialization,
          file_link: noteData.file_link,
          is_active: true,
          download_count: 0
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "IITM note added successfully!",
      });
      return true;
    } catch (error: any) {
      console.error('Error adding IITM note:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add note.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, isAdmin]);

  const updateIITMNote = useCallback(async (noteId: string, updateData: Partial<IITMNoteData>): Promise<boolean> => {
    if (!isAdmin) return false;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('iitm_branch_notes')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (error) throw error;
      toast({ title: "Success", description: "Note updated successfully!" });
      return true;
    } catch (error: any) {
      toast({ title: "Update Error", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, isAdmin]);

  const deleteIITMNote = useCallback(async (noteId: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setLoading(true);
    try {
      // Perform a soft delete by setting is_active to false
      const { error } = await supabase
        .from('iitm_branch_notes')
        .update({ is_active: false })
        .eq('id', noteId);

      if (error) throw error;
      toast({ title: "Success", description: "Note deleted successfully!" });
      return true;
    } catch (error: any) {
      toast({ title: "Delete Error", description: error.message, variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, isAdmin]);

  return {
    addIITMNote,
    updateIITMNote,
    deleteIITMNote,
    loading,
    canManageNotes: isAdmin
  };
};
