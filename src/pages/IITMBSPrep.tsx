import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ExamPrepHeader from "@/components/ExamPrepHeader";
import BranchNotesTab from "@/components/iitm/BranchNotesTab";
import PYQsTab from "@/components/iitm/PYQsTab";
import NewsTab from "@/components/iitm/NewsTab";
import ImportantDatesTab from "@/components/iitm/ImportantDatesTab";
import SyllabusTab from "@/components/iitm/SyllabusTab";
import IITMToolsTab from "@/components/iitm/IITMToolsTab";
import PaidCoursesTab from "@/components/iitm/PaidCoursesTab";
import { buildExamUrl, getTabFromUrl } from "@/utils/urlHelpers";

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<'branch' | 'year' | null>(null);

  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  
  // Filters state
  const [selectedBranch, setSelectedBranch] = useState("Data Science");
  const [selectedLevel, setSelectedLevel] = useState("Foundation");
  const [pyqYear, setPyqYear] = useState<string | null>(null);
  const [examType, setExamType] = useState("quiz1");
  const [tempBranch, setTempBranch] = useState("Data Science");
  const [tempPyqYear, setTempPyqYear] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState("cgpa-calculator");

  const branches = ["Data Science", "Electronic Systems"];
  const levels = ["Foundation", "Diploma", "Degree", "Qualifier"];
  const years = ["2024", "2023", "2022", "2021", "2020"];
  const examTypes = ["quiz1", "quiz2", "endterm"];
  const tools = [
    { id: "cgpa-calculator", label: "CGPA Calculator" },
    { id: "grade-calculator", label: "Grade Calculator" },
    { id: "marks-predictor", label: "Marks Predictor" }
  ];

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

  useEffect(() => {
    const tabFromUrl = getTabFromUrl(location.pathname);
    setActiveTab(tabFromUrl);
  }, [location.pathname]);

  const updateUrl = (tab: string) => {
    const newUrl = buildExamUrl('iitm-bs', tab, {});
    navigate(newUrl, { replace: true });
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setOpenDropdown(null);
    updateUrl(newTab);
  };

  const toggleDropdown = (type: 'branch' | 'year') => {
    if (openDropdown === type) {
      setOpenDropdown(null);
    } else {
      setTempBranch(selectedBranch);
      setTempPyqYear(pyqYear);
      setOpenDropdown(type);
    }
  };

  const handleApplyBranch = () => {
    setSelectedBranch(tempBranch);
    setOpenDropdown(null);
  };

  const handleApplyYear = () => {
    setPyqYear(tempPyqYear);
    setOpenDropdown(null);
  };

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

  const tabs = [
    { id: "notes", label: "Notes" },
    { id: "pyqs", label: "PYQs" },
    { id: "syllabus", label: "Syllabus" },
    { id: "tools", label: "Tools" },
    { id: "courses", label: "✨ Courses", highlight: true },
    { id: "news", label: "News" },
    { id: "dates", label: "Important Dates" }
  ];

  // Check if current tab needs sub-filters
  const hasSubFilters = activeTab === 'notes' || activeTab === 'pyqs' || activeTab === 'syllabus' || activeTab === 'tools';

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <NavBar />
      <main className="pt-16">
        <ExamPrepHeader examName="IITM BS" examPath="/exam-preparation/iitm-bs" currentTab={activeTab} pageTitle="IITM BS Degree Preparation" />

        {/* CONSTANT TWO-ROW STICKY FILTER SYSTEM */}
        <div ref={filterRef} className={`w-full transition-shadow duration-300 ${isSticky ? 'fixed top-16 bg-white border-b shadow-none z-[9999]' : 'relative z-[9999]'}`}>
          
          {/* ROW 1: MAIN SECTIONS (Indigo) */}
          <div className="bg-[#f4f2ff]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-8 pt-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`pb-2 text-[14px] md:text-[15px] cursor-pointer whitespace-nowrap transition-all font-sans ${
                      tab.highlight && activeTab !== tab.id 
                        ? 'text-yellow-600 font-semibold' 
                        : activeTab === tab.id 
                          ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' 
                          : 'text-[#6b7280] font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        {/* ROW 2: SUB-FILTERS (White) - Always present with min height */}
          <div className="bg-white border-b border-[#f3f4f6] min-h-[56px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-nowrap items-center gap-3 py-3 font-sans overflow-x-auto no-scrollbar">
                {hasSubFilters ? (
                  <>
                    {/* Branch Dropdown */}
                    <div className="relative dropdown-container">
                      <button 
                        onClick={() => toggleDropdown('branch')}
                        className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${
                          selectedBranch ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'
                        }`}
                      >
                        {selectedBranch}
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'branch' ? 'rotate-180' : ''} ${selectedBranch ? 'border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                      </button>
                      {openDropdown === 'branch' && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[99999] min-w-[180px] p-3">
                          <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                            {branches.map(branch => (
                              <label key={branch} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                                <input 
                                  type="radio" 
                                  name="branch"
                                  checked={tempBranch === branch} 
                                  onChange={() => setTempBranch(branch)} 
                                  className="accent-[#6366f1]" 
                                /> {branch}
                              </label>
                            ))}
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded">Cancel</button>
                            <button onClick={handleApplyBranch} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Level Pills (for notes, pyqs, and tools) */}
                    {(activeTab === 'notes' || activeTab === 'pyqs' || activeTab === 'tools') && levels.map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setSelectedLevel(lvl)}
                        className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all ${
                          selectedLevel === lvl 
                            ? 'bg-[#6366f1] text-white border-[#6366f1]' 
                            : 'bg-white border-[#e5e7eb] text-[#374151]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}

                    {/* Year Dropdown (only for pyqs) */}
                    {activeTab === 'pyqs' && (
                      <div className="relative dropdown-container">
                        <button 
                          onClick={() => toggleDropdown('year')}
                          className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all ${
                            pyqYear ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'
                          }`}
                        >
                          {pyqYear || 'Year'}
                          <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'year' ? 'rotate-180' : ''} ${pyqYear ? 'border-t-white' : 'border-t-[#374151]'} border-l-transparent border-r-transparent`}></span>
                        </button>
                        {openDropdown === 'year' && (
                          <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[99999] min-w-[140px] p-3">
                            <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                              {years.map(year => (
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
                              <button onClick={handleApplyYear} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Exam Type Pills (only for pyqs and not qualifier level) */}
                    {activeTab === 'pyqs' && selectedLevel !== 'Qualifier' && examTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setExamType(type)}
                        className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all ${
                          examType === type 
                            ? 'bg-[#6366f1] text-white border-[#6366f1]' 
                            : 'bg-white border-[#e5e7eb] text-[#374151]'
                        }`}
                      >
                        {type === 'quiz1' ? 'Quiz 1' : type === 'quiz2' ? 'Quiz 2' : 'End Term'}
                      </button>
                    ))}

                    {/* Tools Selection Pills */}
                    {activeTab === 'tools' && tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all ${
                          selectedTool === tool.id 
                            ? 'bg-[#6366f1] text-white border-[#6366f1]' 
                            : 'bg-white border-[#e5e7eb] text-[#374151]'
                        }`}
                      >
                        {tool.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <span className="text-[12px] text-gray-400 font-medium py-1.5">No sub-filters for this section</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {isSticky && <div className="h-[120px]" />}

        <section className="py-8 bg-white min-h-[600px] relative z-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === "notes" && (
              <BranchNotesTab 
                branch={selectedBranch}
                level={selectedLevel}
              />
            )}
            {activeTab === "pyqs" && (
              <PYQsTab 
                branch={selectedBranch}
                level={selectedLevel}
                year={pyqYear}
                examType={examType}
              />
            )}
            {activeTab === "syllabus" && (
              <SyllabusTab 
                branch={selectedBranch}
              />
            )}
            {activeTab === "tools" && <IITMToolsTab selectedTool={selectedTool} branch={selectedBranch} level={selectedLevel} />}
            {activeTab === "courses" && <PaidCoursesTab />}
            {activeTab === "news" && <NewsTab />}
            {activeTab === "dates" && <ImportantDatesTab />}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IITMBSPrep;
