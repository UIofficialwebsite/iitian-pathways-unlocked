import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { TabsContent } from "@/components/ui/tabs";
import SubjectBlock from "@/components/SubjectBlock";
import JEEPYQTab from "@/components/JEEPYQTab";
import OptimizedAuthWrapper from "@/components/OptimizedAuthWrapper";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import StudyGroupsTab from "@/components/StudyGroupsTab";
import NewsUpdatesTab from "@/components/NewsUpdatesTab";
import ImportantDatesTab from "@/components/ImportantDatesTab";

const JEEPrep = () => {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const { notes, contentLoading } = useBackend();
  const [activeTab, setActiveTab] = useState(tab || "notes");

  const tabs = [
    { id: "notes", label: "Notes" },
    { id: "pyqs", label: "PYQs" },
    { id: "study-groups", label: "Study Groups" },
    { id: "news-updates", label: "News & Updates" },
    { id: "important-dates", label: "Important Dates" },
  ];

  // Update URL when tab changes
  useEffect(() => {
    if (tab !== activeTab) {
      if (activeTab === "notes") {
        navigate("/exam-preparation/jee", { replace: true });
      } else {
        navigate(`/exam-preparation/jee/${activeTab}`, { replace: true });
      }
    }
  }, [activeTab, tab, navigate]);

  // Update activeTab when URL changes
  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

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

  const [activeSubject, setActiveSubject] = useState("Physics");
  const [activeClass, setActiveClass] = useState("class11");
  const [downloads, setDownloads] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!contentLoading && subjects.length > 0 && !subjects.includes(activeSubject)) {
      setActiveSubject(subjects[0]);
    }
  }, [contentLoading, subjects, activeSubject]);

  const handleDownload = (id: string) => {
    setDownloads(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    console.log(`Downloading: ${id}`);
    // Here you would implement the actual download logic
  };

  const renderTabContent = (tab: string, content: React.ReactNode) => {
    const protectedTabs = ["study-groups", "pyqs"];
    
    if (protectedTabs.includes(tab)) {
      return <OptimizedAuthWrapper>{content}</OptimizedAuthWrapper>;
    }
    
    return content;
  };

  const classes = [
    { value: "class11", label: "Class 11" },
    { value: "class12", label: "Class 12" }
  ];

  return (
    <>
      <NavBar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-royal to-royal-dark text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">JEE Preparation</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Master Physics, Chemistry, and Mathematics with our comprehensive JEE study materials
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 md:mb-8">
              <AnimatedTabs
                tabs={tabs}
                defaultTab={activeTab}
                onChange={setActiveTab}
              />
            </div>

            <div className="mt-6 md:mt-8">
              {activeTab === "notes" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Subject-wise Notes</h2>
                  
                  {/* Subject Filter Tabs */}
                  <div className="mb-6">
                    {contentLoading && subjects.length === 0 ? (
                       <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
                       </div>
                    ) : (
                      <AnimatedTabs 
                        tabs={subjects.map(s => ({ id: s, label: s }))}
                        defaultTab={activeSubject}
                        onChange={setActiveSubject}
                      />
                    )}
                  </div>

                  {/* Class Filter */}
                  <div className="mb-6">
                    <AnimatedTabs 
                      tabs={classes.map(c => ({ id: c.value, label: c.label }))}
                      defaultTab={activeClass}
                      onChange={setActiveClass}
                    />
                  </div>

                  {renderTabContent("notes", 
                    <SubjectBlock 
                      subject={activeSubject} 
                      selectedClass={activeClass}
                      examType="JEE"
                    />
                  )}
                </div>
              )}

              {activeTab === "pyqs" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Previous Year Questions</h2>
                  {renderTabContent("pyqs", <JEEPYQTab downloads={downloads} onDownload={handleDownload} />)}
                </div>
              )}

              {activeTab === "study-groups" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Study Groups</h2>
                  {renderTabContent("study-groups", <StudyGroupsTab examType="JEE" />)}
                </div>
              )}

              {activeTab === "news-updates" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">News & Updates</h2>
                  {renderTabContent("news-updates", <NewsUpdatesTab examType="JEE" />)}
                </div>
              )}

              {activeTab === "important-dates" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Important Dates</h2>
                  {renderTabContent("important-dates", <ImportantDatesTab examType="JEE" />)}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <EmailPopup />
    </>
  );
};

export default JEEPrep;
