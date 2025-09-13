// src/pages/JEEPrep.tsx

import React, { useMemo } from "react";
import { Routes, Route, NavLink, Outlet, useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectBlock from "@/components/SubjectBlock";
import JEEPYQTab from "@/components/JEEPYQTab";
import OptimizedAuthWrapper from "@/components/OptimizedAuthWrapper";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import StudyGroupsTab from "@/components/StudyGroupsTab";
import NewsUpdatesTab from "@/components/NewsUpdatesTab";
import ImportantDatesTab from "@/components/ImportantDatesTab";

// Reusable style for active navigation links
const activeLinkStyle = {
  fontWeight: 'bold',
  color: 'red',
  textDecoration: 'underline',
};

/**
 * Provides the main layout for the JEE Prep page, including the navigation tabs.
 * The <Outlet /> component renders the content of the currently active route.
 */
const JEEPrepPageLayout = () => {
    return (
        <div>
            <nav style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <NavLink to="notes/physics/class11" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Notes</NavLink>
                <NavLink to="pyqs" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>PYQs</NavLink>
                <NavLink to="study-groups" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Study Groups</NavLink>
                <NavLink to="news-updates" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>News & Updates</NavLink>
                <NavLink to="important-dates" style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}>Important Dates</NavLink>
            </nav>
            <Outlet />
        </div>
    );
};

/**
 * This component specifically handles the logic and UI for the "Notes" tab.
 */
const JEENotesSection = () => {
    const { notes, contentLoading } = useBackend();
    const { subject = 'physics', class: className = 'class11' } = useParams();
    const navigate = useNavigate();

    const jeeNotes = useMemo(() => notes.filter(note => note.exam_type === 'JEE'), [notes]);

    const subjects = useMemo(() => {
        const preferredOrder = ["Physics", "Mathematics", "Physical Chemistry", "Inorganic Chemistry", "Organic Chemistry"];
        const subjectSet = new Set(jeeNotes.map(note => note.subject).filter(Boolean) as string[]);
        const sortedSubjects = preferredOrder.filter(s => subjectSet.has(s));
        Array.from(subjectSet).forEach(s => {
            if (!sortedSubjects.includes(s)) {
                sortedSubjects.push(s);
            }
        });
        return sortedSubjects;
    }, [jeeNotes]);

    // Handlers now navigate to a new URL instead of setting state
    const handleSubjectChange = (newSubject: string) => {
        navigate(`/exam-preparation/jee/notes/${newSubject.toLowerCase()}/${className}`);
    };

    const handleClassChange = (newClass: string) => {
        navigate(`/exam-preparation/jee/notes/${subject}/${newClass}`);
    };
    
    const classes = [
      { value: "class11", label: "Class 11" },
      { value: "class12", label: "Class 12" }
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Subject-wise Notes</h2>
            <div className="mb-6">
                {contentLoading && subjects.length === 0 ? (
                    <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
                    </div>
                ) : (
                    <Tabs value={subject} onValueChange={handleSubjectChange}>
                        <div className="overflow-x-auto pb-2">
                            <TabsList className="w-full min-w-fit">
                                {subjects.map((s) => (
                                    <TabsTrigger key={s} value={s.toLowerCase()} className="rounded-md flex-shrink-0">{s}</TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </Tabs>
                )}
            </div>
            <div className="mb-6">
                <Tabs value={className} onValueChange={handleClassChange}>
                    <div className="overflow-x-auto pb-2">
                        <TabsList className="w-full min-w-fit">
                            {classes.map((classItem) => (
                                <TabsTrigger key={classItem.value} value={classItem.value} className="rounded-md flex-shrink-0">{classItem.label}</TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </Tabs>
            </div>
            <SubjectBlock subject={subject} selectedClass={className} examType="JEE" />
        </div>
    );
};

/**
 * The main component for the JEE Preparation section. It defines the overall
 * page structure and the nested routes for each tab.
 */
const JEEPrep = () => {
  return (
    <>
      {/* The main container keeps the consistent header and background */}
      <section className="bg-gradient-to-r from-royal to-royal-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">JEE Preparation</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Master Physics, Chemistry, and Mathematics with our comprehensive JEE study materials
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* The Routes component handles which tab's content to display */}
            <Routes>
                <Route element={<JEEPrepPageLayout />}>
                    <Route path="notes/:subject/:class" element={<JEENotesSection />} />
                    <Route path="pyqs" element={<JEEPYQTab downloads={{}} onDownload={() => {}} />} />
                    <Route path="study-groups" element={<OptimizedAuthWrapper><StudyGroupsTab examType="JEE" /></OptimizedAuthWrapper>} />
                    <Route path="news-updates" element={<NewsUpdatesTab examType="JEE" />} />
                    <Route path="important-dates" element={<ImportantDatesTab examType="JEE" />} />
                </Route>
            </Routes>
        </div>
      </section>
    </>
  );
};

export default JEEPrep;
