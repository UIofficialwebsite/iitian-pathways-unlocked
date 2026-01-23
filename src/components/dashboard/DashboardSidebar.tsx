import React from 'react';
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
  Home
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  program_type: string | null;
  branch?: string | null;
  level?: string | null;
  exam_type?: string | null;
  student_status?: string | null;
  [key: string]: any;
}

export type ActiveView = 'dashboard' | 'profile' | 'enrollments' | 'studyPortal' | 'library' | 'regularBatches' | 'fastTrackBatches' | 'coming_soon' | 'contact';

interface DashboardSidebarProps {
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void; 
  onViewChange: (view: ActiveView) => void;
  activeView: ActiveView;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  onViewChange,
  activeView 
}) => {
  const navigate = useNavigate();

  const SidebarButton = ({ icon: Icon, label, viewName }: { icon: any, label: string, viewName: ActiveView }) => (
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

  const PlaceholderButton = ({ icon: Icon, label }: { icon: any, label: string }) => (
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
    <nav className="flex flex-col h-screen sticky top-0 bg-white border-r border-gray-200">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-4">
          
          {/* Focus Area Removed from Sidebar */}
          
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
              <SidebarButton icon={GraduationCap} label="Regular Batches" viewName="regularBatches" />
              <SidebarButton icon={FastForward} label="FastTrack Batches" viewName="fastTrackBatches" />
            </div>
          </div>

          <div>
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Explore</h4>
            <div className="mt-2 space-y-1">
              <Button 
                variant="ghost" 
                onClick={() => window.open('/career', '_blank')}
                className="w-full flex items-center justify-start gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 border border-transparent"
              >
                <Briefcase className="h-4 w-4" />
                Work @UI
              </Button>
              <PlaceholderButton icon={Users} label="Career Consult" />
              <PlaceholderButton icon={BookOpen} label="Upskilling" />
            </div>
          </div>

          <div>
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">More</h4>
            <div className="mt-2 space-y-1">
              <SidebarButton icon={Phone} label="Contact Us" viewName="contact" />
              
              <Button 
                variant="ghost" 
                onClick={() => window.open('/about', '_blank')}
                className="w-full flex items-center justify-start gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 border border-transparent"
              >
                <Info className="h-4 w-4" />
                About Us
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="w-full flex items-center justify-start gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 border border-transparent"
              >
                <Shield className="h-4 w-4" />
                Privacy Policy
              </Button>
            </div>
          </div>

        </div>
      </div>

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
  );
};

export default DashboardSidebar;
