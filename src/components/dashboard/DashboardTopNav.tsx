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
} from "@/components/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, User, LogOut, LayoutGrid, PanelLeftClose, PanelLeft } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { ActiveView } from "./DashboardSidebar";

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
  onViewChange: (view: ActiveView) => void;
  activeView: ActiveView;
  onProfileUpdate: (updatedProfile: any) => void;
  isSidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
}

const DashboardTopNav = ({ 
  profile, 
  onViewChange, 
  activeView, 
  onProfileUpdate,
  isSidebarCollapsed,
  setSidebarCollapsed 
}: DashboardTopNavProps) => {
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
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        
        {/* Left Section: Logo & Layout Controls */}
        <div className="flex items-center gap-4">
          {/* Intelligence: Removed the 'three horizontal lines' (Menu icon) and mobile Sheet trigger. 
              Kept only the Sidebar toggle for desktop/tablet space management. */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed?.(!isSidebarCollapsed)}
            className="hidden lg:flex h-9 w-9 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              src="/lovable-uploads/logo_ui_new.png"
              alt="UI Logo"
            />
            <span className="font-sans text-lg font-bold text-gray-900 hidden sm:block tracking-tight">
              Unknown IITians
            </span>
          </Link>
        </div>

        {/* Right Section: User Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2 text-right">
            <span className="text-sm font-bold text-gray-900 leading-none">
              {userName}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Student Dashboard
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl p-1 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 outline-none">
                <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                  <AvatarFallback className="bg-blue-600 text-white font-bold">{userInitial}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-xl p-1.5 shadow-xl border-gray-200 bg-white">
              <DropdownMenuLabel className="px-3 py-2">
                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate font-medium">{userEmail}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1 bg-gray-100" />
              <DropdownMenuItem onClick={() => onViewChange('profile')} className="rounded-lg cursor-pointer py-2 font-medium">
                <User className="h-4 w-4 mr-3 text-gray-500" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewChange('enrollments')} className="rounded-lg cursor-pointer py-2 font-medium">
                <LayoutGrid className="h-4 w-4 mr-3 text-gray-500" />
                My Enrollments
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-gray-100" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg cursor-pointer py-2 font-bold hover:bg-red-50">
                <LogOut className="h-4 w-4 mr-3" />
                Logout Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopNav;
