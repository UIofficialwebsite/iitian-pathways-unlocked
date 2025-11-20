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
  Target 
} from 'lucide-react';
import FocusAreaModal from './FocusAreaModal';
import { cn } from "@/lib/utils";

// Define profile type
interface UserProfile {
  id: string;
  program_type: string | null;
  branch?: string | null;
  level?: string | null;
  exam_type?: string | null;
  student_status?: string | null;
  [key: string]: any;
}

// Updated ActiveView to include 'coming_soon'
export type ActiveView = 'dashboard' | 'profile' | 'enrollments' | 'studyPortal' | 'library' | 'coming_soon';

interface DashboardSidebarProps {
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void; 
  onViewChange: (view: ActiveView) => void;
  activeView: ActiveView;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  profile, 
  onProfileUpdate, 
  onViewChange,
  activeView 
}) => {
  const navigate = useNavigate();
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);

  const getProfileDisplay = () => {
    if (!profile || !profile.program_type) {
      return <span className="text-gray-500">Set your focus area</span>;
    }
    if (profile.program_type === 'IITM_BS') {
      const branch = profile.branch === 'data-science' ? 'DS' : profile.branch === 'electronic-systems' ? 'ES' : 'Branch?';
      const level = profile.level || 'Level?';
      return (
        <div className="text-left">
          <p className="font-semibold text-gray-800">{branch} ({level})</p>
          <p className="text-xs text-gray-500">IITM BS Degree</p>
        </div>
      );
    }
    if (profile.program_type === 'COMPETITIVE_EXAM') {
      const exam = profile.exam_type || 'Exam?';
      const status = profile.student_status || 'Class?';
      return (
        <div className="text-left">
          <p className="font-semibold text-gray-800">{status} - {exam}</p>
          <p className="text-xs text-gray-500">Competitive Exam</p>
        </div>
      );
    }
    return <span className="text-gray-500">Set your focus area</span>;
  };

  // Helper for consistent button styling
  const SidebarButton = ({ 
    icon: Icon, 
    label, 
    viewName 
  }: { 
    icon: any, 
    label: string, 
    viewName: ActiveView 
  }) => (
    <Button 
      variant="ghost" 
      onClick={() => onViewChange(viewName)}
      className={cn(
        "w-full flex items-center justify-start gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
        activeView === viewName 
          ? "bg-teal-50 text-teal-700 border border-teal-100"
          : "text-gray-700 hover:bg-gray-100 border border-transparent"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );

  // Helper for Coming Soon buttons (originally links)
  const PlaceholderButton = ({ 
    icon: Icon, 
    label 
  }: { 
    icon: any, 
    label: string 
  }) => (
    <Button 
      variant="ghost" 
      onClick={() => onViewChange('coming_soon')}
      className={cn(
        "w-full flex items-center justify-start gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
        "text-gray-700 hover:bg-gray-100 border border-transparent"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <>
      <nav className="flex flex-col h-screen sticky top-0 bg-white border-r border-gray-200">
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-4">
            
            {/* --- FOCUS AREA BUTTON --- */}
            <div className="px-2 py-2">
              <h4 className="px-0 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">My Focus Area</h4>
              <Button
                variant="ghost"
                onClick={() => setIsFocusModalOpen(true)}
                className="w-full justify-between items-center h-auto py-3 px-3 group hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-600" />
                  {getProfileDisplay()}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:animate-bounce-horizontal" />
              </Button>
            </div>
            
            <div>
              <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Learn Digitally</h4>
              <div className="mt-2 space-y-1">
                <SidebarButton icon={BookOpen} label="Study Portal" viewName="studyPortal" />
                <SidebarButton icon={Library} label="Digital Library" viewName="library" />
              </div>
            </div>

            <div>
              <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Programs</h4>
              <div className="mt-2 space-y-1">
                <PlaceholderButton icon={GraduationCap} label="Regular Batches" />
                <PlaceholderButton icon={FastForward} label="FastTrack Batches" />
              </div>
            </div>

            <div>
              <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Explore</h4>
              <div className="mt-2 space-y-1">
                <PlaceholderButton icon={Briefcase} label="Work @UI" />
                <PlaceholderButton icon={Users} label="Career Consult" />
                <PlaceholderButton icon={BookOpen} label="Upskilling" />
              </div>
            </div>

            <div>
              <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">More</h4>
              <div className="mt-2 space-y-1">
                <PlaceholderButton icon={Phone} label="Contact Us" />
                <PlaceholderButton icon={Info} label="About Us" />
                <PlaceholderButton icon={Shield} label="Privacy Policy" />
              </div>
            </div>

          </div>
        </div>

        {/* --- BOTTOM BUTTONS --- */}
        <div className="mt-auto p-4 border-t border-gray-200 space-y-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
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
