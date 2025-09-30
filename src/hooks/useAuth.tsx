import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  signOut: () => Promise<void>;
  checkAdminStatus: (user: User | null) => Promise<void>;
}

// Environment variables for admin emails
const SUPER_ADMINS = (
  import.meta.env.VITE_SUPER_ADMINS || ""
).split(",");
const ADMIN_EMAILS = (
  import.meta.env.VITE_ADMIN_EMAILS || ""
).split(",");

// Create the authentication context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// AuthProvider component to wrap the application
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = useCallback(async (user: User | null) => {
    if (!user) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return;
    }

    const userEmail = user.email;

    if (userEmail && SUPER_ADMINS.includes(userEmail)) {
      setIsAdmin(true);
      setIsSuperAdmin(true);
      return;
    }

    // Check against general admin list
    if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
      setIsAdmin(true);
      setIsSuperAdmin(false);
      return;
    }

    // Fallback to database check - use admin_users table
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("email, is_super_admin")
        .eq("email", userEmail)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        // 'PGRST116' means no rows found, which is not an error here.
        console.error("Error checking admin status:", error);
      }

      if (data) {
        setIsAdmin(true);
        setIsSuperAdmin(data.is_super_admin);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status from DB:", error);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    }
  }, []);


  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await checkAdminStatus(currentUser);
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (
        _event: AuthChangeEvent,
        session: Session | null
      ) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(true);
        await checkAdminStatus(currentUser);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const value = {
    user,
    session,
    isAdmin,
    isSuperAdmin,
    loading,
    isLoading: loading, // Alias for compatibility
    signOut,
    checkAdminStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the authentication context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
