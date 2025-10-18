import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, HelpCircle } from 'lucide-react';

const CourseAccessGuide = () => {
  return (
    <div className="my-8">
        <h2 className="text-3xl font-bold text-center mb-6">How to Access Your Course</h2>
        <Card className="bg-gray-50 border-gray-200 overflow-hidden">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Enrolled for our Premium Courses? Here's what's next.</CardTitle>
            </CardHeader>
            <CardContent className="px-8 py-6">
                <ol className="relative border-l-2 border-gray-200 space-y-10 pl-8 ml-4">
                    {/* Step 1 */}
                    <li className="flex items-start">
                        <span className="absolute -left-5 flex items-center justify-center bg-green-500 rounded-full h-10 w-10 text-white font-bold text-lg">
                            1
                        </span>
                        <div className="ml-6">
                            <h3 className="font-semibold text-xl">Go to Your Profile Dashboard</h3>
                            <p className="text-gray-600 mt-1">After enrolling, navigate to your personal dashboard.</p>
                        </div>
                    </li>
                    {/* Step 2 */}
                    <li className="flex items-start">
                        <span className="absolute -left-5 flex items-center justify-center bg-green-500 rounded-full h-10 w-10 text-white font-bold text-lg">
                            2
                        </span>
                        <div className="ml-6">
                            <h3 className="font-semibold text-xl">Click on the SSP Portal Block</h3>
                            <p className="text-gray-600 mt-1">Find and click the SSP Portal to proceed.</p>
                        </div>
                    </li>
                    {/* Step 3 */}
                    <li className="flex items-start">
                        <span className="absolute -left-5 flex items-center justify-center bg-green-500 rounded-full h-10 w-10 text-white font-bold text-lg">
                            3
                        </span>
                        <div className="ml-6">
                            <h3 className="font-semibold text-xl">Login with Registered Email</h3>
                            <p className="text-gray-600 mt-1">Use the same email you used during enrollment to log in.</p>
                        </div>
                    </li>
                     {/* Step 4 */}
                     <li className="flex items-start">
                        <span className="absolute -left-5 flex items-center justify-center bg-green-500 rounded-full h-10 w-10 text-white">
                            <CheckCircle className="h-6 w-6"/>
                        </span>
                        <div className="ml-6">
                            <h3 className="font-semibold text-xl">Access Granted!</h3>
                            <p className="text-gray-600 mt-1">Your batch access will be updated within 2 minutes.</p>
                        </div>
                    </li>
                </ol>

                {/* Video Embed */}
                <div className="mt-12">
                    <div className="aspect-w-16 aspect-h-9 w-full">
                        <iframe 
                            src="https://www.youtube.com/embed/gQH0_Rp3Tuw?si=2h6AR1z0iVSFM3bS&rel=0" 
                            title="Dashboard Walkthrough" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full rounded-lg shadow-xl"
                        ></iframe>
                    </div>
                </div>

                {/* Support Email */}
                <div className="text-center mt-10">
                    <p className="text-md text-gray-700">
                        Facing any issues? Please reach out to us at: 
                        <a href="mailto:help.unknowniitians@gmail.com" className="font-semibold text-royal hover:underline ml-1">
                            help.unknowniitians@gmail.com
                        </a>
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default CourseAccessGuide;
