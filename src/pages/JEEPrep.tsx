import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ExamPrepHeader from "@/components/ExamPrepHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubjectBlock from "@/components/SubjectBlock";
import JEEPYQTab from "@/components/JEEPYQTab";
import OptimizedAuthWrapper from "@/components/OptimizedAuthWrapper";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import StudyGroupsTab from "@/components/StudyGroupsTab";
import NewsUpdatesTab from "@/components/NewsUpdatesTab";
import ImportantDatesTab from "@/components/ImportantDatesTab";
import { buildExamUrl, getTabFromUrl, getParamsFromUrl, slugify } from "@/utils/urlHelpers";
import { generateSEOTitle, generateSEODescription, generateCanonicalUrl } from "@/utils/seoHelpers";

const JEEPrep = () => {
  const { notes, contentLoading } = useBackend();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize state from URL
  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  const [urlParams, setUrlParams] = useState(() => getParamsFromUrl(location.pathname));

  // Sync tab state with URL when location changes
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
    
    Array.from(subjectSet).forEach(s => {
        if (!sortedSubjects.includes(s)) {
            sortedSubjects.push(s);
        }
    });

    return sortedSubjects;
  }, [jeeNotes]);

  // Initialize filters from URL params - subject first, then class
  const urlSubject = urlParams[0];
  const urlClass = urlParams[1]?.toLowerCase();
  
  // Find matching subject from available subjects (case-insensitive)
  const matchedSubject = urlSubject 
    ? subjects.find(s => s.toLowerCase() === urlSubject.toLowerCase()) 
    : null;
  const initialSubject = matchedSubject || (subjects.length > 0 ? subjects[0] : "Physics");
  const initialClass = urlClass || "class11";
  
  const [activeSubject, setActiveSubject] = useState(initialSubject);
  const [activeClass, setActiveClass] = useState(initialClass);
  const [downloads, setDownloads] = useState<Record<string, number>>({});

  // Update URL when filters change
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
      let newSubject = activeSubject;
      
      if (urlSubject) {
        const matched = subjects.find(s => s.toLowerCase() === urlSubject.toLowerCase());
        if (matched && matched !== activeSubject) {
          newSubject = matched;
          setActiveSubject(matched);
          updateUrl(activeTab, matched, activeClass);
          return;
        }
      }
      
      const isSubjectAvailable = subjects.some(s => s.toLowerCase() === activeSubject.toLowerCase());
      if (!isSubjectAvailable) {
        newSubject = subjects[0];
        setActiveSubject(newSubject);
        updateUrl(activeTab, newSubject, activeClass);
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
    setDownloads(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
    console.log(`Downloading: ${id}`);
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

  // SEO Meta Tags
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

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, [pageTitle, pageDescription, canonicalUrl]);

  return (
    <>
      <NavBar />
      
      <main className="pt-16">
        {/* Header with Breadcrumb, Title, Share Button */}
        <ExamPrepHeader
          examName="JEE"
          examPath="/exam-preparation/jee"
          currentTab={activeTab}
          pageTitle="JEE Preparation"
        />

        {/* Filters Row */}
        <div className="bg-white border-b sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Tabs defaultValue="notes" value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="overflow-x-auto pb-1">
                <TabsList className="w-full min-w-fit">
                  <TabsTrigger value="notes" className="rounded-md flex-shrink-0">
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="pyqs" className="rounded-md flex-shrink-0">
                    Previous Year Papers
                  </TabsTrigger>
                  <TabsTrigger value="study-groups" className="rounded-md flex-shrink-0">
                    Study Groups
                  </TabsTrigger>
                  <TabsTrigger value="news-updates" className="rounded-md flex-shrink-0">
                    News & Updates
                  </TabsTrigger>
                  <TabsTrigger value="important-dates" className="rounded-md flex-shrink-0">
                    Important Dates
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Main Content */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsContent value="notes">
                {/* Subject Filter Tabs */}
                <div className="mb-6">
                  {contentLoading && subjects.length === 0 ? (
                     <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
                     </div>
                  ) : (
                    <Tabs value={activeSubject} onValueChange={handleSubjectChange}>
                      <div className="overflow-x-auto pb-2">
                        <TabsList className="w-full min-w-fit">
                          {subjects.map((subject) => (
                            <TabsTrigger key={subject} value={subject} className="rounded-md flex-shrink-0">
                              {subject}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                    </Tabs>
                  )}
                </div>

                {/* Class Filter */}
                <div className="mb-6">
                  <Tabs value={activeClass} onValueChange={handleClassChange}>
                    <div className="overflow-x-auto pb-2">
                      <TabsList className="w-full min-w-fit">
                        {classes.map((classItem) => (
                          <TabsTrigger key={classItem.value} value={classItem.value} className="rounded-md flex-shrink-0">
                            {classItem.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>
                  </Tabs>
                </div>

                {renderTabContent("notes", 
                  <SubjectBlock 
                    subject={activeSubject} 
                    selectedClass={activeClass}
                    examType="JEE"
                  />
                )}
              </TabsContent>

              <TabsContent value="pyqs">
                {renderTabContent("pyqs", <JEEPYQTab downloads={downloads} onDownload={handleDownload} onFilterChange={updateUrl} />)}
              </TabsContent>

              <TabsContent value="study-groups">
                {renderTabContent("study-groups", <StudyGroupsTab examType="JEE" />)}
              </TabsContent>

              <TabsContent value="news-updates">
                {renderTabContent("news-updates", <NewsUpdatesTab examType="JEE" />)}
              </TabsContent>

              <TabsContent value="important-dates">
                {renderTabContent("important-dates", <ImportantDatesTab examType="JEE" />)}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default JEEPrep;
