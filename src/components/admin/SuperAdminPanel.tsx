
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, UserPlus, Shield, AlertTriangle } from "lucide-react";
import { useAdminAudit } from "@/hooks/useAdminAudit";

interface AdminUser {
  id: string;
  email: string;
  is_super_admin: boolean;
  created_at: string;
}

const SuperAdminPanel: React.FC = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { logWithConfirmation } = useAdminAudit();

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const addAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (!newAdminEmail.includes('@')) {
      toast({
        title: "Error", 
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    const success = await logWithConfirmation(
      `Added ${newAdminEmail} as admin`,
      `Are you sure you want to add ${newAdminEmail} as an admin user?`,
      async () => {
        const { error } = await supabase
          .from('admin_users')
          .insert([{ email: newAdminEmail.toLowerCase().trim() }]);

        if (error) {
          throw error;
        }
      },
      {
        action: 'ADD_ADMIN',
        table_name: 'admin_users',
        new_values: { email: newAdminEmail.toLowerCase().trim() },
      }
    );

    if (success) {
      setNewAdminEmail('');
      fetchAdminUsers();
    }
  };

  const removeAdmin = async (adminId: string, email: string) => {
    if (email === 'uiwebsite638@gmail.com') {
      toast({
        title: "Error",
        description: "Cannot remove the primary super admin account",
        variant: "destructive",
      });
      return;
    }

    await logWithConfirmation(
      `Removed ${email} from admin list`,
      `Are you sure you want to remove ${email} from the admin list? This action cannot be undone.`,
      async () => {
        const { error } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', adminId);

        if (error) {
          throw error;
        }
      },
      {
        action: 'REMOVE_ADMIN',
        table_name: 'admin_users',
        record_id: adminId,
        old_values: { email },
      }
    );

    fetchAdminUsers();
  };

  const toggleSuperAdmin = async (adminId: string, currentStatus: boolean, email: string) => {
    const action = !currentStatus ? 'granted' : 'revoked';
    
    await logWithConfirmation(
      `Super admin privileges ${action} for ${email}`,
      `Are you sure you want to ${!currentStatus ? 'grant' : 'revoke'} super admin privileges for ${email}?`,
      async () => {
        const { error } = await supabase
          .from('admin_users')
          .update({ is_super_admin: !currentStatus })
          .eq('id', adminId);

        if (error) {
          throw error;
        }
      },
      {
        action: 'TOGGLE_SUPER_ADMIN',
        table_name: 'admin_users',
        record_id: adminId,
        old_values: { is_super_admin: currentStatus, email },
        new_values: { is_super_admin: !currentStatus, email },
      }
    );

    fetchAdminUsers();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Management
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 mb-2">
          <AlertTriangle className="h-4 w-4" />
          All admin actions are logged for security audit purposes
        </div>
        <CardDescription>
          Manage admin users who can create and modify content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new admin */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter email address"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addAdmin()}
          />
          <Button onClick={addAdmin} disabled={isLoading}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {/* Admin users list */}
        <div className="space-y-2">
          {adminUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No admin users found</p>
          ) : (
            adminUsers.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{admin.email}</p>
                  <p className="text-sm text-gray-500">
                    {admin.is_super_admin ? 'Super Admin' : 'Admin'} • Added {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {admin.email !== 'uiwebsite638@gmail.com' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSuperAdmin(admin.id, admin.is_super_admin, admin.email)}
                      >
                        {admin.is_super_admin ? 'Remove Super' : 'Make Super'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeAdmin(admin.id, admin.email)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuperAdminPanel;
