import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  [key: string]: any; // Allow other properties
}

// Export this type so ModernDashboard can use it
export type ActiveView = 'dashboard' | 'profile' | 'enrollments' | 'studyPortal';

interface DashboardSidebarProps {
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void; 
  onViewChange: (view: ActiveView) => void;
  activeView: ActiveView; // This prop causes the "red line" if missing in the parent
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  profile, 
  onProfileUpdate, 
  onViewChange,
  activeView 
}) => {
  const navigate = useNavigate();
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);

  // Generates the dynamic display text for the focus area
  const getProfileDisplay = () => {
    if (!profile || !profile.program_type) {
      return (
        <span className="text-gray-500">Set your focus area</span>
      );
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
                {/* Study Portal Button with Conditional Highlighting */}
                <Button 
                  variant="ghost" 
                  onClick={() => onViewChange('studyPortal')}
                  className={cn(
                    "w-full flex items-center justify-start gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    activeView === 'studyPortal' 
                      ? "bg-teal-50 text-teal-700 border border-teal-100" // Highlight styles
                      : "text-gray-700 hover:bg-gray-100 border border-transparent"
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  Study Portal
                </Button>
                
                <Link to="/courses" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 border border-transparent">
                  <Library className="h-4 w-4" />
                  Digital Library
                </Link>
              </div>
            </div>

            <div>
              <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Programs</h4>
              <div className="mt-2 space-y-1">
                <Link to="/courses?batch=regular" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 border border-transparent">
                  <GraduationCap className="h-4 w-4" />
                  Regular Batches
                </Link>
                <Link to="/courses?batch=fasttrack" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 border border-transparent">
                  <FastForward className="h-4 w-4" />
                  FastTrack Batches
                </Link>
              </div>
            </div>

            <div>
              <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Explore</h4>
              <div className="mt-2 space-y-1">
                <Link to="/career" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 border border-transparent">
                  <Briefcase className="h-4 w-4" />
                  Work @UI
                </Link>
                <Link to="/career#consult" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 border border-transparent">
                  <Users className="h-4 w-4" />
                  Career Consult
                </Link>
                <Link to="/courses?category=upskilling" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 border border-transparent">
                  <BookOpen className="h-4 w-4" />
                  Upskilling
                </Link>
              </div>
            </div>

            <div>
              <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">More</h4>
              <div className="mt-2 space-y-1">
                <Link to="/contact" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 border border-transparent">
                  <Phone className="h-4 w-4" />
                  Contact Us
                </Link>
                <Link to="/about" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 border border-transparent">
                  <Info className="h-4 w-4" />
                  About Us
                </Link>
                <Link to="/privacy-policy" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 border border-transparent">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </Link>
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

      {/* --- FOCUS AREA MODAL --- */}
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
