import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
    if (!currentUser) {
       setIsAdmin(false); setIsSuperAdmin(false); setUserRole(null); return;
    }
    // Direct Google users are strictly students
    if (currentUser.app_metadata?.provider === 'google_direct_client') {
      setIsAdmin(false); setIsSuperAdmin(false); setUserRole('student'); return;
    }
    // Fallback for regular Supabase users...
    setIsAdmin(false); setUserRole('student');
  };

  const signOut = async () => {
    // Clear LOCAL first
    localStorage.removeItem('google_user');
    localStorage.removeItem('google_id_token');
    
    // Clear SUPABASE second
    await supabase.auth.signOut();
    
    setUser(null); setSession(null);
    window.dispatchEvent(new Event('google-auth-change')); 
    window.location.href = '/';
  };

  const initializeAuth = useCallback(async () => {
    setIsLoading(true);

    // 1. Check Local Google Session FIRST
    const localGoogleUser = localStorage.getItem('google_user');
    const localIdToken = localStorage.getItem('google_id_token');

    if (localGoogleUser && localIdToken) {
      try {
        const parsedUser = JSON.parse(localGoogleUser);
        const googleUser: User = {
          id: parsedUser.sub,
          aud: 'google_client',
          role: 'authenticated',
          email: parsedUser.email,
          email_confirmed_at: new Date().toISOString(),
          phone: '',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          app_metadata: { provider: 'google_direct_client', providers: ['google'] },
          user_metadata: { full_name: parsedUser.name, avatar_url: parsedUser.picture, ...parsedUser },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_anonymous: false
        };
        const googleSession: Session = {
          access_token: localIdToken,
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: '',
          user: googleUser
        };

        setUser(googleUser);
        setSession(googleSession);
        setIsLoading(false);
        return; // Stop here if Google user found
      } catch (e) {
        localStorage.removeItem('google_user');
      }
    }

    // 2. Fallback to Supabase (Only if no Google user)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();

    // Listen for our custom event
    const handleAuthChange = () => initializeAuth();
    window.addEventListener('google-auth-change', handleAuthChange);
    
    // Listen for Supabase changes (only updates if we aren't using Google)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem('google_user')) {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    return () => {
      window.removeEventListener('google-auth-change', handleAuthChange);
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
