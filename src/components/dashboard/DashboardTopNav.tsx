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
import DashboardSidebar, { ActiveView } from "./DashboardSidebar";

// Define profile type locally or import if available globally
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
  activeView: ActiveView; // Added to support highlighting in mobile sidebar
  onProfileUpdate: (updatedProfile: any) => void;
}

const DashboardTopNav = ({ profile, onViewChange, activeView, onProfileUpdate }: DashboardTopNavProps) => {
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
    <div className="sticky top-0 z-40 w-full h-16 bg-white border-b border-gray-200 font-['Inter',sans-serif]">
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
                <DashboardSidebar 
                  profile={profile as any} 
                  onProfileUpdate={onProfileUpdate} 
                  onViewChange={onViewChange}
                  activeView={activeView} 
                />
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
          
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full p-1 h-auto hover:bg-gray-100 transition-colors outline-none focus:outline-none group">
                <Avatar className="h-8 w-8 border border-gray-200 group-hover:ring-2 group-hover:ring-[#1d4ed8] transition-all">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                  <AvatarFallback className="font-bold bg-[#1d4ed8] text-white">{userInitial}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-[#1d4ed8] transition-colors" />
              </button>
            </DropdownMenuTrigger>
            
            {/* Same Styles as NavBar.tsx */}
            <DropdownMenuContent 
              align="end" 
              className="w-[250px] p-[10px_0] rounded-[12px] bg-white border-none shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-[10005] mt-2 font-['Inter',sans-serif]"
            >
              <DropdownMenuLabel className="font-normal px-5 pb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-[#344054] truncate">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="bg-[#f2f4f7] my-2 mx-0" />
              
              <DropdownMenuItem 
                onClick={() => onViewChange('profile')} 
                className="flex items-center px-5 py-3.5 cursor-pointer text-[#344054] hover:!bg-[#f9fafb] hover:!text-[#344054] focus:bg-[#f9fafb] focus:text-[#344054] transition-colors duration-200"
              >
                <User className="mr-4 h-[22px] w-[22px] stroke-[1.8]" />
                <span className="text-[16px] font-medium tracking-tight">My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => onViewChange('enrollments')} 
                className="flex items-center px-5 py-3.5 cursor-pointer text-[#344054] hover:!bg-[#f9fafb] hover:!text-[#344054] focus:bg-[#f9fafb] focus:text-[#344054] transition-colors duration-200"
              >
                <LayoutGrid className="mr-4 h-[22px] w-[22px] stroke-[1.8]" />
                <span className="text-[16px] font-medium tracking-tight">My Enrollments</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-[#f2f4f7] my-2 mx-0" />
              
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="flex items-center px-5 py-3.5 cursor-pointer text-[#dc2626] hover:!bg-[#f9fafb] hover:!text-[#dc2626] focus:bg-[#f9fafb] focus:text-[#dc2626] transition-colors duration-200"
              >
                <LogOut className="mr-4 h-[22px] w-[22px] stroke-[1.8]" />
                <span className="text-[16px] font-medium tracking-tight">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardTopNav;
