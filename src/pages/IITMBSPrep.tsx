// src/pages/IITMBSPrep.tsx

import React from "react";
import { Routes, Route, NavLink, Outlet } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import BranchNotesTab from "@/components/iitm/BranchNotesTab";
import PYQsTab from "@/components/iitm/PYQsTab";
import NewsTab from "@/components/iitm/NewsTab";
import ImportantDatesTab from "@/components/iitm/ImportantDatesTab";
import SyllabusTab from "@/components/iitm/SyllabusTab";
import IITMToolsTab from "@/components/iitm/IITMToolsTab";
import PaidCoursesTab from "@/components/iitm/PaidCoursesTab";


const activeLinkStyle = {
  fontWeight: 'bold',
  color: 'darkblue',
  textDecoration: 'underline',
};

const IITMBSPrepPageLayout = () => {
    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <nav className="inline-flex w-max min-w-full" style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <NavLink to="notes" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="whitespace-nowrap">Notes</NavLink>
                    <NavLink to="pyqs" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="whitespace-nowrap">PYQs</NavLink>
                    <NavLink to="syllabus" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="whitespace-nowrap">Syllabus</NavLink>
                    <NavLink to="tools" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="whitespace-nowrap">Tools</NavLink>
                    <NavLink 
                        to="courses" 
                        style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                        className="whitespace-nowrap bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:via-yellow-600 data-[state=active]:to-yellow-700 shadow-lg border-2 border-yellow-400"
                    >
                      ✨ Courses
                    </NavLink>
                    <NavLink to="news" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="whitespace-nowrap">News</NavLink>
                    <NavLink to="dates" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)} className="whitespace-nowrap">Important Dates</NavLink>
                </nav>
            </div>
            <div className="mt-6">
                <Outlet />
            </div>
        </div>
    );
};


const IITMBSPrep = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">IITM BS Degree Preparation</h1>
            <p className="text-xl text-gray-600">Comprehensive resources for IITM BS Data Science & Electronic Systems</p>
          </div>
          
          <Routes>
              <Route element={<IITMBSPrepPageLayout />}>
                  <Route path="notes" element={<BranchNotesTab />} />
                  <Route path="pyqs" element={<PYQsTab />} />
                  <Route path="syllabus" element={<SyllabusTab />} />
                  <Route path="tools" element={<IITMToolsTab />} />
                  <Route path="courses" element={<PaidCoursesTab />} />
                  <Route path="news" element={<NewsTab />} />
                  <Route path="dates" element={<ImportantDatesTab />} />
              </Route>
          </Routes>
        </div>
      </div>
    </>
  );
};

export default IITMBSPrep;
