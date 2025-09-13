// src/pages/NEETPrep.tsx

import React from "react";
import { Routes, Route, NavLink, Outlet } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import NEETHeader from "@/components/neet/NEETHeader";
import NEETNotesTab from "@/components/neet/NEETNotesTab";
import NEETPYQTab from "@/components/NEETPYQTab";
import StudyGroupsTab from "@/components/StudyGroupsTab";
import NewsUpdatesTab from "@/components/NewsUpdatesTab";
import ImportantDatesTab from "@/components/ImportantDatesTab";
import OptimizedAuthWrapper from "@/components/OptimizedAuthWrapper";


const activeLinkStyle = {
  fontWeight: 'bold',
  color: 'teal',
  textDecoration: 'underline',
};

const NEETPrepPageLayout = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <NavLink to="notes" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Notes</NavLink>
                <NavLink to="pyqs" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>PYQs</NavLink>
                <NavLink to="study-groups" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Study Groups</NavLink>
                <NavLink to="news-updates" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>News & Updates</NavLink>
                <NavLink to="important-dates" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Important Dates</NavLink>
            </nav>
            <Outlet />
        </div>
    );
};

const NEETPrep = () => {
  return (
    <>
      <main className="pt-20">
        <NEETHeader />
        <section className="py-12 bg-white">
            <Routes>
                <Route element={<NEETPrepPageLayout />}>
                    <Route path="notes" element={<NEETNotesTab />} />
                    <Route path="pyqs" element={<NEETPYQTab />} />
                    <Route path="study-groups" element={<OptimizedAuthWrapper><StudyGroupsTab examType="NEET" /></OptimizedAuthWrapper>} />
                    <Route path="news-updates" element={<NewsUpdatesTab examType="NEET" />} />
                    <Route path="important-dates" element={<ImportantDatesTab examType="NEET" />} />
                </Route>
            </Routes>
        </section>
      </main>
    </>
  );
};

export default NEETPrep;
