import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Megaphone, X } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';

interface AnnouncementBarProps {
  isFloating?: boolean;
  onClose?: () => void;
}

export const AnnouncementBar = ({ onClose }: AnnouncementBarProps) => {
  const navigate = useNavigate();
  const { announcements, loading } = useAnnouncements();

  if (loading || !announcements || announcements.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-royal font-bold">
          <Megaphone className="h-5 w-5" />
          <span>Latest Updates</span>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="group p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">{announcement.title}</h4>
            <p className="text-gray-600 text-xs leading-relaxed mb-3">
              {announcement.description}
            </p>
            {announcement.link && (
              <Button
                onClick={() => navigate(announcement.link)}
                size="sm"
                className="h-8 text-xs gap-1 bg-royal text-white hover:bg-royal-dark"
              >
                {announcement.type === 'course' ? 'Join Now' : 'Apply Now'}
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
