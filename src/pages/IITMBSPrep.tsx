import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ExamPrepHeader from "@/components/ExamPrepHeader";
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
  
  // Initialize state from URL
  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  const [initialParams, setInitialParams] = useState(() => getParamsFromUrl(location.pathname));

  // Sync tab state with URL when location changes
  useEffect(() => {
    const tabFromUrl = getTabFromUrl(location.pathname);
    const paramsFromUrl = getParamsFromUrl(location.pathname);
    setActiveTab(tabFromUrl);
    setInitialParams(paramsFromUrl);
  }, [location.pathname]);

  // Update URL when tab changes
  const updateUrl = (tab: string, branch?: string, level?: string, examType?: string, year?: string, subject?: string) => {
    const params: Record<string, string | undefined> = {};
    
    if (tab === 'notes' || tab === 'tools' || tab === 'courses' || tab === 'news' || tab === 'dates') {
      if (branch) params.branch = branch;
      if (level) params.level = level;
      if (subject) params.subject = subject;
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
    updateUrl(newTab); 
  };

  return (
    <>
      <NavBar />
      <main className="pt-16 min-h-screen bg-gray-50">
        {/* Header with Breadcrumb, Title, Share Button */}
        <ExamPrepHeader
          examName="IITM BS"
          examPath="/exam-preparation/iitm-bs"
          currentTab={activeTab}
          pageTitle="IITM BS Degree Preparation"
        />

        {/* Filters Row */}
        <div className="bg-white border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="overflow-x-auto pb-1">
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
            </Tabs>
          </div>
        </div>

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsContent value="notes" className="mt-0">
                <BranchNotesTab 
                  initialParams={initialParams} 
                  onFilterChange={updateUrl} 
                />
              </TabsContent>
              
              <TabsContent value="pyqs" className="mt-0">
                <PYQsTab 
                  initialParams={initialParams} 
                  onFilterChange={updateUrl} 
                />
              </TabsContent>
              
              <TabsContent value="syllabus" className="mt-0">
                <SyllabusTab 
                  initialParams={initialParams} 
                  onFilterChange={updateUrl} 
                />
              </TabsContent>
              
              <TabsContent value="tools" className="mt-0">
                <IITMToolsTab />
              </TabsContent>
              
              <TabsContent value="courses" className="mt-0">
                <PaidCoursesTab />
              </TabsContent>
              
              <TabsContent value="news" className="mt-0">
                <NewsTab />
              </TabsContent>
              
              <TabsContent value="dates" className="mt-0">
                <ImportantDatesTab />
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default IITMBSPrep;
