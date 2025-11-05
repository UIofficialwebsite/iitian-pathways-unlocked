import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  userRole: string | null;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const checkAdminStatus = async (currentUser: User | null) => {
    // We need user info for the checks
    if (!currentUser?.id || !currentUser?.email) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setUserRole(null);
      return;
    }

    try {
      // Use RPC function to check admin status - this bypasses RLS issues
      const { data: isAdminResult, error: adminError } = await supabase
        .rpc('is_current_user_admin');
      
      if (adminError) {
        console.error('useAuth: Error checking admin status:', adminError);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } else {
        setIsAdmin(isAdminResult || false);
      }

      // Check if super admin using RPC function
      if (isAdminResult) {
        const { data: isSuperAdminResult, error: superAdminError } = await supabase
          .rpc('is_super_admin', { user_email: currentUser.email });
        
        if (superAdminError) {
          console.error('useAuth: Error checking super admin status:', superAdminError);
          setIsSuperAdmin(false);
        } else {
          setIsSuperAdmin(isSuperAdminResult || false);
        }
        
        setUserRole(isSuperAdminResult ? 'super_admin' : 'admin');
      } else {
        setIsSuperAdmin(false);
        
        // Check profiles table for role using 'id'
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();
        
        if (profileError && profileError.code !== 'PGRST116') {
          if (profileError.code !== '42501') {
            console.error('useAuth: Error checking profiles:', profileError);
          }
        }

        setUserRole(profile?.role || 'student');
      }
      
    } catch (error) {
      console.error('useAuth: Error in checkAdminStatus:', error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setUserRole('student');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setUserRole(null);
    } catch (error) {
      console.error('useAuth: Error signing out:', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('useAuth: Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Re-check admin status when user changes or loading completes
  useEffect(() => {
    // Only check status if not loading to prevent race conditions
    if (!isLoading) {
      checkAdminStatus(user).catch(console.error);
    }
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAdmin,
      isSuperAdmin,
      userRole,
      signOut,
      checkAdminStatus: () => checkAdminStatus(user)
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
