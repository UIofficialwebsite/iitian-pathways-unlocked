import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Library, 
  Briefcase, 
  Users, 
  Phone, 
  Info, 
  Shield, 
  GraduationCap, 
  FastForward,
  Home,
  ChevronRight,
  Target,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from 'lucide-react';
import FocusAreaModal from './FocusAreaModal';
import { cn } from "@/lib/utils";

// Comprehensive view types used across the dashboard
export type ActiveView = 
  | 'dashboard' 
  | 'profile' 
  | 'enrollments' 
  | 'studyPortal' 
  | 'library' 
  | 'regularBatches' 
  | 'coming_soon';

interface UserProfile {
  id: string;
  program_type: string | null;
  branch?: string | null;
  level?: string | null;
  exam_type?: string | null;
  student_status?: string | null;
  [key: string]: any;
}

interface DashboardSidebarProps {
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void; 
  onViewChange: (view: ActiveView) => void;
  activeView: ActiveView;
  isCollapsed?: boolean; // Prop to handle the "minimize" feature
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  profile, 
  onProfileUpdate, 
  onViewChange,
  activeView,
  isCollapsed = false 
}) => {
  const navigate = useNavigate();
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);

  /**
   * Intelligence: Displays student focus details (e.g., IITM Branch or Exam Class)
   * Hides completely when sidebar is collapsed to maximize UI space.
   */
  const getProfileDisplay = () => {
    if (isCollapsed) return null;
    
    if (!profile || !profile.program_type) {
      return <span className="text-gray-500 text-xs font-bold">Set Focus Area</span>;
    }
    
    if (profile.program_type === 'IITM_BS') {
      const branch = profile.branch === 'data-science' ? 'DS' : profile.branch === 'electronic-systems' ? 'ES' : '??';
      return (
        <div className="text-left overflow-hidden">
          <p className="font-bold text-gray-800 text-[13px] leading-tight truncate">{branch} ({profile.level || '?'})</p>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">IITM BS Degree</p>
        </div>
      );
    }
    
    if (profile.program_type === 'COMPETITIVE_EXAM') {
      return (
        <div className="text-left overflow-hidden">
          <p className="font-bold text-gray-800 text-[13px] leading-tight truncate">{profile.student_status || 'Class'} - {profile.exam_type || 'Exam'}</p>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Competitive Exam</p>
        </div>
      );
    }
    
    return <span className="text-gray-500 text-xs font-bold">Set Focus Area</span>;
  };

  /**
   * Helper component for Sidebar Items.
   * Includes Tooltip logic that only activates when the sidebar is minimized.
   */
  const SidebarItem = ({ icon: Icon, label, viewName }: { icon: any, label: string, viewName: ActiveView }) => {
    const isActive = activeView === viewName;
    
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              onClick={() => onViewChange(viewName)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 transition-all rounded-xl border border-transparent",
                isCollapsed ? "justify-center" : "justify-start",
                isActive 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-white" : "text-gray-400")} />
              {!isCollapsed && <span className="text-[14px] font-bold tracking-tight">{label}</span>}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="bg-gray-900 text-white border-none font-bold text-xs py-2 px-3 shadow-xl">
              {label}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      <nav className={cn(
        "flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out sticky top-0",
        isCollapsed ? "w-20" : "w-72"
      )}>
        <div className="flex-1 overflow-y-auto py-6 no-scrollbar">
          <div className={cn("px-4 space-y-8", isCollapsed && "px-2")}>
            
            {/* Target Area (Focus) */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h4 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Focus Area</h4>
              )}
              <Button
                variant="ghost"
                onClick={() => setIsFocusModalOpen(true)}
                className={cn(
                  "w-full flex items-center h-auto py-3 px-3 border border-gray-100 rounded-xl hover:border-gray-300 transition-colors bg-gray-50/50 group",
                  isCollapsed ? "justify-center" : "justify-between"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Target className="h-5 w-5 text-blue-600 shrink-0" />
                  {getProfileDisplay()}
                </div>
                {!isCollapsed && <ChevronRight className="h-4 w-4 text-gray-300 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </div>
            
            {/* Learn Digitally Category */}
            <div className="space-y-1">
              {!isCollapsed && (
                <h4 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Learn Digitally</h4>
              )}
              <SidebarItem icon={BookOpen} label="Study Portal" viewName="studyPortal" />
              <SidebarItem icon={Library} label="Digital Library" viewName="library" />
            </div>

            {/* Academic Programs Category */}
            <div className="space-y-1">
              {!isCollapsed && (
                <h4 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Academic Hub</h4>
              )}
              <SidebarItem icon={GraduationCap} label="Regular Batches" viewName="regularBatches" />
              <SidebarItem icon={FastForward} label="FastTrack Batches" viewName="coming_soon" />
            </div>

            {/* Explore Category */}
            <div className="space-y-1">
              {!isCollapsed && (
                <h4 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Explore</h4>
              )}
              <SidebarItem icon={Briefcase} label="Work @UI" viewName="coming_soon" />
              <SidebarItem icon={Users} label="Career Consult" viewName="coming_soon" />
              <SidebarItem icon={BookOpen} label="Upskilling" viewName="coming_soon" />
            </div>

            {/* More Category */}
            <div className="space-y-1">
              {!isCollapsed && (
                <h4 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">More</h4>
              )}
              <SidebarItem icon={Phone} label="Contact Us" viewName="coming_soon" />
              <SidebarItem icon={Info} label="About UI" viewName="coming_soon" />
              <SidebarItem icon={Shield} label="Privacy Policy" viewName="coming_soon" />
            </div>

          </div>
        </div>

        {/* Exit Logic */}
        <div className="p-4 border-t border-gray-100">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className={cn(
              "w-full text-gray-600 font-bold text-sm rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors",
              isCollapsed ? "justify-center" : "justify-start px-3"
            )}
          >
            <Home className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">Exit Dashboard</span>}
          </Button>
        </div>
      </nav>

      <FocusAreaModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        profile={profile}
        onProfileUpdate={onProfileUpdate}
      />
    </>
  );
};

export default DashboardSidebar;
