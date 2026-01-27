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
    if (!currentUser?.id || !currentUser?.email) {
      setIsAdmin(false); setIsSuperAdmin(false); setUserRole(null); return;
    }

    try {
      const { data: isAdminResult } = await supabase.rpc('is_current_user_admin');
      setIsAdmin(isAdminResult || false);

      if (isAdminResult) {
        const { data: isSuperAdminResult } = await supabase.rpc('is_super_admin', { user_email: currentUser.email });
        setIsSuperAdmin(isSuperAdminResult || false);
        setUserRole(isSuperAdminResult ? 'super_admin' : 'admin');
      } else {
        setIsSuperAdmin(false);
        // We can safely query by ID now because ID is a valid UUID
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).maybeSingle();
        setUserRole(profile?.role || 'student');
      }
    } catch (error) {
      console.error('useAuth: Error in checkAdminStatus:', error);
      setIsAdmin(false); setUserRole('student');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // Clear all auth state immediately
      setUser(null); 
      setSession(null); 
      setIsAdmin(false); 
      setUserRole(null);
      
      // REMOVED: window.location.href = '/'; 
      // This line was causing a race condition where the page reloaded 
      // before the local storage token was fully cleared, causing auto-relogin.
      // Navigation is now handled by the component calling signOut (e.g., NavBar).
    }
  };

  useEffect(() => {
    setIsLoading(true);
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Listen for changes (e.g., after Google Login completes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading) checkAdminStatus(user);
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={{ 
      user, session, isLoading, isAdmin, isSuperAdmin, userRole, signOut, 
      checkAdminStatus: () => checkAdminStatus(user) 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
