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
  const [isVisible, setIsVisible] = useState(true);

  // Rotate announcements every 8 seconds
  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading || announcements.length === 0 || !show || !isVisible) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];
  const isCourse = currentAnnouncement.type === 'course';

  const handleAction = () => {
    navigate(currentAnnouncement.link);
  };

  const handleClose = () => {
    setShow(false);
    // If there are more announcements, show the next one after a delay
    if (announcements.length > 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
        setShow(true);
      }, 500);
    }
  };

  return (
    <div
      className={cn(
        'fixed top-16 left-0 right-0 z-40 transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}
    >
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
