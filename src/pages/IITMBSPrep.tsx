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
  const { section, branch, level } = router.query;
  
  const [activeTab, setActiveTab] = useState("notes");
  const [currentBranch, setCurrentBranch] = useState("data-science");
  const [currentLevel, setCurrentLevel] = useState("foundation");

  useEffect(() => {
    // Extract URL parameters and set initial state
    if (section && typeof section === 'string') {
      setActiveTab(section);
    }
    if (branch && typeof branch === 'string') {
      setCurrentBranch(branch);
    }
    if (level && typeof level === 'string') {
      setCurrentLevel(level);
    }
  }, [section, branch, level]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL with new section while maintaining branch and level
    router.push(
      `/exam-preparation/iitm-bs/${value}/${currentBranch}/${currentLevel}`,
      undefined,
      { shallow: true }
    );
  };

  const handleBranchLevelChange = (newBranch: string, newLevel: string) => {
    setCurrentBranch(newBranch);
    setCurrentLevel(newLevel);
    // Update URL with new branch and level while maintaining section
    router.push(
      `/exam-preparation/iitm-bs/${activeTab}/${newBranch}/${newLevel}`,
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">IITM BS Degree Preparation</h1>
            <p className="text-xl text-gray-600">Comprehensive resources for IITM BS Data Science & Electronic Systems</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-max min-w-full">
                <TabsTrigger value="notes" className="whitespace-nowrap">Notes</TabsTrigger>
                <TabsTrigger value="pyqs" className="whitespace-nowrap">PYQs</TabsTrigger>
                <TabsTrigger value="syllabus" className="whitespace-nowrap">Syllabus</TabsTrigger>
                <TabsTrigger value="tools" className="whitespace-nowrap">Tools</TabsTrigger>
                <TabsTrigger 
                  value="courses" 
                  className="whitespace-nowrap bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:via-yellow-600 data-[state=active]:to-yellow-700 shadow-lg border-2 border-yellow-400"
                >
                  ✨ Courses
                </TabsTrigger>
                <TabsTrigger value="news" className="whitespace-nowrap">News</TabsTrigger>
                <TabsTrigger value="dates" className="whitespace-nowrap">Important Dates</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="notes" className="mt-6">
              <BranchNotesTab 
                branch={currentBranch} 
                level={currentLevel} 
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="pyqs" className="mt-6">
              <PYQsTab 
                branch={currentBranch} 
                level={currentLevel} 
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="syllabus" className="mt-6">
              <SyllabusTab 
                branch={currentBranch} 
                level={currentLevel} 
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="tools" className="mt-6">
              <IITMToolsTab 
                branch={currentBranch} 
                level={currentLevel} 
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="courses" className="mt-6">
              <PaidCoursesTab 
                branch={currentBranch} 
                level={currentLevel} 
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="news" className="mt-6">
              <NewsTab 
                branch={currentBranch} 
                level={currentLevel} 
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
            
            <TabsContent value="dates" className="mt-6">
              <ImportantDatesTab 
                branch={currentBranch} 
                level={currentLevel} 
                onBranchLevelChange={handleBranchLevelChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default IITMBSPrep;
