
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import BranchNotesTab from "@/components/iitm/BranchNotesTab";
import PYQsTab from "@/components/iitm/PYQsTab";
import NewsTab from "@/components/iitm/NewsTab";
import ImportantDatesTab from "@/components/iitm/ImportantDatesTab";
import SyllabusTab from "@/components/iitm/SyllabusTab";
import IITMToolsTab from "@/components/iitm/IITMToolsTab";
import PaidCoursesTab from "@/components/iitm/PaidCoursesTab";

const IITMBSPrep = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || "notes");

  const tabs = [
    { id: "notes", label: "Notes" },
    { id: "pyqs", label: "PYQs" },
    { id: "syllabus", label: "Syllabus" },
    { id: "tools", label: "Tools" },
    { id: "courses", label: "Courses" },
    { id: "news", label: "News" },
    { id: "important-dates", label: "Important Dates" },
  ];

  // Update URL when tab changes
  useEffect(() => {
    if (tab !== activeTab) {
      if (activeTab === "notes") {
        navigate("/exam-preparation/iitm-bs", { replace: true });
      } else {
        navigate(`/exam-preparation/iitm-bs/${activeTab}`, { replace: true });
      }
    }
  }, [activeTab, tab, navigate]);

  // Update activeTab when URL changes
  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">IITM BS Degree Preparation</h1>
            <p className="text-xl text-gray-600">Comprehensive resources for IITM BS Data Science & Electronic Systems</p>
          </div>
          
          <div className="mb-6 md:mb-8">
            <AnimatedTabs
              tabs={tabs}
              defaultTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
          
          <div className="mt-6 md:mt-8">
            {activeTab === "notes" && <BranchNotesTab />}
            {activeTab === "pyqs" && <PYQsTab />}
            {activeTab === "syllabus" && <SyllabusTab />}
            {activeTab === "tools" && <IITMToolsTab />}
            {activeTab === "courses" && <PaidCoursesTab />}
            {activeTab === "news" && <NewsTab />}
            {activeTab === "important-dates" && <ImportantDatesTab />}
          </div>
        </div>
      </div>
      <Footer />
      <EmailPopup />
    </>
  );
};

export default IITMBSPrep;
