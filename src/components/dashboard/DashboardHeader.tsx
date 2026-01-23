import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveView } from './DashboardSidebar'; // Use central type definition

interface DashboardHeaderProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  className?: string;
  isSidebarCollapsed?: boolean; // Intelligence: Adjust position based on sidebar state
}

/**
 * Mapping view keys to user-friendly titles
 * Updated to include all new sections like Library and Regular Batches
 */
const viewNames: Record<ActiveView, string> = {
  dashboard: 'Study Portal',
  studyPortal: 'Study Portal',
  profile: 'My Profile',
  enrollments: 'My Enrollments',
  library: 'Digital Library',
  regularBatches: 'Regular Batches',
  fastTrackBatches: 'FastTrack Batches',
  coming_soon: 'Coming Soon',
  contact: 'Contact Us',
  receipt: 'Enrollment Receipt',
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  activeView, 
  onViewChange,
  className,
  isSidebarCollapsed = false
}) => {
  const isDefaultView = activeView === 'dashboard' || activeView === 'studyPortal';

  return (
    <header 
      className={cn(
        /* Intelligence: 
           - Starts at top-16 (below Global TopNav)
           - Dynamic lg:left based on sidebar collapse state (72 = 288px, 20 = 80px)
           - Dynamic width calculation to prevent content overlap
        */
        "fixed top-16 left-0 z-20 flex h-16 w-full items-center gap-4 border-b border-gray-200 bg-gray-50/95 px-4 backdrop-blur-sm transition-all duration-300 sm:px-6",
        isSidebarCollapsed 
          ? "lg:left-20 lg:w-[calc(100%-5rem)]" 
          : "lg:left-72 lg:w-[calc(100%-18rem)]",
        className
      )}
    >
      <div className="flex h-full items-center gap-2">
        {!isDefaultView && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onViewChange('studyPortal')} // Navigate back to central hub
            className="h-9 w-9 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
        )}
        <h1 className="text-xl font-bold text-gray-900 tracking-tight sm:text-2xl">
          {viewNames[activeView] || 'Study Portal'}
        </h1>
      </div>
    </header>
  );
};

export default DashboardHeader;
