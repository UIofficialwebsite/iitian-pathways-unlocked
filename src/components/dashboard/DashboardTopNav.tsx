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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown, User, LogOut, LayoutGrid, Menu } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import DashboardSidebar from "./DashboardSidebar";

// Define profile type
interface UserProfile {
  program_type: string | null;
  branch?: string | null;
  level?: string | null;
  exam_type?: string | null;
  student_status?: string | null;
  subjects?: string[] | null;
  student_name?: string | null;
  full_name?: string | null;
  email?: string | null;
}

interface DashboardTopNavProps {
  profile: UserProfile | null;
  onViewChange: (view: 'dashboard' | 'profile' | 'enrollments') => void;
  onProfileUpdate: (updatedProfile: UserProfile) => void; // Added for modal
}

const DashboardTopNav = ({ profile, onViewChange, onProfileUpdate }: DashboardTopNavProps) => {
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
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-2">
          {/* Mobile Hamburger Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white h-full">
                {/* Pass onProfileUpdate to mobile sidebar */}
                <DashboardSidebar profile={profile} onProfileUpdate={onProfileUpdate} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img
              className="h-8 w-auto"
              src="/lovable-uploads/logo_ui_new.png"
              alt="UI Logo"
            />
            <span className="font-sans text-lg font-semibold text-black hidden sm:block">
              Unknown IITians
            </span>
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
