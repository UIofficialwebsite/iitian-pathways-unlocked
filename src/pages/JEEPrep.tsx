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
  const { notes, contentLoading } = useBackend();
  const navigate = useNavigate();
  const location = useLocation();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'subject' | null>(null);

  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  const [activeClass, setActiveClass] = useState("class11");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [tempSubjects, setTempSubjects] = useState<string[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const offset = filterRef.current?.offsetTop || 0;
      setIsSticky(window.scrollY > offset - 64);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const availableSubjects = useMemo(() => {
    const jeeNotes = notes.filter(note => note.exam_type === 'JEE');
    const preferredOrder = ["Physics", "Mathematics", "Physical Chemistry", "Inorganic Chemistry", "Organic Chemistry"];
    const subjectSet = new Set(jeeNotes.map(note => note.subject).filter(Boolean) as string[]);
    const sorted = preferredOrder.filter(s => subjectSet.has(s));
    Array.from(subjectSet).forEach(s => { if (!sorted.includes(s)) sorted.push(s); });
    return sorted;
  }, [notes]);

  useEffect(() => {
    if (!contentLoading && availableSubjects.length > 0 && selectedSubjects.length === 0) {
      setSelectedSubjects([availableSubjects[0]]);
      setTempSubjects([availableSubjects[0]]);
    }
  }, [contentLoading, availableSubjects]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setOpenDropdown(null);
    const firstSub = selectedSubjects[0] || availableSubjects[0];
    navigate(buildExamUrl('jee', newTab, { subject: firstSub, class: activeClass }), { replace: true });
  };

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

          {/* ROW 2: SUB-FILTERS (White) - Always present, internal content changes */}
          <div className="bg-white border-b border-[#f3f4f6] min-h-[56px] flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex flex-nowrap items-center gap-3 py-3 overflow-visible no-scrollbar">
                {activeTab === 'notes' ? (
                  <>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => setOpenDropdown(openDropdown === 'subject' ? null : 'subject')}
                        className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${selectedSubjects.length > 0 ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}
                      >
                        Subjects {selectedSubjects.length > 0 ? `(${selectedSubjects.length})` : ''} 
                        <ChevronDown className={`ml-2 h-3 w-3 ${openDropdown === 'subject' ? 'rotate-180' : ''}`} />
                      </button>
                      {openDropdown === 'subject' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[70] min-w-[200px] p-3">
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
                            <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] font-semibold text-slate-500">Cancel</button>
                            <button onClick={() => { setSelectedSubjects(tempSubjects); setOpenDropdown(null); }} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded">Apply</button>
                          </div>
                        </div>
                      )}
                    </div>
                    {["class11", "class12"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setActiveClass(c)}
                        className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all ${activeClass === c ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}
                      >
                        {c === "class11" ? "Class 11" : "Class 12"}
                      </button>
                    ))}
                  </>
                ) : activeTab === 'pyqs' ? (
                  /* Trigger internal filters of JEEPYQTab but rendered in this exact Row 2 position */
                  <div id="pyq-filter-portal" className="flex items-center gap-3"></div>
                ) : (
                  <span className="text-[12px] text-gray-400 font-medium">No sub-filters for this section</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isSticky && <div className="h-[120px]" />}

        <section className="py-8 bg-white min-h-[600px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === "notes" && <SubjectBlock subjects={selectedSubjects} selectedClass={activeClass} examType="JEE" />}
            {activeTab === "pyqs" && <JEEPYQTab renderInRow2={true} />}
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
