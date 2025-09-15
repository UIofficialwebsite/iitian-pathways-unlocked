import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuditLogEntry {
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
}

export const useAdminAudit = () => {
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  const logAdminAction = async (entry: AuditLogEntry) => {
    try {
      setIsLogging(true);
      
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('User not authenticated');
      }

      // Get user agent and IP (limited in browser environment)
      const userAgent = navigator.userAgent;
      
      const { error } = await supabase
        .from('admin_audit_log')
        .insert({
          admin_user_id: user.id,
          admin_email: user.email,
          action: entry.action,
          table_name: entry.table_name,
          record_id: entry.record_id,
          old_values: entry.old_values,
          new_values: entry.new_values,
          user_agent: userAgent,
          // IP address would need to be collected server-side
        });

      if (error) {
        console.error('Failed to log admin action:', error);
        // Don't show error to user as this is background logging
      }
    } catch (error) {
      console.error('Error logging admin action:', error);
    } finally {
      setIsLogging(false);
    }
  };

  const logWithConfirmation = async (
    actionDescription: string,
    confirmationMessage: string,
    action: () => Promise<void>,
    auditEntry: AuditLogEntry
  ) => {
    const confirmed = window.confirm(
      `${confirmationMessage}\n\nThis action will be logged for security purposes.`
    );
    
    if (!confirmed) {
      return false;
    }

    try {
      await action();
      await logAdminAction({
        ...auditEntry,
        action: `${auditEntry.action} - ${actionDescription}`,
      });
      
      toast({
        title: "Action completed",
        description: actionDescription,
      });
      
      return true;
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      
      // Log the failed attempt
      await logAdminAction({
        ...auditEntry,
        action: `FAILED: ${auditEntry.action} - ${actionDescription}`,
      });
      
      return false;
    }
  };

  return {
    logAdminAction,
    logWithConfirmation,
    isLogging,
  };
};