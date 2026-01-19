import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLoginModal } from '@/context/LoginModalContext';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { session, isLoading } = useAuth();
  const { openLogin } = useLoginModal();

  useEffect(() => {
    // If not loading and no session, open the login modal
    if (!isLoading && !session) {
      openLogin();
    }
  }, [isLoading, session, openLogin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]">
        Loading...
      </div>
    );
  }

  // If no session, show a message but stay on the page (modal is open)
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center font-['Inter',sans-serif]">
        <p className="text-gray-500">Please sign in to continue...</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
