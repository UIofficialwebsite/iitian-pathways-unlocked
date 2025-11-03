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
    // 1. This outer div creates the floating overlay.
    //    - 'fixed': Makes it float over the page content (like the carousel).
    //    - 'top-24': Positions it down from the top, *not* attached to the navbar.
    //      (Adjust this 'top-24' value as needed, e.g., 'top-20' or 'top-28').
    //    - 'left-4 right-4 md:left-0 md:right-0': On mobile, it has padding from the sides.
    //      On desktop ('md:'), it spans the full width to allow the container to center itself.
    //    - 'z-40': Ensures it's above other content (like the carousel).
    //    - 'pointer-events-none': Allows clicks to pass *through* the empty parts of this container.
    <div className="fixed top-24 left-4 right-4 md:left-0 md:right-0 z-40 pointer-events-none">
      
      {/* 2. This container centers the block and controls its max-width. */}
      {/* - 'container mx-auto max-w-4xl': Standard centering and width control for desktop.
      //    - 'pointer-events-auto': Re-enables clicks *only* for the block itself.
      */}
      <div className="container mx-auto max-w-4xl pointer-events-auto">
        <Banner
          show={show}
          onHide={handleClose}
          variant={'default'} // Use default and override styles
          title={currentAnnouncement.title}
          description={
            announcements.length > 1
              ? `${currentIndex + 1} of ${announcements.length} announcements`
              : undefined
          }
          showShade={false}
          closable={true}
          // 3. Icons are set to white to be visible on the black background
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
              // 4. Button styled as requested: white bg, dark text
              className="inline-flex items-center gap-1 bg-white text-black hover:bg-gray-200"
            >
              {isCourse ? 'Join Now' : 'Apply Now'}
              <ArrowRight className="h-3 w-3" />
            </Button>
          }
          // 5. This styles the Banner as the black rectangular block.
          //    - 'p-4 md:p-6': Mobile-responsive padding (less on small screens).
          className="bg-black text-white p-4 md:p-6 rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};
