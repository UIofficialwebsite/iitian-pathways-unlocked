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
import { getTabFromUrl, buildExamUrl } from "@/utils/urlHelpers";
import { X, ChevronDown } from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";

/**
 * Custom Filled Arrow Component
 */
const FilledArrow = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    width="8" 
    height="6" 
    viewBox="0 0 8 6" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
    <path d="M4 6L0.535898 0L7.4641 0L4 6Z" fill="#374151" />
  </svg>
);

const IITMBSPrep = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, pyqs } = useBackend();
  
  const filterRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  
  // Tab State
  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));

  // --- ISOLATED STATES PER TAB (Don't pass filters to different tabs) ---
  
  // PYQ Tab State
  const [pyqBranch, setPyqBranch] = useState("Data Science");
  const [pyqLevel, setPyqLevel] = useState("Foundation");
  const [pyqYear, setPyqYear] = useState<string | null>(null);
  const [examType, setExamType] = useState<string | null>(null);
  const [pyqSubject, setPyqSubject] = useState<string | null>(null);

  // Notes Tab State
  const [notesBranch, setNotesBranch] = useState("Data Science");
  const [notesLevel, setNotesLevel] = useState("Foundation");
  const [selectedNotesSubjects, setSelectedNotesSubjects] = useState<string[]>([]);
  const [availableNotesSubjects, setAvailableNotesSubjects] = useState<string[]>([]);

  // Courses Tab State
  const [courseBranch, setCourseBranch] = useState("Data Science");
  const [courseLevel, setCourseLevel] = useState("Foundation"); // Courses usually have level context too
  const [selectedCourseLevels, setSelectedCourseLevels] = useState<string[]>([]);
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState<string[]>([]);
  const [coursePriceRange, setCoursePriceRange] = useState<string | null>(null);

  // Tools/Syllabus State (Defaults)
  const [toolsBranch, setToolsBranch] = useState("Data Science");
  const [toolsLevel, setToolsLevel] = useState("Foundation");
  const [selectedTool, setSelectedTool] = useState("cgpa-calculator");

  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

  // --- DROPDOWN POSITIONING LOGIC (Z-Index Fix) ---
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const activeDropdownButtonRef = useRef<HTMLButtonElement | null>(null);

  // --- DYNAMIC DATA DERIVATION ---
  
  // Use the CURRENT TAB'S branch/level for filtering logic
  const activeBranch = activeTab === 'pyqs' ? pyqBranch : activeTab === 'notes' ? notesBranch : activeTab === 'courses' ? courseBranch : toolsBranch;
  const activeLevel = activeTab === 'pyqs' ? pyqLevel : activeTab === 'notes' ? notesLevel : activeTab === 'courses' ? courseLevel : toolsLevel;

  const branchSlug = useMemo(() => activeBranch.toLowerCase().replace(/\s+/g, '-'), [activeBranch]);
  const levelSlug = useMemo(() => activeLevel.toLowerCase(), [activeLevel]);

  // Derive PYQ options
  const currentProgramPyqs = useMemo(() => 
    pyqs.filter(p => p.branch === branchSlug && p.level === levelSlug)
  , [pyqs, branchSlug, levelSlug]);

  const dynamicYears = useMemo(() => 
    Array.from(new Set(currentProgramPyqs.map(p => p.year?.toString()).filter(Boolean))).sort((a, b) => Number(b) - Number(a))
  , [currentProgramPyqs]);

  const dynamicExamTypes = useMemo(() => 
    Array.from(new Set(currentProgramPyqs.map(p => p.exam_type).filter(Boolean))).sort()
  , [currentProgramPyqs]);

  const dynamicPyqSubjects = useMemo(() => 
    Array.from(new Set(currentProgramPyqs.map(p => p.subject).filter(Boolean))).sort()
  , [currentProgramPyqs]);

  // Derive Course options
  const iitmCourses = useMemo(() => 
    courses.filter(c => c.exam_category === 'IITM BS' || c.exam_category === 'IITM_BS')
  , [courses]);

  const branches = useMemo(() => Array.from(new Set(iitmCourses.map(c => c.branch))).filter(Boolean).sort() as string[], [iitmCourses]);
  const levels = useMemo(() => Array.from(new Set(iitmCourses.map(c => c.level))).filter(Boolean).sort() as string[], [iitmCourses]);

  const availableCourseLevels = useMemo(() => 
    Array.from(new Set(iitmCourses.filter(c => c.branch === courseBranch).map(c => c.level))).filter(Boolean).sort() as string[]
  , [iitmCourses, courseBranch]);
  
  const availableCourseSubjects = useMemo(() => 
    Array.from(new Set(iitmCourses.filter(c => c.branch === courseBranch).map(c => c.subject))).filter(Boolean).sort() as string[]
  , [iitmCourses, courseBranch]);

  // --- TEMP STATES (For "Apply" Logic) ---
  // We only need temp states for the active tab context
  const [tempBranch, setTempBranch] = useState(activeBranch);
  const [tempLevel, setTempLevel] = useState(activeLevel);
  // PYQ Temps
  const [tempPyqYear, setTempPyqYear] = useState<string | null>(pyqYear);
  const [tempExamType, setTempExamType] = useState<string | null>(examType);
  const [tempPyqSubject, setTempPyqSubject] = useState<string | null>(pyqSubject);
  // Notes/Course Temps
  const [tempNotesSubjects, setTempNotesSubjects] = useState<string[]>(selectedNotesSubjects);
  const [tempCourseLevels, setTempCourseLevels] = useState<string[]>(selectedCourseLevels);
  const [tempCourseSubjects, setTempCourseSubjects] = useState<string[]>(selectedCourseSubjects);
  const [tempCoursePrice, setTempCoursePrice] = useState<string | null>(coursePriceRange);

  // Update temps when opening dropdown
  const handleOpenDropdown = (type: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX, width: rect.width });
    activeDropdownButtonRef.current = e.currentTarget;

    // Sync temps with current REAL state
    if (activeTab === 'pyqs') {
        setTempBranch(pyqBranch); setTempLevel(pyqLevel);
        setTempPyqYear(pyqYear); setTempExamType(examType); setTempPyqSubject(pyqSubject);
    } else if (activeTab === 'notes') {
        setTempBranch(notesBranch); setTempLevel(notesLevel);
        setTempNotesSubjects(selectedNotesSubjects);
    } else if (activeTab === 'courses') {
        setTempBranch(courseBranch); 
        setTempCourseLevels(selectedCourseLevels); setTempCourseSubjects(selectedCourseSubjects); setTempCoursePrice(coursePriceRange);
    } else {
        setTempBranch(toolsBranch); setTempLevel(toolsLevel);
    }
    
    setOpenDropdown(openDropdown === type ? null : type);
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (filterRef.current) setFilterOffset(filterRef.current.offsetTop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
        setOpenDropdown(null); // Close dropdown on scroll to prevent detachment
        const navbarHeight = 64;
        if (filterRef.current && filterOffset > 0) {
            setIsSticky(window.scrollY > (filterOffset - navbarHeight));
        }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filterOffset]);

  useEffect(() => {
    const tabFromUrl = getTabFromUrl(location.pathname);
    setActiveTab(tabFromUrl);
    setOpenDropdown(null);
  }, [location.pathname]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    navigate(buildExamUrl('iitm-bs', newTab, {}), { replace: true });
  };

  // --- APPLY HANDLERS (Per Tab) ---
  const applyFilters = (type: string) => {
    if (activeTab === 'pyqs') {
        if (type === 'branch') setPyqBranch(tempBranch);
        if (type === 'level') setPyqLevel(tempLevel);
        if (type === 'year') setPyqYear(tempPyqYear);
        if (type === 'examType') setExamType(tempExamType);
        if (type === 'pyqSubject') setPyqSubject(tempPyqSubject);
    } else if (activeTab === 'notes') {
        if (type === 'branch') setNotesBranch(tempBranch);
        if (type === 'level') setNotesLevel(tempLevel);
        if (type === 'notesSubject') setSelectedNotesSubjects(tempNotesSubjects);
    } else if (activeTab === 'courses') {
        if (type === 'branch') setCourseBranch(tempBranch);
        if (type === 'courseLevel') setSelectedCourseLevels(tempCourseLevels);
        if (type === 'courseSubject') setSelectedCourseSubjects(tempCourseSubjects);
        if (type === 'coursePricing') setCoursePriceRange(tempCoursePrice);
    } else {
        // Tools/Syllabus
        if (type === 'branch') setToolsBranch(tempBranch);
        if (type === 'level') setToolsLevel(tempLevel);
    }
    setOpenDropdown(null);
  };

  const resetFilters = () => {
    if (activeTab === 'pyqs') {
        setPyqYear(null); setExamType(null); setPyqSubject(null);
    }
    if (activeTab === 'notes') {
        setSelectedNotesSubjects([]);
    }
    setOpenDropdown(null);
  };

  const toggleTempItem = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  // --- BREADCRUMB ---
  const getBreadcrumbItems = () => {
    const items = [];
    const activeLabel = tabs.find(t => t.id === activeTab)?.label || activeTab;
    items.push(activeLabel);
    items.push(activeBranch); // Isolated Branch
    if (['notes', 'pyqs', 'tools'].includes(activeTab)) items.push(activeLevel); // Isolated Level
    
    if (activeTab === 'pyqs') {
      if (pyqSubject) items.push(pyqSubject);
      if (pyqYear) items.push(pyqYear);
      if (examType) items.push(examType.toUpperCase());
    } else if (activeTab === 'notes') {
      selectedNotesSubjects.forEach(s => items.push(s));
    }
    return items;
  };

  const tabs = [
    { id: "notes", label: "Notes" }, { id: "pyqs", label: "PYQs" },
    { id: "syllabus", label: "Syllabus" }, { id: "tools", label: "Tools" },
    { id: "courses", label: "Related Courses"}, { id: "news", label: "News" },
    { id: "dates", label: "Important Dates" }
  ];

  // --- DROPDOWN RENDERER (Fixed Position) ---
  const renderDropdownContent = () => {
    if (!openDropdown) return null;
    
    const type = openDropdown;
    let items: string[] = [];
    let isCheckbox = false;
    let currentSelection: any = null;
    let setSelection: any = null;

    // Logic to determine items and state setter based on Active Tab & Dropdown Type
    if (type === 'branch') { items = branches; currentSelection = tempBranch; setSelection = setTempBranch; }
    else if (type === 'level') { items = levels; currentSelection = tempLevel; setSelection = setTempLevel; }
    else if (type === 'year') { items = dynamicYears; currentSelection = tempPyqYear; setSelection = setTempPyqYear; }
    else if (type === 'examType') { items = dynamicExamTypes; currentSelection = tempExamType; setSelection = setTempExamType; }
    else if (type === 'pyqSubject') { items = dynamicPyqSubjects; currentSelection = tempPyqSubject; setSelection = setTempPyqSubject; }
    else if (type === 'notesSubject') { items = availableNotesSubjects; isCheckbox = true; currentSelection = tempNotesSubjects; setSelection = setTempNotesSubjects; }
    else if (type === 'courseLevel') { items = availableCourseLevels; isCheckbox = true; currentSelection = tempCourseLevels; setSelection = setTempCourseLevels; }
    else if (type === 'courseSubject') { items = availableCourseSubjects; isCheckbox = true; currentSelection = tempCourseSubjects; setSelection = setTempCourseSubjects; }
    else if (type === 'coursePricing') { items = ['free', 'paid']; currentSelection = tempCoursePrice; setSelection = setTempCoursePrice; }

    return (
      // FIXED POSITIONING CONTAINER - ESCAPES SCROLL CLIPPING
      <div 
        className="fixed bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] p-3 flex flex-col"
        style={{ top: dropdownPos.top, left: dropdownPos.left, minWidth: Math.max(180, dropdownPos.width) }}
      >
        <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
          {items.map(item => (
            <label key={item} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans font-medium">
              <input 
                type={isCheckbox ? "checkbox" : "radio"} 
                checked={
                  isCheckbox 
                    ? currentSelection.includes(item)
                    : currentSelection === item
                } 
                onChange={() => {
                  if (isCheckbox) toggleTempItem(item, currentSelection, setSelection);
                  else setSelection(item);
                }} 
                className="accent-[#6366f1]" 
              /> 
              <span className={type === 'examType' ? 'uppercase' : ''}>{item}</span>
            </label>
          ))}
          {items.length === 0 && <p className="text-[10px] text-slate-400 italic p-2">No options found</p>}
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 font-bold uppercase">Cancel</button>
          <button onClick={() => applyFilters(type)} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      <NavBar />
      <main className="pt-16">
        <ExamPrepHeader examName="IITM BS" examPath="/exam-preparation/iitm-bs" currentTab={activeTab} pageTitle="IITM BS Degree Preparation" />

        {/* Sticky Filter Bar */}
        <div ref={filterRef} className={`w-full transition-shadow duration-300 z-[5000] ${isSticky ? 'fixed top-16 bg-white border-b shadow-none' : 'relative'}`}>
          <div className="bg-[#f4f2ff]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 pt-4 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`pb-2 text-[14px] md:text-[15px] cursor-pointer whitespace-nowrap transition-all font-sans ${activeTab === tab.id ? 'text-[#6366f1] border-b-[3px] border-[#6366f1] font-semibold' : 'text-[#6b7280] font-medium'}`}>{tab.label}</button>
              ))}
            </div>
          </div>

          <div className="bg-white border-b border-[#f3f4f6] min-h-[56px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center">
              {/* SCROLLABLE FILTER ROW */}
              <div className="flex flex-nowrap gap-3 items-center whitespace-nowrap overflow-x-auto no-scrollbar w-full pb-1">
                
                {/* 1. Branch & Level (Always First, but Independent State) */}
                <button onClick={(e) => handleOpenDropdown('branch', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151] flex-shrink-0">
                  Branch <FilledArrow isOpen={openDropdown === 'branch'} />
                </button>
                {activeTab !== 'courses' && (
                    <button onClick={(e) => handleOpenDropdown('level', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151] flex-shrink-0">
                    Level <FilledArrow isOpen={openDropdown === 'level'} />
                    </button>
                )}

                {/* 2. Tab Specific Filters */}
                {activeTab === 'notes' && (
                  <div className="flex items-center gap-3">
                    <button onClick={(e) => handleOpenDropdown('notesSubject', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151] flex-shrink-0">
                      {selectedNotesSubjects.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-[#6366f1] text-white text-[10px] rounded-full mr-2">{selectedNotesSubjects.length}</span>}
                      Subjects <FilledArrow isOpen={openDropdown === 'notesSubject'} />
                    </button>
                    {selectedNotesSubjects.map(sub => (
                      <div key={sub} className="px-3 py-1 border border-black rounded-full text-[12px] flex items-center gap-2 bg-white font-medium flex-shrink-0">
                        {sub} <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSelectedNotesSubjects(prev => prev.filter(s => s !== sub))} />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'courses' && (
                  <>
                    <button onClick={(e) => handleOpenDropdown('courseLevel', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151] flex-shrink-0">
                        Level <FilledArrow isOpen={openDropdown === 'courseLevel'} />
                    </button>
                    <button onClick={(e) => handleOpenDropdown('courseSubject', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151] flex-shrink-0">
                        Subject <FilledArrow isOpen={openDropdown === 'courseSubject'} />
                    </button>
                    <button onClick={(e) => handleOpenDropdown('coursePricing', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151] flex-shrink-0">
                        Pricing <FilledArrow isOpen={openDropdown === 'coursePricing'} />
                    </button>
                  </>
                )}

                {/* 3. PYQ Dropdowns (Last) */}
                {activeTab === 'pyqs' && (
                  <>
                    <button onClick={(e) => handleOpenDropdown('pyqSubject', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151] flex-shrink-0">
                      Subjects <FilledArrow isOpen={openDropdown === 'pyqSubject'} />
                    </button>
                    <button onClick={(e) => handleOpenDropdown('year', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151] flex-shrink-0">
                      Year <FilledArrow isOpen={openDropdown === 'year'} />
                    </button>
                    <button onClick={(e) => handleOpenDropdown('examType', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151] flex-shrink-0">
                      Exam <FilledArrow isOpen={openDropdown === 'examType'} />
                    </button>
                  </>
                )}

                {/* 4. Reset Link (At End) */}
                {(activeTab === 'pyqs' || activeTab === 'notes') && (
                  <button onClick={resetFilters} className="text-[#6366f1] text-[12px] font-medium hover:underline px-2 transition-all ml-auto flex-shrink-0">
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Portal-like Dropdown Rendering (Outside the scroll container) */}
        {openDropdown && renderDropdownContent()}

        {isSticky && <div className="h-[120px]" />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-[#fcfcfc]">
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap gap-1">
              {getBreadcrumbItems().map((label, index) => (
                <React.Fragment key={`${label}-${index}`}>
                  <BreadcrumbItem><BreadcrumbPage className="capitalize font-medium text-[#6366f1] font-sans text-[13px]">{label}</BreadcrumbPage></BreadcrumbItem>
                  {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="py-8 bg-white min-h-[600px] relative z-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeTab === "pyqs" && <PYQsTab branch={pyqBranch} level={pyqLevel} year={pyqYear} examType={examType} subject={pyqSubject} />}
            {activeTab === "notes" && <BranchNotesTab branch={notesBranch} level={notesLevel} selectedSubjects={selectedNotesSubjects} onSubjectsLoaded={setAvailableNotesSubjects} />}
            {activeTab === "syllabus" && <SyllabusTab branch={toolsBranch} />}
            {activeTab === "tools" && <IITMToolsTab selectedTool={selectedTool} branch={toolsBranch} level={toolsLevel} />}
            {activeTab === "courses" && <PaidCoursesTab branch={courseBranch} levels={selectedCourseLevels} subjects={selectedCourseSubjects} priceRange={coursePriceRange} />}
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
