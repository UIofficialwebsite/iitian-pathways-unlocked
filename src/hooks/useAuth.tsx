import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
// We keep the client only for DB/RPC calls if needed, but NOT for auth session
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
    // If purely client-side Google Auth, we default to Student.
    // Logic for admin checks via Supabase DB (profiles table) can remain 
    // if you have a way to match the Google email to a profile row.
    if (!currentUser) {
       setIsAdmin(false);
       setIsSuperAdmin(false);
       setUserRole(null);
       return;
    }

    // Default to student for all direct Google logins
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setUserRole('student');
  };

  const signOut = async () => {
    // STRICT: Only clear local storage. No Supabase signOut call.
    localStorage.removeItem('google_user');
    localStorage.removeItem('google_id_token');
    
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
    setUserRole(null);
    
    // Force reload to reset all app states/cache
    window.location.href = '/';
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      // --- STRICT CHECK: ONLY LOCAL STORAGE ---
      const localGoogleUser = localStorage.getItem('google_user');
      const localIdToken = localStorage.getItem('google_id_token');

      if (localGoogleUser && localIdToken) {
        try {
          const parsedUser = JSON.parse(localGoogleUser);
          
          // Construct User object from Local Data
          const googleUser: User = {
            id: parsedUser.sub,
            aud: 'google_client',
            role: 'authenticated',
            email: parsedUser.email,
            email_confirmed_at: new Date().toISOString(),
            phone: '',
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            app_metadata: {
              provider: 'google_direct_client',
              providers: ['google']
            },
            user_metadata: {
              full_name: parsedUser.name,
              avatar_url: parsedUser.picture,
              ...parsedUser
            },
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
        } catch (e) {
          console.error("Corrupt local session, clearing...", e);
          localStorage.removeItem('google_user');
          localStorage.removeItem('google_id_token');
          setUser(null);
        }
      } else {
        // No local user found -> User is null
        setUser(null);
        setSession(null);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
    // Note: No supabase.auth.onAuthStateChange listener here. 
    // We rely entirely on the manual storage check above.
  }, []);

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
