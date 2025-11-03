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
  };

  return (
    // 1. Floating wrapper: Positions the block over the page.
    //    - Mobile-responsive side padding (left-4 right-4)
    //    - Desktop centering (md:left-0 md:right-0)
    //    - 'top-24' positions it down from the top.
    <div className="fixed top-24 left-4 right-4 md:left-0 md:right-0 z-40 pointer-events-none">
      
      {/* 2. Centering & Width container: 
           - 'max-w-4xl' limits width on desktop.
           - 'pointer-events-auto' makes only the block clickable.
      */}
      <div className="container mx-auto max-w-4xl pointer-events-auto">
        
        <Banner
          show={show}
          onHide={handleClose}
          // 3. Changing Colors: Uses the Banner's built-in variants.
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
              // 4. Button style: 'ghost' adapts to the banner's color.
              variant="ghost"
            >
              {isCourse ? 'Join Now' : 'Apply Now'}
              <ArrowRight className="h-3 w-3" />
            </Button>
          }
          // 5. Block Style: Adds padding and rounded corners.
          //    The default shadow from 'banner.tsx' will apply.
          className="p-4 md:p-6 rounded-lg"
        />
      </div>
    </div>
  );
};
