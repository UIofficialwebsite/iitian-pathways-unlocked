import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActiveView } from './DashboardSidebar';

interface DashboardHeaderProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  className?: string;
}

// Map view keys to display-friendly names
const viewNames: Record<ActiveView, string> = {
  dashboard: 'Study Portal',
  studyPortal: 'Study Portal',
  profile: 'My Profile',
  enrollments: 'My Enrollments',
  library: 'Digital Library',
  regularBatches: 'Regular Batches',
  coming_soon: 'Coming Soon',
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  activeView, 
  onViewChange,
  className 
}) => {
  const isDefaultView = activeView === 'dashboard' || activeView === 'studyPortal';

  return (
    <header 
      className={cn(
        "fixed top-16 left-0 z-20 flex h-16 w-full items-center gap-4 border-b border-gray-200 bg-gray-50/95 px-4 backdrop-blur-sm sm:px-6 lg:left-72 lg:w-[calc(100%-18rem)]",
        className
      )}
    >
      <div className="flex h-full items-center gap-2">
        {!isDefaultView && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onViewChange('studyPortal')}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-xl font-bold text-gray-900 tracking-tight sm:text-2xl">
          {viewNames[activeView] || 'Dashboard'}
        </h1>
      </div>
    </header>
  );
};

export default DashboardHeader;
