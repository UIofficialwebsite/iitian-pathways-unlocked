import React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginCard from "@/components/auth/LoginCard";
import NavBar from "@/components/NavBar";

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // REPLACED REDIRECT WITH POPUP RENDER
  if (!user) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4 pt-24 font-['Inter',sans-serif]">
            <LoginCard />
        </div>
      </>
    );
  }

  return <>{children}</>;
};
