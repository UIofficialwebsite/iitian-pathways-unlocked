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
    // 1. Floating wrapper: 
    //    - 'fixed top-24' floats it over the carousel.
    //    - 'left-0 right-0' makes it full-width on mobile.
    //    - 'pointer-events-none' lets clicks pass through empty space.
    <div className="fixed top-24 left-0 right-0 z-40 pointer-events-none">
      
      {/* 2. Centering & Width container: 
           - 'container' adds responsive padding on mobile.
           - 'max-w-4xl' constrains width on desktop.
           - 'pointer-events-auto' makes only the block clickable.
      */}
      <div className="container mx-auto max-w-4xl pointer-events-auto">
        
        <Banner
          show={show}
          onHide={handleClose}
          // 3. Use 'default' variant, which we will override
          variant={'default'}
          title={currentAnnouncement.title}
          description={
            announcements.length > 1
              ? `${currentIndex + 1} of ${announcements.length} announcements`
              : undefined
          }
          showShade={false} // No shade needed on a black bg
          closable={true}
          // 4. Icons MUST be 'text-white' to be visible
          icon={
            isCourse ? (
              <Sparkles className="h-5 w-5 text-white" />
            ) : (
              <Briefcase className="h-5 w-5 text-white" />
            )
          }
          action={
            <Button
              onClick={handleAction}
              size="sm"
              // 5. Button styled as requested: white bg, dark text
              className="inline-flex items-center gap-1 bg-white text-black hover:bg-gray-200"
              //    (Note: 'variant="ghost"' is removed)
            >
              {isCourse ? 'Join Now' : 'Apply Now'}
              <ArrowRight className="h-3 w-3" />
            </Button>
          }
          // 6. Style override for the dark theme:
          //    - 'bg-black text-white': The dark block with white text.
          //    - 'p-4 md:p-6': Mobile-responsive padding.
          //    - 'rounded-lg': Creates the rectangular block.
          className="bg-black text-white p-4 md:p-6 rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};
