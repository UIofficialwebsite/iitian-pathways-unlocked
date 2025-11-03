import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { buildExamUrl, getTabFromUrl, getParamsFromUrl } from "@/utils/urlHelpers";

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize state from URL (this part was correct)
  const initialTab = getTabFromUrl(location.pathname);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // **NEW:** Get the filter params from the URL on load
  const initialParams = getParamsFromUrl(location.pathname);

  // Update URL when tab changes
  const updateUrl = (tab: string, branch?: string, level?: string, examType?: string, year?: string) => {
    const params: Record<string, string | undefined> = {};
    
    if (tab === 'notes' || tab === 'tools' || tab === 'courses' || tab === 'news' || tab === 'dates') {
      if (branch) params.branch = branch;
      if (level) params.level = level;
    } else if (tab === 'pyqs') {
      if (branch) params.branch = branch;
      if (level) params.level = level;
      if (examType) params.examType = examType;
      if (year) params.year = year;
    } else if (tab === 'syllabus') {
      if (branch) params.branch = branch;
    }
    
    const newUrl = buildExamUrl('iitm-bs', tab, params);
    navigate(newUrl, { replace: true });
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    // When changing tabs, we only update the tab in the URL, not the filters
    updateUrl(newTab); 
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
            
            {/* **MODIFIED:** Pass 'initialParams' to tab components */}
            <TabsContent value="notes" className="mt-6">
              <BranchNotesTab 
                initialParams={initialParams} 
                onFilterChange={updateUrl} 
              />
            </TabsContent>
            
            <TabsContent value="pyqs" className="mt-6">
              <PYQsTab 
                initialParams={initialParams} 
                onFilterChange={updateUrl} 
              />
            </TabsContent>
            
            <TabsContent value="syllabus" className="mt-6">
              <SyllabusTab 
                initialParams={initialParams} 
                onFilterChange={updateUrl} 
              />
            </TabsContent>
            
            <TabsContent value="tools" className="mt-6">
              {/* Assuming IITMToolsTab might also need params */}
              <IITMToolsTab initialParams={initialParams} />
            </TabsContent>
            
            <TabsContent value="courses" className="mt-6">
              {/* Assuming PaidCoursesTab might also need params */}
              <PaidCoursesTab initialParams={initialParams} />
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
