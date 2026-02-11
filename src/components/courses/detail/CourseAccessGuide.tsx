import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const CourseAccessGuide = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  // --- Dynamic Mailto Logic ---
  const supportEmail = "support@unknowniitians.live";
  const ccEmail = "help.unknowniitians@gmail.com";
  
  // Get User Details (with fallbacks)
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Student";
  const userEmail = user?.email || "";
  
  const subject = `Course Access Issue - Batch ID: ${courseId}`;
  const body = `Hi Support Team,

I am facing issues accessing the course content.

-- Student Details --
Name: ${userName}
Email: ${userEmail}
Course ID: ${courseId}

-- Issue Description --
(Please describe your issue here)
`;

  // Construct the mailto link with encoded parameters
  const mailtoLink = `mailto:${supportEmail}?cc=${ccEmail}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <section id="access" className="my-12 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-slate-900">How to Access Your Course</h2>
        
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden max-w-5xl mx-auto">
            <CardContent className="p-0">
                {/* Video Embed Area */}
                <div className="w-full bg-black aspect-video relative">
                    <iframe
                        src="https://www.youtube.com/embed/nePZER6PTjQ?rel=0&modestbranding=1"
                        title="Dashboard Walkthrough"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full"
                    ></iframe>
                </div>

                {/* Support Footer */}
                <div className="text-center py-6 bg-slate-50 border-t border-slate-100 px-4">
                    <p className="text-sm md:text-base text-slate-600">
                        Facing any issues accessing the course? Reach out to us at 
                        <a 
                          href={mailtoLink}
                          className="font-semibold text-blue-700 hover:underline ml-1 break-all"
                        >
                            {supportEmail}
                        </a>
                    </p>
                </div>
            </CardContent>
        </Card>
    </section>
  );
};

export default CourseAccessGuide;
