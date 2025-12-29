import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, HelpCircle } from 'lucide-react';

const CourseAccessGuide = () => {
  return (
    <section className="scroll-mt-24">
      <Card className="border border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-5 md:p-6 lg:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6">How to Access Your Course</h2>
          
          {/* Flowchart */}
          <ol className="relative border-l-2 border-border space-y-8 ml-3 pl-6">
            {/* Step 1 */}
            <li className="flex items-start">
              <span className="absolute -left-4 flex items-center justify-center bg-primary rounded-full h-8 w-8 text-primary-foreground font-bold text-sm">
                1
              </span>
              <div>
                <h3 className="font-semibold text-base md:text-lg">Go to Your Profile Dashboard</h3>
                <p className="text-muted-foreground text-sm mt-1">After enrolling, navigate to your personal dashboard.</p>
              </div>
            </li>
            {/* Step 2 */}
            <li className="flex items-start">
              <span className="absolute -left-4 flex items-center justify-center bg-primary rounded-full h-8 w-8 text-primary-foreground font-bold text-sm">
                2
              </span>
              <div>
                <h3 className="font-semibold text-base md:text-lg">Click on the SSP Portal Block</h3>
                <p className="text-muted-foreground text-sm mt-1">Find and click the SSP Portal to proceed.</p>
              </div>
            </li>
            {/* Step 3 */}
            <li className="flex items-start">
              <span className="absolute -left-4 flex items-center justify-center bg-primary rounded-full h-8 w-8 text-primary-foreground font-bold text-sm">
                3
              </span>
              <div>
                <h3 className="font-semibold text-base md:text-lg">Login with Registered Email</h3>
                <p className="text-muted-foreground text-sm mt-1">Use the same email you used during enrollment to log in.</p>
              </div>
            </li>
            {/* Step 4 */}
            <li className="flex items-start">
              <span className="absolute -left-4 flex items-center justify-center bg-primary rounded-full h-8 w-8 text-primary-foreground">
                <CheckCircle className="h-5 w-5"/>
              </span>
              <div>
                <h3 className="font-semibold text-base md:text-lg">Access Granted!</h3>
                <p className="text-muted-foreground text-sm mt-1">Your batch access will be updated within 2 minutes.</p>
              </div>
            </li>
          </ol>

          {/* Video Embed */}
          <div className="mt-8">
            <div className="relative mx-auto max-w-2xl" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/gQH0_Rp3Tuw?si=2h6AR1z0iVSFM3bS&rel=0"
                title="Dashboard Walkthrough"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
              ></iframe>
            </div>
          </div>

          {/* Support Email */}
          <div className="text-center mt-8 pt-6 border-t border-border/40">
            <p className="text-sm text-muted-foreground">
              Facing any issues? Please reach out to us at: 
              <a href="mailto:help.unknowniitians@gmail.com" className="font-semibold text-primary hover:underline ml-1">
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
