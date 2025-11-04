// src/components/dashboard/DashboardTopNav.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, User, LogOut, LayoutGrid } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

// Copied from ModernDashboard.tsx
interface UserProfile {
  program_type: string;
  branch?: string;
  level?: string;
  exam_type?: string;
  student_status?: string;
  subjects?: string[];
  student_name?: string;
}

interface DashboardTopNavProps {
  profile: UserProfile | null;
  onViewChange: (view: 'dashboard' | 'profile' | 'enrollments') => void;
}

const DashboardTopNav = ({ profile, onViewChange }: DashboardTopNavProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const userName = profile?.student_name || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="sticky top-0 z-40 w-full h-16 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex-shrink-0">
            <img
              className="h-8 w-auto"
              src="/lovable-uploads/logo_ui_new.png"
              alt="UI Logo"
            />
          </Link>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            Hi, {userName}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1 h-auto">
                <Avatar className="h-8 w-8">
                  {/* You can add user.avatar_url here if you have one */}
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                  <AvatarFallback>{userInitial}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{userEmail}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onViewChange('profile')} className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange('enrollments')} className="cursor-pointer">
                <LayoutGrid className="h-4 w-4 mr-2" />
                My Enrollments
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopNav;
