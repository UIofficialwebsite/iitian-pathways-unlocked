import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]">
        Loading...
      </div>
    );
  }

  if (!session) {
    // Redirect to /auth, but save the current location they were trying to visit (state={{ from: location }})
    // This allows the Auth page to redirect them back after successful login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthWrapper;
