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

  // Determine the active tab from the URL, default to 'notes'
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts[2] || 'notes';

  const handleTabChange = (tab: string) => {
    // When a tab is clicked, update the URL
    navigate(`/exam-preparation/iitm-bs/${tab}`);
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font
