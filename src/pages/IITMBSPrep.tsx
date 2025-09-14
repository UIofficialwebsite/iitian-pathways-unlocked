import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BranchNotesTab from "@/components/iitm/BranchNotesTab";
import PYQsTab from "@/components/iitm/PYQsTab";
import NewsTab from "@/components/iitm/NewsTab";
import ImportantDatesTab from "@/components/iitm/ImportantDatesTab";
import SyllabusTab from "@/components/iitm/SyllabusTab";
import PaidCoursesTab from "@/components/iitm/PaidCoursesTab";

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the active tab from the URL. Default to 'notes'.
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts[2] || 'notes';

  const handleTabChange = (tab: string) => {
    // When a tab is clicked, update the URL to that tab's base path.
    navigate(`/exam-preparation/iitm-bs/${tab}`);
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
            
            {/* This structure safely shows the content for each tab and avoids the crash. */}
            <TabsContent value="notes" className="mt-6">
              <BranchNotesTab />
            </TabsContent>
            <TabsContent value="pyqs" className="mt-6">
              <PYQsTab />
            </TabsContent>
            <TabsContent value="syllabus" className="mt-6">
              <SyllabusTab />
            </TabsContent>
            <TabsContent value="courses" className="mt-6">
              <PaidCoursesTab />
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
