import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, HelpCircle } from 'lucide-react';

const CourseAccessGuide = () => {
  return (
    <div className="my-8">
        <h2 className="text-3xl font-bold text-center mb-6">How to Access Your Course</h2>
        <Card className="bg-gray-50 border-gray-200">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Enrolled for our Premium Courses? Here's what's next.</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <ol className="relative border-l-2 border-gray-200 space-y-8 pl-6">
                    <li className="flex items-start">
                        <span className="absolute -left-4 flex items-center justify-center bg-green-500 rounded-full h-8 w-8 text-white">
                            1
                        </span>
                        <div className="ml-4">
                            <h3 className="font-semibold text-lg">Go to Your Profile Dashboard</h3>
                            <p className="text-gray-600">After enrolling, navigate to your personal dashboard.</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="absolute -left-4 flex items-center justify-center bg-green-500 rounded-full h-8 w-8 text-white">
                            2
                        </span>
                        <div className="ml-4">
                            <h3 className="font-semibold text-lg">Click on the SSP Portal Block</h3>
                            <p className="text-gray-600">Find and click the SSP Portal to proceed.</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <span className="absolute -left-4 flex items-center justify-center bg-green-500 rounded-full h-8 w-8 text-white">
                            3
                        </span>
                        <div className="ml-4">
                            <h3 className="font-semibold text-lg">Login with Registered Email</h3>
                            <p className="text-gray-600">Use the same email you used during enrollment to log in.</p>
                        </div>
                    </li>
                     <li className="flex items-start">
                        <span className="absolute -left-4 flex items-center justify-center bg-green-500 rounded-full h-8 w-8 text-white">
                            <CheckCircle className="h-5 w-5"/>
                        </span>
                        <div className="ml-4">
                            <h3 className="font-semibold text-lg">Access Granted!</h3>
                            <p className="text-gray-600">Your batch access will be updated within 2 minutes.</p>
                        </div>
                    </li>
                </ol>

                <div className="mt-8 text-center">
                    <div className="aspect-w-16 aspect-h-9">
                        <iframe 
                            src="https://www.youtube.com/embed/gQH0_Rp3Tuw?si=2h6AR1z0iVSFM3bS&rel=0" 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            className="w-full h-full rounded-lg shadow-lg"
                        ></iframe>
                    </div>
                </div>

                <div className="text-center mt-6 p-4 bg-red-50 border-l-4 border-red-400">
                    <p className="flex items-center justify-center text-lg">
                        <HelpCircle className="h-6 w-6 mr-2 text-red-500"/>
                        Facing any issues? Write to us at <a href="mailto:help.unknowniitians@gmail.com" className="font-semibold text-red-600 hover:underline ml-1">help.unknowniitians@gmail.com</a>
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default CourseAccessGuide;
