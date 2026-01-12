import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ExamPrepHeader from "@/components/ExamPrepHeader";
import SubjectBlock from "@/components/SubjectBlock";
import JEEPYQTab from "@/components/JEEPYQTab";
import OptimizedAuthWrapper from "@/components/OptimizedAuthWrapper";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import StudyGroupsTab from "@/components/StudyGroupsTab";
import NewsUpdatesTab from "@/components/NewsUpdatesTab";
import ImportantDatesTab from "@/components/ImportantDatesTab";
import { buildExamUrl, getTabFromUrl, getParamsFromUrl } from "@/utils/urlHelpers";
import { generateSEOTitle, generateSEODescription, generateCanonicalUrl } from "@/utils/seoHelpers";

const JEEPrep = () => {
  const { notes, contentLoading } = useBackend();
  const navigate = useNavigate();
  const location = useLocation();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  const [urlParams, setUrlParams] = useState(() => getParamsFromUrl(location.pathname));

  useEffect(() => {
    const handleScroll = () => {
      const offset = filterRef.current?.offsetTop || 0;
      setIsSticky(window.scrollY > offset - 64);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const tabFromUrl = getTabFromUrl(location.pathname);
    const paramsFromUrl = getParamsFromUrl(location.pathname);
    setActiveTab(tabFromUrl);
    setUrlParams(paramsFromUrl);
  }, [location.pathname]);

  const jeeNotes = useMemo(() => notes.filter(note => note.exam_type === 'JEE'), [notes]);

  const subjects = useMemo(() => {
    const preferredOrder = ["Physics", "Mathematics", "Physical Chemistry", "Inorganic Chemistry", "Organic Chemistry"];
    const subjectSet = new Set(jeeNotes.map(note => note.subject).filter(Boolean) as string[]);
    const sortedSubjects = preferredOrder.filter(s => subjectSet.has(s));
    Array.from(subjectSet).forEach(s => { if (!sortedSubjects.includes(s)) sortedSubjects.push(s); });
    return sortedSubjects;
  }, [jeeNotes]);

  const urlSubject = urlParams[0];
  const urlClass = urlParams[1]?.toLowerCase();
  const matchedSubject = urlSubject ? subjects.find(s => s.toLowerCase() === urlSubject.toLowerCase()) : null;
  const initialSubject = matchedSubject || (subjects.length > 0 ? subjects[0] : "Physics");
  const initialClass = urlClass || "class11";
  
  const [activeSubject, setActiveSubject] = useState(initialSubject);
  const [activeClass, setActiveClass] = useState(initialClass);
  const [downloads, setDownloads] = useState<Record<string, number>>({});

  const updateUrl = (tab: string, subject?: string, classLevel?: string, year?: string, session?: string) => {
    const params: Record<string, string | undefined> = {};
    if (tab === 'notes' || tab === 'syllabus') {
      if (subject) params.subject = subject;
      if (classLevel) params.class = classLevel;
    } else if (tab === 'pyqs') {
      if (subject) params.subject = subject;
      if (classLevel) params.class = classLevel;
      if (year) params.year = year;
      if (session) params.session = session;
    }
    const newUrl = buildExamUrl('jee', tab, params);
    navigate(newUrl, { replace: true });
  };

  useEffect(() => {
    if (!contentLoading && subjects.length > 0) {
      const isSubjectAvailable = subjects.some(s => s.toLowerCase() === activeSubject.toLowerCase());
      if (!isSubjectAvailable) {
        setActiveSubject(subjects[0]);
        updateUrl(activeTab, subjects[0], activeClass);
      }
    }
  }, [contentLoading, subjects]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    updateUrl(newTab, activeSubject, activeClass);
  };

  const handleSubjectChange = (newSubject: string) => {
    setActiveSubject(newSubject);
    updateUrl(activeTab, newSubject, activeClass);
  };

  const handleClassChange = (newClass: string) => {
    setActiveClass(newClass);
    updateUrl(activeTab, activeSubject, newClass);
  };

  const handleDownload = (id: string) => {
    setDownloads(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const renderTabContent = (tab: string, content: React.ReactNode) => {
    const protectedTabs = ["study-groups", "pyqs"];
    return protectedTabs.includes(tab) ? <OptimizedAuthWrapper>{content}</OptimizedAuthWrapper> : content;
  };

  const classes = [
    { value: "class11", label: "Class 11" },
    { value: "class12", label: "Class 12" }
  ];

  const currentParams = [activeSubject, activeClass === 'class11' ? 'Class 11' : 'Class 12'];
  const pageTitle = generateSEOTitle('jee', activeTab, currentParams);
  const pageDescription = generateSEODescription('jee', activeTab, currentParams);
  const canonicalUrl = generateCanonicalUrl(location.pathname);

  useEffect(() => {
    document.title = pageTitle;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', pageDescription);
  }, [pageTitle, pageDescription]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <NavBar />
      
      <main className="pt-16">
        <ExamPrepHeader
          examName="JEE"
          examPath="/exam-preparation/jee"
          currentTab={activeTab}
          pageTitle="JEE Preparation"
        />

        <div ref={filterRef} className={`w-full z-[60] transition-shadow duration-300 ${isSticky ? 'fixed top-16 bg-white border-b shadow-none' : 'relative'}`}>
          <div className="bg-[#f4f2ff]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-8 pt-4 overflow-x-auto no-scrollbar">
                {[
                  { id: "notes", label: "Notes" },
                  { id: "pyqs", label: "Previous Year Papers" },
                  { id: "study-groups", label: "Study Groups" },
                  { id: "news-updates", label: "News & Updates" },
                  { id: "important-dates", label: "Important Dates" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`pb-2 text-[14px] md:text-[15px] cursor-pointer transition-all whitespace-nowrap font-sans ${
                      activeTab === tab.id ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {(activeTab === 'notes' || activeTab === 'pyqs') && (
            <div className="bg-white border-b border-[#f3f4f6]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-nowrap items-center gap-3 py-3 font-sans overflow-x-auto no-scrollbar">
                  {/* Category Filter (Subjects) */}
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => handleSubjectChange(subject)}
                      className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all whitespace-nowrap ${
                        activeSubject === subject ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                  
                  {/* Sub-category Filter (Classes) - Separator removed */}
                  {classes.map((cls) => (
                    <button
                      key={cls.value}
                      onClick={() => handleClassChange(cls.value)}
                      className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all whitespace-nowrap ${
                        activeClass === cls.value ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'
                      }`}
                    >
                      {cls.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {isSticky && <div className="h-[120px]" />}

        <section className="py-8 bg-white min-h-[600px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === "notes" && renderTabContent("notes", 
              <SubjectBlock subject={activeSubject} selectedClass={activeClass} examType="JEE" />
            )}
            {activeTab === "pyqs" && renderTabContent("pyqs", 
              <JEEPYQTab downloads={downloads} onDownload={handleDownload} onFilterChange={updateUrl} />
            )}
            {activeTab === "study-groups" && renderTabContent("study-groups", <StudyGroupsTab examType="JEE" />)}
            {activeTab === "news-updates" && renderTabContent("news-updates", <NewsUpdatesTab examType="JEE" />)}
            {activeTab === "important-dates" && renderTabContent("important-dates", <ImportantDatesTab examType="JEE" />)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default JEEPrep;
