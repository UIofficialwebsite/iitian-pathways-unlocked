
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Note {
  id: string;
  title: string;
  subject: string | null;
  file_link: string | null;
  download_count: number;
  created_by: string | null;
  is_active: boolean;
  content_url: string | null;
  description: string | null;
  class_level: string | null;
  exam_type: string | null;
  branch: string | null;
  level: string | null;
  session: string | null;
  shift: string | null;
  display_order_no: number | null;
  created_at: string;
  updated_at?: string;
}

export const useNotesManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data as unknown as Note[]) || []);
    } catch (error: any) {
      toast({
        title: "Load Error",
        description: "Failed to load notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const addNote = async (noteData: Omit<Note, 'id' | 'download_count' | 'created_by' | 'is_active' | 'created_at'>): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to add content",
        variant: "destructive"
      });
      return false;
    }
    try {
      const { error } = await supabase
        .from('notes')
        .insert([{
          ...noteData,
          created_by: user.id,
          download_count: 0,
          is_active: true,
        }]);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Note added successfully!",
      });
      await fetchNotes();
      return true;
    } catch (error: any) {
      toast({
        title: "Add Error",
        description: error.message || "Failed to add note",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteNote = async (noteId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_active: false })
        .eq('id', noteId);
      if (error) throw error;
      toast({ title: "Success", description: "Note deleted successfully" });
      await fetchNotes();
      return true;
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: "Failed to delete note",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateNote = async (noteId: string, updateData: Partial<Note>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', noteId);
      if (error) throw error;
      toast({ title: "Success", description: "Note updated successfully" });
      await fetchNotes();
      return true;
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: "Failed to update note",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchNotes();

    const channel = supabase
      .channel('public:notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (payload) => {
          console.log('Real-time change detected in notes, refetching...', payload);
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotes]);

  return {
    notes,
    loading,
    addNote,
    deleteNote,
    updateNote,
    fetchNotes,
  };
};

