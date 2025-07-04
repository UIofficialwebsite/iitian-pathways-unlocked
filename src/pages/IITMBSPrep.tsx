
import React, { useState } from "react";
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
import TelegramBanner from "@/components/iitm/TelegramBanner";

const IITMBSPrep = () => {
  const [activeTab, setActiveTab] = useState("notes");

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">IITM BS Degree Preparation</h1>
            <p className="text-xl text-gray-600">Comprehensive resources for IITM BS Data Science & Electronic Systems</p>
          </div>
          
          <TelegramBanner />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="pyqs">PYQs</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="dates">Important Dates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notes" className="mt-6">
              <BranchNotesTab />
            </TabsContent>
            
            <TabsContent value="pyqs" className="mt-6">
              <PYQsTab />
            </TabsContent>
            
            <TabsContent value="syllabus" className="mt-6">
              <SyllabusTab />
            </TabsContent>
            
            <TabsContent value="tools" className="mt-6">
              <IITMToolsTab />
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
