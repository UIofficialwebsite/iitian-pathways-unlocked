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
import { ChevronDown } from "lucide-react";
import { buildExamUrl, getTabFromUrl } from "@/utils/urlHelpers";

const JEEPrep = () => {
  const { notes, pyqs, contentLoading } = useBackend();
  const navigate = useNavigate();
  const location = useLocation();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<'subject' | 'year' | 'session' | null>(null);

  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  const [activeClass, setActiveClass] = useState("class11");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [tempSubjects, setTempSubjects] = useState<string[]>([]);
  
  // PYQ filters
  const [pyqSubject, setPyqSubject] = useState<string | null>(null);
  const [pyqYear, setPyqYear] = useState<string | null>(null);
  const [pyqSession, setPyqSession] = useState<string | null>(null);
  const [tempPyqSubject, setTempPyqSubject] = useState<string | null>(null);
  const [tempPyqYear, setTempPyqYear] = useState<string | null>(null);
  const [tempPyqSession, setTempPyqSession] = useState<string | null>(null);

  useEffect(() => {
    if (filterRef.current) setFilterOffset(filterRef.current.offsetTop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = 64;
      if (filterRef.current && filterOffset > 0) {
        setIsSticky(window.scrollY > filterOffset - navbarHeight);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filterOffset]);

  const availableSubjects = useMemo(() => {
    const jeeNotes = notes.filter(note => note.exam_type === 'JEE');
    const preferredOrder = ["Physics", "Mathematics", "Physical Chemistry", "Inorganic Chemistry", "Organic Chemistry"];
    const subjectSet = new Set(jeeNotes.map(note => note.subject).filter(Boolean) as string[]);
    const sorted = preferredOrder.filter(s => subjectSet.has(s));
    Array.from(subjectSet).forEach(s => { if (!sorted.includes(s)) sorted.push(s); });
    return sorted;
  }, [notes]);

  const availablePyqSubjects = useMemo(() => {
    const jeePyqs = pyqs.filter(p => p.exam_type === 'JEE');
    return Array.from(new Set(jeePyqs.map(p => p.subject).filter(Boolean) as string[])).sort();
  }, [pyqs]);

  const availableYears = useMemo(() => {
    const jeePyqs = pyqs.filter(p => p.exam_type === 'JEE');
    return Array.from(new Set(jeePyqs.map(p => p.year).filter(Boolean))).sort((a, b) => (b || 0) - (a || 0)).map(String);
  }, [pyqs]);

  const availableSessions = useMemo(() => {
    const jeePyqs = pyqs.filter(p => p.exam_type === 'JEE');
    return Array.from(new Set(jeePyqs.map(p => p.session).filter(Boolean) as string[])).sort();
  }, [pyqs]);

  useEffect(() => {
    if (!contentLoading && availableSubjects.length > 0 && selectedSubjects.length === 0) {
      setSelectedSubjects([availableSubjects[0]]);
      setTempSubjects([availableSubjects[0]]);
    }
  }, [contentLoading, availableSubjects]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (openDropdown && !(e.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setOpenDropdown(null);
    const firstSub = selectedSubjects[0] || availableSubjects[0];
    navigate(buildExamUrl('jee', newTab, { subject: firstSub, class: activeClass }), { replace: true });
  };

  const toggleDropdown = (type: 'subject' | 'year' | 'session') => {
    if (openDropdown === type) {
      setOpenDropdown(null);
    } else {
      setTempSubjects(selectedSubjects);
      setTempPyqSubject(pyqSubject);
      setTempPyqYear(pyqYear);
      setTempPyqSession(pyqSession);
      setOpenDropdown(type);
    }
  };

  const handleApply = () => {
    if (activeTab === 'notes') {
      setSelectedSubjects(tempSubjects);
    } else if (activeTab === 'pyqs') {
      setPyqSubject(tempPyqSubject);
      setPyqYear(tempPyqYear);
      setPyqSession(tempPyqSession);
    }
    setOpenDropdown(null);
  };

  const tabs = [
    { id: "notes", label: "Notes" },
    { id: "pyqs", label: "Previous Year Papers" },
    { id: "study-groups", label: "Study Groups" },
    { id: "news-updates", label: "News & Updates" },
    { id: "important-dates", label: "Important Dates" }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <NavBar />
      <main className="pt-16">
        <ExamPrepHeader examName="JEE" examPath="/exam-preparation/jee" currentTab={activeTab} />

        {/* CONSTANT TWO-ROW STICKY FILTER SYSTEM */}
        <div ref={filterRef} className={`w-full z-[60] transition-shadow duration-300 ${isSticky ? 'fixed top-16 bg-white border-b shadow-none' : 'relative'}`}>
          
          {/* ROW 1: MAIN SECTIONS (Indigo) */}
          <div className="bg-[#f4f2ff]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-8 pt-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`pb-2 text-[14px] md:text-[15px] cursor-pointer whitespace-nowrap transition-all font-sans ${
                      activeTab === tab.id ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2: SUB-FILTERS (White) - Always present */}
          <div className="bg-white border-b border-[#f3f4f6] min-h-[56px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-nowrap items-center gap-3 py-3 font-sans overflow-x-auto no-scrollbar">
                {activeTab === 'notes' && (
                  <>
                    <div className="relative dropdown-container">
                      <button 
                        onClick={() => toggleDropdown('subject')}
                        className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${selectedSubjects.length > 0 ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}
                      >
                        Subjects {selectedSubjects.length > 0 ? `(${selectedSubjects.length})` : ''} 
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'subject' ? 'rotate-180' : ''} ${selectedSubjects.length > 0 ? 'border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                      </button>
                      {openDropdown === 'subject' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[200px] p-3">
                          <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                            {availableSubjects.map(sub => (
                              <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                                <input 
                                  type="checkbox" 
                                  checked={tempSubjects.includes(sub)} 
                                  onChange={(e) => setTempSubjects(prev => e.target.checked ? [...prev, sub] : prev.filter(i => i !== sub))} 
                                  className="accent-[#6366f1]" 
                                /> {sub}
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded">Cancel</button>
                            <button onClick={handleApply} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => setActiveClass("class11")} className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all whitespace-nowrap ${activeClass === "class11" ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}>Class 11</button>
                    <button onClick={() => setActiveClass("class12")} className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all whitespace-nowrap ${activeClass === "class12" ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}>Class 12</button>
                  </>
                )}
                {activeTab === 'pyqs' && (
                  <>
                    <div className="relative dropdown-container">
                      <button onClick={() => toggleDropdown('subject')} className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${pyqSubject ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}>
                        Subject {pyqSubject ? `: ${pyqSubject}` : ''} 
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'subject' ? 'rotate-180' : ''} ${pyqSubject ? 'border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                      </button>
                      {openDropdown === 'subject' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[180px] p-3">
                          <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                            {availablePyqSubjects.map(sub => (
                              <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                                <input 
                                  type="radio" 
                                  name="pyqSubject"
                                  checked={tempPyqSubject === sub} 
                                  onChange={() => setTempPyqSubject(sub)} 
                                  className="accent-[#6366f1]" 
                                /> {sub}
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded">Cancel</button>
                            <button onClick={handleApply} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative dropdown-container">
                      <button onClick={() => toggleDropdown('year')} className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${pyqYear ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}>
                        Year {pyqYear ? `: ${pyqYear}` : ''} 
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'year' ? 'rotate-180' : ''} ${pyqYear ? 'border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                      </button>
                      {openDropdown === 'year' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[140px] p-3">
                          <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                            {availableYears.map(year => (
                              <label key={year} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                                <input 
                                  type="radio" 
                                  name="pyqYear"
                                  checked={tempPyqYear === year} 
                                  onChange={() => setTempPyqYear(year)} 
                                  className="accent-[#6366f1]" 
                                /> {year}
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded">Cancel</button>
                            <button onClick={handleApply} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="relative dropdown-container">
                      <button onClick={() => toggleDropdown('session')} className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${pyqSession ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}>
                        Session {pyqSession ? `: ${pyqSession}` : ''} 
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'session' ? 'rotate-180' : ''} ${pyqSession ? 'border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                      </button>
                      {openDropdown === 'session' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[140px] p-3">
                          <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                            {availableSessions.map(session => (
                              <label key={session} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                                <input 
                                  type="radio" 
                                  name="pyqSession"
                                  checked={tempPyqSession === session} 
                                  onChange={() => setTempPyqSession(session)} 
                                  className="accent-[#6366f1]" 
                                /> {session}
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded">Cancel</button>
                            <button onClick={handleApply} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {(activeTab !== 'notes' && activeTab !== 'pyqs') && (
                  <span className="text-[12px] text-gray-400 font-medium py-1.5">No sub-filters for this section</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isSticky && <div className="h-[120px]" />}

        <section className="py-8 bg-white min-h-[600px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === "notes" && <SubjectBlock subjects={selectedSubjects} selectedClass={activeClass} examType="JEE" />}
            {activeTab === "pyqs" && <JEEPYQTab subject={pyqSubject} year={pyqYear} session={pyqSession} />}
            {activeTab === "study-groups" && <OptimizedAuthWrapper><StudyGroupsTab examType="JEE" /></OptimizedAuthWrapper>}
            {activeTab === "news-updates" && <NewsUpdatesTab examType="JEE" />}
            {activeTab === "important-dates" && <ImportantDatesTab examType="JEE" />}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default JEEPrep;
