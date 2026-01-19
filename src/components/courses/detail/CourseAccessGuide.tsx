import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const CourseAccessGuide = () => {
  return (
    <section id="access" className="my-12 scroll-mt-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-slate-900">How to Access Your Course</h2>
        
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden max-w-5xl mx-auto">
            <CardContent className="p-0">
                {/* Video Embed Area */}
                <div className="w-full bg-black aspect-video relative">
                    <iframe
                        src="https://www.youtube.com/embed/gQH0_Rp3Tuw?si=2h6AR1z0iVSFM3bS&rel=0"
                        title="Dashboard Walkthrough"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute top-0 left-0 w-full h-full"
                    ></iframe>
                </div>

                {/* Support Footer */}
                <div className="text-center py-6 bg-slate-50 border-t border-slate-100">
                    <p className="text-sm md:text-base text-slate-600">
                        Facing any issues accessing the course? Reach out to us at 
                        <a href="mailto:help.unknowniitians@gmail.com" className="font-semibold text-blue-700 hover:underline ml-1">
                            help.unknowniitians@gmail.com
                        </a>
                    </p>
                </div>
            </CardContent>
        </Card>
    </section>
  );
};

export default CourseAccessGuide;
