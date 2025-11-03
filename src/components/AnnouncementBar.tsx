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
    // 1. This outer div creates the spacing on the page
    <div className="py-8 md:py-12">
      {/* 2. This container centers the block and controls its max-width */}
      <div className="container mx-auto max-w-4xl">
        <Banner
          show={show}
          onHide={handleClose}
          // 3. Use 'default' variant, as we're overriding styles
          variant={'default'}
          title={currentAnnouncement.title}
          description={
            announcements.length > 1
              ? `${currentIndex + 1} of ${announcements.length} announcements`
              : undefined
          }
          showShade={false} // No shade needed on a black bg
          closable={true}
          // 4. Ensure icons are white to be visible on the black background
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
              //    (We remove variant="ghost")
            >
              {isCourse ? 'Join Now' : 'Apply Now'}
              <ArrowRight className="h-3 w-3" />
            </Button>
          }
          // 6. This styles the Banner as the black rectangular block
          className="bg-black text-white p-6 md:p-8 rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};
