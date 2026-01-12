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
import { X } from "lucide-react";

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<'branch' | 'level' | 'examType' | 'year' | null>(null);

  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  
  // Filters state
  const [selectedBranch, setSelectedBranch] = useState("Data Science");
  const [selectedLevel, setSelectedLevel] = useState("Foundation");
  const [pyqYear, setPyqYear] = useState<string | null>(null);
  const [examType, setExamType] = useState<string | null>(null);
  const [tempBranch, setTempBranch] = useState("Data Science");
  const [tempLevel, setTempLevel] = useState("Foundation");
  const [tempPyqYear, setTempPyqYear] = useState<string | null>(null);
  const [tempExamType, setTempExamType] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState("cgpa-calculator");
  
  // Sort order for tabs without filters
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

  const branches = ["Data Science", "Electronic Systems"];
  const levels = ["Foundation", "Diploma", "Degree", "Qualifier"];
  const years = ["2024", "2023", "2022", "2021", "2020"];
  const examTypes = [
    { id: "quiz1", label: "Quiz 1" },
    { id: "quiz2", label: "Quiz 2" },
    { id: "endterm", label: "End Term" }
  ];
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

  const toggleDropdown = (type: 'branch' | 'level' | 'examType' | 'year') => {
    if (openDropdown === type) {
      setOpenDropdown(null);
    } else {
      setTempBranch(selectedBranch);
      setTempLevel(selectedLevel);
      setTempPyqYear(pyqYear);
      setTempExamType(examType);
      setOpenDropdown(type);
    }
  };

  const handleApplyBranch = () => {
    setSelectedBranch(tempBranch);
    setOpenDropdown(null);
  };

  const handleApplyLevel = () => {
    setSelectedLevel(tempLevel);
    setOpenDropdown(null);
  };

  const handleApplyYear = () => {
    setPyqYear(tempPyqYear);
    setOpenDropdown(null);
  };

  const handleApplyExamType = () => {
    setExamType(tempExamType);
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

        {/* ROW 2: SUB-FILTERS (White) - Separate container for dropdowns */}
          <div className="bg-white border-b border-[#f3f4f6] min-h-[56px] relative z-[100]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-nowrap items-center gap-3 py-3 font-sans overflow-x-auto no-scrollbar">
                {hasSubFilters && (
                  <>
                    {/* Branch Dropdown */}
                    <button 
                      onClick={() => toggleDropdown('branch')}
                      className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]"
                    >
                      {selectedBranch && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                      Branch
                      <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'branch' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                    </button>

                    {/* Level Dropdown (for notes, pyqs, and tools) */}
                    {(activeTab === 'notes' || activeTab === 'pyqs' || activeTab === 'tools') && (
                      <button 
                        onClick={() => toggleDropdown('level')}
                        className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]"
                      >
                        {selectedLevel && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                        Level
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'level' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                      </button>
                    )}

                    {/* Year Dropdown (only for pyqs) */}
                    {activeTab === 'pyqs' && (
                      <button 
                        onClick={() => toggleDropdown('year')}
                        className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]"
                      >
                        {pyqYear && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                        Year
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'year' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                      </button>
                    )}

                    {/* Exam Category Dropdown (only for pyqs and not qualifier level) */}
                    {activeTab === 'pyqs' && selectedLevel !== 'Qualifier' && (
                      <button 
                        onClick={() => toggleDropdown('examType')}
                        className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all dropdown-container bg-white border-[#e5e7eb] text-[#374151]"
                      >
                        {examType && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                        Exam Category
                        <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openDropdown === 'examType' ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                      </button>
                    )}

                    {/* Tools Selection Pills */}
                    {activeTab === 'tools' && tools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setSelectedTool(selectedTool === tool.id ? "" : tool.id)}
                        className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all flex items-center gap-2 bg-white border-[#e5e7eb] text-[#374151]"
                      >
                        {tool.label}
                        {selectedTool === tool.id && <X className="w-3.5 h-3.5" />}
                      </button>
                    ))}

                    {/* Reset Filters */}
                    {(selectedBranch || selectedLevel || pyqYear || examType || selectedTool) && (
                      <button 
                        onClick={() => { 
                          setSelectedBranch(""); 
                          setSelectedLevel(""); 
                          setPyqYear(null); 
                          setExamType(null); 
                          setSelectedTool(""); 
                        }}
                        className="text-[#6366f1] text-[12px] md:text-[13px] font-medium whitespace-nowrap hover:underline"
                      >
                        Reset Filters
                      </button>
                    )}
                  </>
                )}
                {/* Sort options for tabs without specific filters */}
                {(activeTab === 'news' || activeTab === 'dates' || activeTab === 'courses') && (
                  <>
                    <button 
                      onClick={() => setSortOrder('recent')}
                      className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all flex items-center gap-2 ${sortOrder === 'recent' ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}
                    >
                      Recent First
                      {sortOrder === 'recent' && <X className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => setSortOrder('oldest')}
                      className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] whitespace-nowrap transition-all flex items-center gap-2 ${sortOrder === 'oldest' ? 'bg-[#6366f1] text-white border-[#6366f1]' : 'bg-white border-[#e5e7eb] text-[#374151]'}`}
                    >
                      Oldest First
                      {sortOrder === 'oldest' && <X className="w-3.5 h-3.5" />}
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Dropdowns rendered OUTSIDE scrollable area for proper z-index */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              {openDropdown === 'branch' && (
                <div className="absolute top-0 left-4 sm:left-6 lg:left-8 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[180px] p-3 dropdown-container">
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
              {openDropdown === 'level' && (
                <div className="absolute top-0 left-[100px] sm:left-[120px] lg:left-[130px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[160px] p-3 dropdown-container">
                  <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                    {levels.map(lvl => (
                      <label key={lvl} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                        <input 
                          type="radio" 
                          name="level"
                          checked={tempLevel === lvl} 
                          onChange={() => setTempLevel(lvl)} 
                          className="accent-[#6366f1]" 
                        /> {lvl}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded">Cancel</button>
                    <button onClick={handleApplyLevel} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
                  </div>
                </div>
              )}
              {activeTab === 'pyqs' && openDropdown === 'year' && (
                <div className="absolute top-0 left-[180px] sm:left-[220px] lg:left-[240px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[140px] p-3 dropdown-container">
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
              {activeTab === 'pyqs' && openDropdown === 'examType' && (
                <div className="absolute top-0 left-[260px] sm:left-[300px] lg:left-[330px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] min-w-[150px] p-3 dropdown-container">
                  <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                    {examTypes.map(type => (
                      <label key={type.id} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                        <input 
                          type="radio" 
                          name="examType"
                          checked={tempExamType === type.id} 
                          onChange={() => setTempExamType(type.id)} 
                          className="accent-[#6366f1]" 
                        /> {type.label}
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded">Cancel</button>
                    <button onClick={handleApplyExamType} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
                  </div>
                </div>
              )}
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
            {activeTab === "news" && <NewsTab sortOrder={sortOrder} />}
            {activeTab === "dates" && <ImportantDatesTab sortOrder={sortOrder} />}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IITMBSPrep;
