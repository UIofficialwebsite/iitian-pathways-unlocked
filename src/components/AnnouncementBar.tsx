import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Briefcase } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { cn } from '@/lib/utils';

export const AnnouncementBar = () => {
  const navigate = useNavigate();
  const { announcements, loading } = useAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [show, setShow] = useState(true);

  // Rotate announcements every 8 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  // Keep announcement bar always visible (removed scroll behavior)

  if (loading || announcements.length === 0 || !show) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];
  const isCourse = currentAnnouncement.type === 'course';

  const handleAction = () => {
    navigate(currentAnnouncement.link);
  };

  const handleClose = () => {
    setShow(false);
    // Remove announcement bar completely when X is clicked
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-40 transition-all duration-300">
      <Banner
        show={show}
        onHide={handleClose}
        variant={isCourse ? 'premium' : 'info'}
        title={currentAnnouncement.title}
        description={
          announcements.length > 1
            ? `${currentIndex + 1} of ${announcements.length} announcements`
            : undefined
        }
        showShade={true}
        closable={true}
        icon={isCourse ? <Sparkles className="h-5 w-5" /> : <Briefcase className="h-5 w-5" />}
        action={
          <Button
            onClick={handleAction}
            size="sm"
            className="inline-flex items-center gap-1"
            variant="ghost"
          >
            {isCourse ? 'Join Now' : 'Apply Now'}
            <ArrowRight className="h-3 w-3" />
          </Button>
        }
        className="h-[60px] rounded-none border-x-0 border-t-0"
      />
    </div>
  );
};
