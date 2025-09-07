import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BranchNotesTab from "@/components/iitm/BranchNotesTab";
import PYQsTab from "@/components/iitm/PYQsTab";
import NewsTab from "@/components/iitm/NewsTab";
import ImportantDatesTab from "@/components/iitm/ImportantDatesTab";
import SyllabusTab from "@/components/iitm/SyllabusTab";
import IITMToolsTab from "@/components/iitm/IITMToolsTab";
import PaidCoursesTab from "@/components/iitm/PaidCoursesTab";

const IITMBSPrep = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("notes");
  const [currentBranch, setCurrentBranch] = useState("data-science");
  const [currentLevel, setCurrentLevel] = useState("foundation");

  // Extract parameters from URL path
  useEffect(() => {
    const { asPath } = router;
    const pathSegments = asPath.split('/');
    
    // Expected format: /exam-preparation/iitm-bs/{section}/{branch}/{level}
    if (pathSegments.length >= 6 && pathSegments[1] === 'exam-preparation' && pathSegments[2] === 'iitm-bs') {
      const section = pathSegments[3];
      const branch = pathSegments[4];
      const level = pathSegments[5];
      
      setActiveTab(section);
      setCurrentBranch(branch);
      setCurrentLevel(level);
    }
  }, [router.asPath]);

  // Handle tab changes with URL navigation
  const handleTabChange = (newTab) => {
    const newPath = `/exam-preparation/iitm-bs/${newTab}/${currentBranch}/${currentLevel}`;
    router.push(newPath, undefined, { shallow: true });
    setActiveTab(newTab);
  };

  // Handle branch/level changes from child components
  const handleBranchLevelChange = (branch, level) => {
    const newPath = `/exam-preparation/iitm-bs/${activeTab}/${branch}/${level}`;
    router.push(newPath, undefined, { shallow: true });
    setCurrentBranch(branch);
    setCurrentLevel(level);
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              IITM BS Degree Preparation
            </h1>
            <p className="text-xl text-gray-600">
              Comprehensive resources for IITM BS Data Science & Electronic Systems
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-max min-w-full">
                <TabsTrigger value="notes" className="whitespace-nowrap">
                  Notes
                </TabsTrigger>
                <TabsTrigger value="pyqs" className="whitespace-nowrap">
                  PYQs
                </TabsTrigger>
                <TabsTrigger value="syllabus" className="whitespace-nowrap">
                  Syllabus
                </TabsTrigger>
                <TabsTrigger value="tools" className="whitespace-nowrap">
                  Tools
                </TabsTrigger>
                <TabsTrigger 
                  value="courses" 
                  className="whitespace-nowrap bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:via-yellow-600 data-[state=active]:to-yellow-700 shadow-lg border-2 border-yellow-400"
                >
                  ✨ Courses
                </TabsTrigger>
                <TabsTrigger value="news" className="whitespace-nowrap">
                  News
                </TabsTrigger>
                <TabsTrigger value="dates" className="whitespace-nowrap">
                  Important Dates
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="notes" className="mt-6">
              <BranchNotesTab 
                currentBranch={currentBranch}
                currentLevel={currentLevel}
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="pyqs" className="mt-6">
              <PYQsTab 
                currentBranch={currentBranch}
                currentLevel={currentLevel}
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="syllabus" className="mt-6">
              <SyllabusTab 
                currentBranch={currentBranch}
                currentLevel={currentLevel}
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="tools" className="mt-6">
              <IITMToolsTab />
            </TabsContent>
            
            <TabsContent value="courses" className="mt-6">
              <PaidCoursesTab 
                currentBranch={currentBranch}
                currentLevel={currentLevel}
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="news" className="mt-6">
              <NewsTab />
            </TabsContent>
            
            <TabsContent value="dates" className="mt-6">
              <ImportantDatesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default IITMBSPrep;
