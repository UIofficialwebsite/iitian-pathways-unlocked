// src/components/dashboard/DashboardSidebar.tsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Home
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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

interface DashboardSidebarProps {
  profile: UserProfile | null;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ profile }) => {
  const navigate = useNavigate();

  const getExamPrepButton = () => {
    if (!profile) {
      return null;
    }

    let text = "My Exam Prep";
    let link = "/exam-preparation";

    if (profile.program_type === 'IITM_BS') {
      text = "IITM BS Prep";
      link = "/exam-preparation/iitm-bs";
    } else if (profile.program_type === 'COMPETITIVE_EXAM' && profile.exam_type) {
      text = `${profile.exam_type} Prep`;
      link = `/exam-preparation/${profile.exam_type.toLowerCase()}`;
    }

    return (
      <Button 
        onClick={() => navigate(link)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
      >
        <GraduationCap className="h-4 w-4 mr-2" />
        {text}
      </Button>
    );
  };

  return (
    <nav className="flex flex-col h-full">
      {/* --- LOGO REMOVED FROM HERE --- */}
      
      <div className="flex-1 overflow-y-auto py-4 pt-16"> {/* Added pt-16 to clear top nav */}
        <div className="px-4 space-y-4">
          
          <div>
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Learn Digitally</h4>
            <div className="mt-2 space-y-1">
              <Link to="/exam-preparation" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <BookOpen className="h-4 w-4" />
                Study Portal
              </Link>
              <Link to="/courses" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <Library className="h-4 w-4" />
                Digital Library
              </Link>
            </div>
          </div>

          <div>
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Programs</h4>
            <div className="mt-2 space-y-1">
              <Link to="/courses?batch=regular" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <GraduationCap className="h-4 w-4" />
                Regular Batches
              </Link>
              <Link to="/courses?batch=fasttrack" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <FastForward className="h-4 w-4" />
                FastTrack Batches
              </Link>
            </div>
          </div>

          <div>
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Explore</h4>
            <div className="mt-2 space-y-1">
              <Link to="/career" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <Briefcase className="h-4 w-4" />
                Work @UI
              </Link>
              <Link to="/career#consult" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <Users className="h-4 w-4" />
                Career Consult
              </Link>
              <Link to="/courses?category=upskilling" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <BookOpen className="h-4 w-4" />
                Upskilling
              </Link>
            </div>
          </div>

          <div>
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">More</h4>
            <div className="mt-2 space-y-1">
              <Link to="/contact" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <Phone className="h-4 w-4" />
                Contact Us
              </Link>
              <Link to="/about" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <Info className="h-4 w-4" />
                About Us
              </Link>
              <Link to="/privacy-policy" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
                <Shield className="h-4 w-4" />
                Privacy Policy
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* --- BOTTOM BUTTONS --- */}
      <div className="mt-auto p-4 border-t border-gray-200 space-y-2">
        {/* Added Home Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100"
        >
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
        
        {/* Dynamic Exam Prep Button */}
        {getExamPrepButton()}
      </div>
    </nav>
  );
};

export default DashboardSidebar;
