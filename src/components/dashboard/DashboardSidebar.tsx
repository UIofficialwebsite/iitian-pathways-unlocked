import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Library, 
  Phone, 
  ShieldCheck, 
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

// FIX: Added 'receipt' to the type definition below
export type ActiveView = 'dashboard' | 'profile' | 'enrollments' | 'studyPortal' | 'library' | 'regularBatches' | 'fastTrackBatches' | 'coming_soon' | 'contact' | 'receipt';

interface DashboardSidebarProps {
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void; 
  onViewChange: (view: ActiveView) => void;
  activeView: ActiveView;
}

// ... (Rest of the file remains EXACTLY the same, just the type definition changed)

const StudyPortalIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const RegularBatchIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    className={className}
  >
    <rect x="3" y="4" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16v4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 20h8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FastTrackIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7L9 12h3l-1 5 4-5h-3l1-5z" />
  </svg>
);

const WorkIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    <path d="M12 8.5h-1V8c0-.28-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5v.5H7c-.28 0-.5.22-.5.5v2.5c0 .28.22.5.5.5h1.5v-.5h2v.5H12c.28 0 .5-.22.5-.5V9c0-.28-.22-.5-.5-.5zm-3-.5h1v.5H9V8z"/>
  </svg>
);

const InfoIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8h.01M12 12v4" />
  </svg>
);

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  onViewChange,
  activeView 
}) => {
  const navigate = useNavigate();

  const SidebarButton = ({ 
    icon: Icon, 
    label, 
    viewName, 
    iconType = 'component',
    iconClassName = "h-4 w-4"
  }: { 
    icon: any, 
    label: string, 
    viewName: ActiveView, 
    iconType?: 'component' | 'image',
    iconClassName?: string
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
      {iconType === 'component' ? (
        <Icon className={iconClassName} />
      ) : (
        <img src={Icon} alt={label} className={cn("object-contain", iconClassName)} />
      )}
      {label}
    </Button>
  );

  const PlaceholderButton = ({ 
    icon: Icon, 
    label, 
    iconType = 'component',
    iconClassName = "h-4 w-4"
  }: { 
    icon: any, 
    label: string, 
    iconType?: 'component' | 'image',
    iconClassName?: string
  }) => (
    <Button 
      variant="ghost" 
      onClick={() => onViewChange('coming_soon')}
      className={cn(
        "w-full flex items-center justify-start gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors",
        "text-gray-700 hover:bg-gray-100 border border-transparent"
      )}
    >
      {iconType === 'component' ? (
        <Icon className={iconClassName} />
      ) : (
        <img src={Icon} alt={label} className={cn("object-contain", iconClassName)} />
      )}
      {label}
    </Button>
  );

  return (
    <nav className="flex flex-col h-screen sticky top-0 bg-white border-r border-gray-200">
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-4">
          
          <div>
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Learn Digitally</h4>
            <div className="mt-2 space-y-1">
              <SidebarButton icon={StudyPortalIcon} label="Study Portal" viewName="studyPortal" />
              <SidebarButton icon={Library} label="Digital Library" viewName="library" />
            </div>
          </div>

          <div>
            <h4 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic Programs</h4>
            <div className="mt-2 space-y-1">
              <SidebarButton icon={RegularBatchIcon} label="Regular Batches" viewName="regularBatches" />
              <SidebarButton icon={FastTrackIcon} label="FastTrack Batches" viewName="fastTrackBatches" />
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
                <WorkIcon className="h-6 w-6" /> 
                Work @UI
              </Button>
              
              <PlaceholderButton 
                icon="https://res.cloudinary.com/dkywjijpv/image/upload/v1769179994/consultation_jtgrze.png" 
                label="Career Consult" 
                iconType="image"
                iconClassName="h-7 w-7" 
              />
              
              <PlaceholderButton 
                icon="https://res.cloudinary.com/dkywjijpv/image/upload/v1769179438/creative-idea-flat-line-icon-600nw-2470397429_ux6kot.png" 
                label="Upskilling" 
                iconType="image"
                iconClassName="h-7 w-7" 
              />
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
                <InfoIcon className="h-4 w-4" />
                About Us
              </Button>

              <Button 
                variant="ghost" 
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="w-full flex items-center justify-start gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-100 border border-transparent"
              >
                <ShieldCheck className="h-4 w-4" />
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
