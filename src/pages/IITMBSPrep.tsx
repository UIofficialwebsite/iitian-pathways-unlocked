import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { getTabFromUrl } from "@/utils/urlHelpers";
import { X, ChevronDown, Filter } from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import { ShareButton } from "@/components/ShareButton";

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses } = useBackend();
  const isMobile = useIsMobile();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'branch' | 'level' | 'year' | 'examType' | null>(null);

  // Derive active tab from URL
  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));
  
  // Multi-select filters (Defaults)
  const [selectedBranches, setSelectedBranches] = useState<string[]>(["Data Science"]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(["Foundation"]);
  
  // Tab-specific filters
  const [pyqYear, setPyqYear] = useState<string | null>(null);
  const [examType, setExamType] = useState<string | null>(null);

  // Temporary states for Dropdown checkbox interaction
  const [tempBranches, setTempBranches] = useState<string[]>(["Data Science"]);
  const [tempLevels, setTempLevels] = useState<string[]>(["Foundation"]);

  // Dynamically filter available options based on backend course data
  const iitmCourses = useMemo(() => 
    courses.filter(c => c.exam_category === 'IITM BS' || c.exam_category === 'IITM_BS')
  , [courses]);

  const availableBranches = useMemo(() => 
    Array.from(new Set(iitmCourses.map(c => c.branch))).filter(Boolean).sort() as string[]
  , [iitmCourses]);

  const availableLevels = useMemo(() => 
    Array.from(new Set(iitmCourses.map(c => c.level))).filter(Boolean).sort() as string[]
  , [iitmCourses]);

  // Sticky Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      const offset = filterRef.current?.offsetTop || 0;
      setIsSticky(window.scrollY > offset - 64);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setOpenDropdown(null);
    navigate(`/exam-preparation/iitm-bs/${newTab}`, { replace: true });
  };

  const toggleDropdown = (type: any) => {
    if (openDropdown === type) {
      setOpenDropdown(null);
    } else {
      // Initialize temp state with currently applied filters when opening
      setTempBranches(selectedBranches);
      setTempLevels(selectedLevels);
      setOpenDropdown(type);
    }
  };

  const handleApplyFilters = () => {
    setSelectedBranches(tempBranches);
    setSelectedLevels(tempLevels);
    setOpenDropdown(null);
  };

  const toggleItem = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const tabs = [
    { id: "notes", label: "Notes" },
    { id: "pyqs", label: "PYQs" },
    { id: "syllabus", label: "Syllabus" },
    { id: "tools", label: "Tools" },
    { id: "courses", label: "Related Courses"},
    { id: "news", label: "News" },
    { id: "dates", label: "Important Dates" }
  ];

  const renderDropdownContent = (type: typeof openDropdown) => {
    const items = type === 'branch' ? availableBranches : availableLevels;
    const currentTemp = type === 'branch' ? tempBranches : tempLevels;
    const setter = type === 'branch' ? setTempBranches : setTempLevels;

    return (
      <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xl min-w-[220px]">
        <div className="max-h-[250px] overflow-y-auto mb-3 space-y-1 no-scrollbar">
          {items.length > 0 ? items.map(item => (
            <label key={item} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer text-xs font-medium text-gray-700">
              <input 
                type="checkbox" 
                checked={currentTemp.includes(item)} 
                onChange={() => toggleItem(item, currentTemp, setter)} 
                className="w-4 h-4 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A] accent-[#1E3A8A]" 
              /> 
              {item}
            </label>
          )) : (
            <p className="text-[10px] text-gray-400 p-2 italic text-center">No options available</p>
          )}
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <button onClick={() => setOpenDropdown(null)} className="flex-1 py-2 text-[11px] font-bold text-gray-500 hover:bg-gray-50 rounded-md">CANCEL</button>
          <button onClick={handleApplyFilters} className="flex-1 py-2 text-[11px] font-bold bg-[#1E3A8A] text-white rounded-md hover:opacity-90">APPLY</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <NavBar />
      <main className="pt-16">
        {/* Main Header with forced full-text Share button */}
        <ExamPrepHeader 
          examName="IITM BS" 
          examPath="/exam-preparation/iitm-bs" 
          currentTab={activeTab}
          rightAction={
            <ShareButton
              url={window.location.href}
              title="IITM BS Exam Preparation"
              showText={true}
              forceTextOnMobile={true} 
              className="bg-white border-gray-200 shadow-sm"
            />
          }
        />

        <div ref={filterRef} className={`w-full transition-all ${isSticky ? 'fixed top-16 bg-white border-b z-[50]' : 'relative z-[50]'}`}>
          {/* Tab Navigation */}
          <div className="bg-[#f4f2ff]">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="flex gap-8 pt-4 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`pb-3 text-[14px] font-bold whitespace-nowrap transition-all ${
                      activeTab === tab.id 
                        ? 'text-[#1E3A8A] border-b-[3px] border-[#1E3A8A]' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="bg-white border-b border-gray-100 px-4 md:px-8">
            <div className="max-w-7xl mx-auto flex flex-nowrap items-center gap-3 py-3 overflow-x-auto no-scrollbar">
              {/* Branch Selection */}
              <div className="relative shrink-0">
                <button 
                  onClick={() => toggleDropdown('branch')}
                  className={`px-4 py-2 border rounded-md text-[12px] font-bold flex items-center gap-2 transition-all ${
                    selectedBranches.length > 0 ? 'border-[#1E3A8A] text-[#1E3A8A] bg-blue-50' : 'border-gray-200 text-gray-600 bg-white'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Branch {selectedBranches.length > 0 && `(${selectedBranches.length})`}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'branch' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'branch' && !isMobile && (
                  <div className="absolute top-full left-0 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    {renderDropdownContent('branch')}
                  </div>
                )}
              </div>

              {/* Level Selection */}
              <div className="relative shrink-0">
                <button 
                  onClick={() => toggleDropdown('level')}
                  className={`px-4 py-2 border rounded-md text-[12px] font-bold flex items-center gap-2 transition-all ${
                    selectedLevels.length > 0 ? 'border-[#1E3A8A] text-[#1E3A8A] bg-blue-50' : 'border-gray-200 text-gray-600 bg-white'
                  }`}
                >
                  Level {selectedLevels.length > 0 && `(${selectedLevels.length})`}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'level' ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === 'level' && !isMobile && (
                  <div className="absolute top-full left-0 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    {renderDropdownContent('level')}
                  </div>
                )}
              </div>

              {/* Reset Control */}
              {(selectedBranches.length > 0 || selectedLevels.length > 0) && (
                <button 
                  onClick={() => { setSelectedBranches([]); setSelectedLevels([]); }}
                  className="text-[#1E3A8A] text-xs font-bold hover:underline px-2 shrink-0"
                >
                  Reset All
                </button>
              )}
            </div>
            
            {/* Mobile Dropdown (Centered Display) */}
            {isMobile && openDropdown && (
              <div className="py-2 flex justify-center border-t border-gray-50">
                {renderDropdownContent(openDropdown)}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic content rendering based on selected filters */}
        {isSticky && <div className="h-[110px]" />}

        <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-[600px]">
          {activeTab === "notes" && (
            <BranchNotesTab 
              branch={selectedBranches[0] || "Data Science"} 
              level={selectedLevels[0] || "Foundation"} 
            />
          )}
          {activeTab === "pyqs" && (
            <PYQsTab 
              branch={selectedBranches[0]} 
              level={selectedLevels[0]} 
              year={pyqYear} 
              examType={examType} 
            />
          )}
          {activeTab === "syllabus" && <SyllabusTab />}
          {activeTab === "tools" && <IITMToolsTab />}
          {activeTab === "courses" && <PaidCoursesTab />}
          {activeTab === "news" && <NewsTab />}
          {activeTab === "dates" && <ImportantDatesTab />}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IITMBSPrep;
