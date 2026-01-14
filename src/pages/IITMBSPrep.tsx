import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ExamPrepHeader from "@/components/ExamPrepHeader";
import BranchNotesTab from "@/components/iitm/BranchNotesTab";
import PYQsTab from "@/components/iitm/PYQsTab";
import NewsTab from "@/components/iitm/NewsTab";
import ImportantDatesTab from "@/components/iitm/ImportantDatesTab";
import SyllabusTab, { SYLLABUS_DATA, CourseLevel } from "@/components/iitm/SyllabusTab";
import IITMToolsTab from "@/components/iitm/IITMToolsTab";
import PaidCoursesTab from "@/components/iitm/PaidCoursesTab";
import { buildExamUrl, getTabFromUrl } from "@/utils/urlHelpers";
import { X, Home, ChevronRight, RotateCcw } from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isSticky, setIsSticky] = useState(false);
  const [filterOffset, setFilterOffset] = useState(0);
  
  // Tab State
  const [activeTab, setActiveTab] = useState(() => getTabFromUrl(location.pathname));

  // --- ISOLATED STATES PER TAB ---
  
  // PYQ Tab State
  const [pyqBranch, setPyqBranch] = useState("Data Science");
  const [pyqLevel, setPyqLevel] = useState("Foundation");
  const [pyqYears, setPyqYears] = useState<string[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [pyqSubjects, setPyqSubjects] = useState<string[]>([]);

  // Notes Tab State
  const [notesBranch, setNotesBranch] = useState("Data Science");
  const [notesLevel, setNotesLevel] = useState("Foundation");
  const [selectedNotesSubjects, setSelectedNotesSubjects] = useState<string[]>([]);
  const [availableNotesSubjects, setAvailableNotesSubjects] = useState<string[]>([]);

  // Courses Tab State
  const [courseBranch, setCourseBranch] = useState("Data Science");
  const [courseLevel, setCourseLevel] = useState("Foundation");
  const [selectedCourseLevels, setSelectedCourseLevels] = useState<string[]>([]);
  const [selectedCourseSubjects, setSelectedCourseSubjects] = useState<string[]>([]);
  const [coursePriceRange, setCoursePriceRange] = useState<string | null>(null);

  // Syllabus Tab State
  const [syllabusLevel, setSyllabusLevel] = useState<CourseLevel>("Qualifier");
  const [syllabusCategory, setSyllabusCategory] = useState<string>("Common");
  const [syllabusSubjectId, setSyllabusSubjectId] = useState<string>("");

  // Tools State
  const [toolsBranch, setToolsBranch] = useState("Data Science");
  const [toolsLevel, setToolsLevel] = useState("Foundation");
  const [selectedTool, setSelectedTool] = useState("cgpa-calculator");

  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

  // --- DROPDOWN POSITIONING LOGIC ---
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left?: number; right?: number; width: number }>({ top: 0, left: 0, width: 0 });

  // --- DYNAMIC DATA DERIVATION ---
  
  // Active Context
  const activeBranch = activeTab === 'pyqs' ? pyqBranch : activeTab === 'notes' ? notesBranch : activeTab === 'courses' ? courseBranch : activeTab === 'syllabus' ? syllabusCategory : toolsBranch;
  const activeLevel = activeTab === 'pyqs' ? pyqLevel : activeTab === 'notes' ? notesLevel : activeTab === 'courses' ? courseLevel : activeTab === 'syllabus' ? syllabusLevel : toolsLevel;

  const branchSlug = useMemo(() => activeBranch.toLowerCase().replace(/\s+/g, '-'), [activeBranch]);
  const levelSlug = useMemo(() => activeLevel.toLowerCase(), [activeLevel]);

  // PYQ Options
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

  // Syllabus Options
  const availableSyllabusCourses = useMemo(() => {
    return SYLLABUS_DATA.filter((course) => {
      if (course.level !== syllabusLevel) return false;
      if (syllabusLevel === "Diploma" && course.category !== syllabusCategory) return false;
      if (syllabusLevel === "Degree" && course.category !== syllabusCategory) return false;
      return true;
    });
  }, [syllabusLevel, syllabusCategory]);

  const syllabusSubjectOptions = useMemo(() => availableSyllabusCourses.map(c => ({ id: c.id, name: c.name })), [availableSyllabusCourses]);

  // Effect: Auto-select first syllabus subject on filter change
  useEffect(() => {
    if (activeTab === 'syllabus') {
      if (availableSyllabusCourses.length > 0) {
        // Only reset if current selection is invalid
        const exists = availableSyllabusCourses.find(c => c.id === syllabusSubjectId);
        if (!exists) {
          setSyllabusSubjectId(availableSyllabusCourses[0].id);
        }
      } else {
        setSyllabusSubjectId("");
      }
    }
  }, [availableSyllabusCourses, activeTab]);

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
  const [tempBranch, setTempBranch] = useState(activeBranch);
  const [tempLevel, setTempLevel] = useState(activeLevel);
  // Syllabus Temps
  const [tempSyllabusSubjectId, setTempSyllabusSubjectId] = useState("");
  // PYQ Temps
  const [tempPyqYears, setTempPyqYears] = useState<string[]>([]);
  const [tempExamTypes, setTempExamTypes] = useState<string[]>([]);
  const [tempPyqSubjects, setTempPyqSubjects] = useState<string[]>([]);
  // Notes/Course Temps
  const [tempNotesSubjects, setTempNotesSubjects] = useState<string[]>([]);
  const [tempCourseLevels, setTempCourseLevels] = useState<string[]>([]);
  const [tempCourseSubjects, setTempCourseSubjects] = useState<string[]>([]);
  const [tempCoursePrice, setTempCoursePrice] = useState<string | null>(null);

  const handleOpenDropdown = (type: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const spaceOnRight = viewportWidth - rect.left;
    const minDropdownWidth = 220; 
    const alignRight = spaceOnRight < minDropdownWidth;

    if (alignRight) {
        setDropdownPos({ top: rect.bottom + 8, right: viewportWidth - rect.right, width: rect.width });
    } else {
        setDropdownPos({ top: rect.bottom + 8, left: rect.left, width: rect.width });
    }

    if (activeTab === 'pyqs') {
        setTempBranch(pyqBranch); setTempLevel(pyqLevel);
        setTempPyqYears(pyqYears); setTempExamTypes(examTypes); setTempPyqSubjects(pyqSubjects);
    } else if (activeTab === 'notes') {
        setTempBranch(notesBranch); setTempLevel(notesLevel);
        setTempNotesSubjects(selectedNotesSubjects);
    } else if (activeTab === 'syllabus') {
        setTempLevel(syllabusLevel); setTempBranch(syllabusCategory); setTempSyllabusSubjectId(syllabusSubjectId);
    } else if (activeTab === 'courses') {
        setTempBranch(courseBranch); 
        setTempCourseLevels(selectedCourseLevels); setTempCourseSubjects(selectedCourseSubjects); setTempCoursePrice(coursePriceRange);
    } else {
        setTempBranch(toolsBranch); setTempLevel(toolsLevel);
    }
    
    setOpenDropdown(openDropdown === type ? null : type);
  };

  useEffect(() => {
    setPyqYears([]); setExamTypes([]); setPyqSubjects([]);
    setSelectedNotesSubjects([]);
  }, [pyqLevel, notesLevel]);

  // Handle Level Change for Syllabus (Reset Category)
  const handleSyllabusLevelChange = (newLevel: CourseLevel) => {
    setSyllabusLevel(newLevel);
    if (newLevel === "Diploma") setSyllabusCategory("Programming");
    else if (newLevel === "Degree") setSyllabusCategory("Core");
    else setSyllabusCategory("Common");
  };

  useEffect(() => {
    if (filterRef.current) setFilterOffset(filterRef.current.offsetTop);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
        setOpenDropdown(null);
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

  const applyFilters = (type: string) => {
    if (activeTab === 'pyqs') {
        if (type === 'branch') setPyqBranch(tempBranch);
        if (type === 'level') setPyqLevel(tempLevel);
        if (type === 'year') setPyqYears(tempPyqYears);
        if (type === 'examType') setExamTypes(tempExamTypes);
        if (type === 'pyqSubject') setPyqSubjects(tempPyqSubjects);
    } else if (activeTab === 'notes') {
        if (type === 'branch') setNotesBranch(tempBranch);
        if (type === 'level') setNotesLevel(tempLevel);
        if (type === 'notesSubject') setSelectedNotesSubjects(tempNotesSubjects);
    } else if (activeTab === 'syllabus') {
        if (type === 'level') handleSyllabusLevelChange(tempLevel as CourseLevel);
        if (type === 'category') setSyllabusCategory(tempBranch); // Using tempBranch state for category to reuse logic
        if (type === 'subject') setSyllabusSubjectId(tempSyllabusSubjectId);
    } else if (activeTab === 'courses') {
        if (type === 'branch') setCourseBranch(tempBranch);
        if (type === 'courseLevel') setSelectedCourseLevels(tempCourseLevels);
        if (type === 'courseSubject') setSelectedCourseSubjects(tempCourseSubjects);
        if (type === 'coursePricing') setCoursePriceRange(tempCoursePrice);
    } else {
        if (type === 'branch') setToolsBranch(tempBranch);
        if (type === 'level') setToolsLevel(tempLevel);
    }
    setOpenDropdown(null);
  };

  const resetFilters = () => {
    if (activeTab === 'pyqs') {
        setPyqYears([]); setExamTypes([]); setPyqSubjects([]);
    }
    if (activeTab === 'notes') {
        setSelectedNotesSubjects([]);
    }
    setOpenDropdown(null);
  };

  const toggleTempItem = (item: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => {
        const current = Array.isArray(prev) ? prev : [];
        return current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    });
  };

  const getBreadcrumbItems = () => {
    const items = [];
    const activeLabel = tabs.find(t => t.id === activeTab)?.label || activeTab;
    items.push(activeLabel);
    
    if (activeTab === 'syllabus') {
        items.push(syllabusLevel);
        if (syllabusCategory !== 'Common') items.push(syllabusCategory);
    } else {
        items.push(activeBranch); 
        if (['notes', 'pyqs', 'tools'].includes(activeTab)) items.push(activeLevel); 
    }
    
    if (activeTab === 'pyqs') {
      if (pyqSubjects.length > 0) items.push(`${pyqSubjects.length} Subjects`);
      if (pyqYears.length > 0) items.push(`${pyqYears.length} Years`);
      if (examTypes.length > 0) items.push(`${examTypes.length} Exams`);
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

  const renderDropdownContent = () => {
    if (!openDropdown) return null;
    
    const type = openDropdown;
    let items: any[] = [];
    let isCheckbox = true; 
    let currentSelection: any = null;
    let setSelection: any = null;

    if (type === 'branch') { items = branches; isCheckbox = false; currentSelection = tempBranch; setSelection = setTempBranch; }
    else if (type === 'level') { 
        items = activeTab === 'syllabus' ? ["Qualifier", "Foundation", "Diploma", "Degree"] : levels; 
        isCheckbox = false; currentSelection = tempLevel; setSelection = setTempLevel; 
    }
    else if (type === 'category') { // Syllabus Category/Branch
        items = syllabusLevel === 'Diploma' ? ['Programming', 'Data Science'] : ['Core', 'Elective'];
        isCheckbox = false; currentSelection = tempBranch; setSelection = setTempBranch; // reusing tempBranch
    }
    else if (type === 'subject') { // Syllabus Subject
        items = syllabusSubjectOptions; // Objects {id, name}
        isCheckbox = false; currentSelection = tempSyllabusSubjectId; setSelection = setTempSyllabusSubjectId;
    }
    else if (type === 'year') { items = dynamicYears; currentSelection = tempPyqYears; setSelection = setTempPyqYears; }
    else if (type === 'examType') { items = dynamicExamTypes; currentSelection = tempExamTypes; setSelection = setTempExamTypes; }
    else if (type === 'pyqSubject') { items = dynamicPyqSubjects; currentSelection = tempPyqSubjects; setSelection = setTempPyqSubjects; }
    else if (type === 'notesSubject') { items = availableNotesSubjects; currentSelection = tempNotesSubjects; setSelection = setTempNotesSubjects; }
    else if (type === 'courseLevel') { items = availableCourseLevels; currentSelection = tempCourseLevels; setSelection = setTempCourseLevels; }
    else if (type === 'courseSubject') { items = availableCourseSubjects; currentSelection = tempCourseSubjects; setSelection = setTempCourseSubjects; }
    else if (type === 'coursePricing') { items = ['free', 'paid']; isCheckbox = false; currentSelection = tempCoursePrice; setSelection = setTempCoursePrice; }

    const selectionArray = Array.isArray(currentSelection) ? currentSelection : [];

    return (
      <div 
        ref={dropdownRef} 
        className="fixed bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[99999] p-3 flex flex-col animate-in fade-in zoom-in-95 duration-100"
        style={{ 
          top: dropdownPos.top, 
          left: dropdownPos.left ?? 'auto',
          right: dropdownPos.right ?? 'auto',
          minWidth: Math.max(180, dropdownPos.width),
          maxWidth: '95vw' 
        }}
      >
        <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1 custom-scrollbar">
          {items.map(item => {
            const label = typeof item === 'object' ? item.name : item;
            const value = typeof item === 'object' ? item.id : item;
            return (
                <label key={value} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer text-xs text-gray-700 font-sans font-medium">
                <input 
                    type={isCheckbox ? "checkbox" : "radio"} 
                    checked={
                    isCheckbox 
                        ? selectionArray.includes(value)
                        : currentSelection === value
                    } 
                    onChange={() => {
                    if (isCheckbox) toggleTempItem(value, currentSelection, setSelection);
                    else setSelection(value);
                    }} 
                    className="accent-[#6366f1]" 
                /> 
                <span className={type === 'examType' ? 'uppercase' : ''}>{label}</span>
                </label>
            );
          })}
          {items.length === 0 && <p className="text-[10px] text-slate-400 italic p-2">No options found</p>}
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <button onClick={() => setOpenDropdown(null)} className="flex-1 py-1 text-[11px] text-slate-500 font-bold uppercase">Cancel</button>
          <button onClick={() => applyFilters(type)} className="flex-1 py-1 text-[11px] bg-[#6366f1] text-white rounded font-bold uppercase">Apply</button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (dropdownRef.current && !dropdownRef.current.contains(target) && !target.closest('button')) {
            setOpenDropdown(null);
        }
    };
    if (openDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

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

          <div className="bg-white border-b border-[#f3f4f6] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center">
              {/* SCROLLABLE FILTER ROW */}
              <div className="flex flex-nowrap gap-3 items-center whitespace-nowrap overflow-x-auto no-scrollbar w-full pb-1 pr-4">
                
                {/* 1. Branch & Level (Standard Tabs) */}
                {activeTab !== 'syllabus' && activeTab !== 'courses' && (
                    <div className="flex-shrink-0">
                        <button onClick={(e) => handleOpenDropdown('branch', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                        Branch <FilledArrow isOpen={openDropdown === 'branch'} />
                        </button>
                    </div>
                )}
                {activeTab !== 'syllabus' && activeTab !== 'courses' && (
                    <div className="flex-shrink-0">
                        <button onClick={(e) => handleOpenDropdown('level', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                        Level <FilledArrow isOpen={openDropdown === 'level'} />
                        </button>
                    </div>
                )}

                {/* 1.5. Syllabus Tab Filters */}
                {activeTab === 'syllabus' && (
                    <>
                        {/* Level */}
                        <div className="flex-shrink-0">
                            <button onClick={(e) => handleOpenDropdown('level', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                            Level <FilledArrow isOpen={openDropdown === 'level'} />
                            </button>
                        </div>
                        
                        {/* Branch/Category (Only for Diploma/Degree) */}
                        {(syllabusLevel === 'Diploma' || syllabusLevel === 'Degree') && (
                            <div className="flex-shrink-0">
                                <button onClick={(e) => handleOpenDropdown('category', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                                {syllabusLevel === 'Diploma' ? 'Branch' : 'Category'} <FilledArrow isOpen={openDropdown === 'category'} />
                                </button>
                            </div>
                        )}

                        {/* Subject Selector */}
                        <div className="flex-shrink-0">
                            <button onClick={(e) => handleOpenDropdown('subject', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                            Subject <FilledArrow isOpen={openDropdown === 'subject'} />
                            </button>
                        </div>
                    </>
                )}

                {/* 2. Tab Specific Filters */}
                {activeTab === 'notes' && (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button onClick={(e) => handleOpenDropdown('notesSubject', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                      {selectedNotesSubjects.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-[#6366f1] text-white text-[10px] rounded-full mr-2">{selectedNotesSubjects.length}</span>}
                      Subjects <FilledArrow isOpen={openDropdown === 'notesSubject'} />
                    </button>
                    {selectedNotesSubjects.map(sub => (
                      <div key={sub} className="px-3 py-1 border border-black rounded-full text-[12px] flex items-center gap-2 bg-white font-medium">
                        {sub} <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => setSelectedNotesSubjects(prev => prev.filter(s => s !== sub))} />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'courses' && (
                  <>
                    <div className="flex-shrink-0">
                        <button onClick={(e) => handleOpenDropdown('branch', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                        Branch <FilledArrow isOpen={openDropdown === 'branch'} />
                        </button>
                    </div>
                    <div className="flex-shrink-0">
                        <button onClick={(e) => handleOpenDropdown('courseLevel', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                            Level <FilledArrow isOpen={openDropdown === 'courseLevel'} />
                        </button>
                    </div>
                    <div className="flex-shrink-0">
                        <button onClick={(e) => handleOpenDropdown('courseSubject', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                            Subject <FilledArrow isOpen={openDropdown === 'courseSubject'} />
                        </button>
                    </div>
                    <div className="flex-shrink-0">
                        <button onClick={(e) => handleOpenDropdown('coursePricing', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                            Pricing <FilledArrow isOpen={openDropdown === 'coursePricing'} />
                        </button>
                    </div>
                  </>
                )}

                {/* 3. PYQ Dropdowns */}
                {activeTab === 'pyqs' && (
                  <>
                    <div className="flex-shrink-0">
                        <button onClick={(e) => handleOpenDropdown('pyqSubject', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                        {pyqSubjects.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-[#6366f1] text-white text-[10px] rounded-full mr-2">{pyqSubjects.length}</span>}
                        Subjects <FilledArrow isOpen={openDropdown === 'pyqSubject'} />
                        </button>
                    </div>
                    <div className="flex-shrink-0">
                        <button onClick={(e) => handleOpenDropdown('year', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                        {pyqYears.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-[#6366f1] text-white text-[10px] rounded-full mr-2">{pyqYears.length}</span>}
                        Year <FilledArrow isOpen={openDropdown === 'year'} />
                        </button>
                    </div>
                    <div className="flex-shrink-0">
                        <button onClick={(e) => handleOpenDropdown('examType', e)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-[30px] text-[12px] flex items-center gap-2 bg-white font-sans text-[#374151]">
                        {examTypes.length > 0 && <span className="w-5 h-5 flex items-center justify-center bg-[#6366f1] text-white text-[10px] rounded-full mr-2">{examTypes.length}</span>}
                        Exam <FilledArrow isOpen={openDropdown === 'examType'} />
                        </button>
                    </div>
                  </>
                )}

                {/* 4. Reset Link */}
                {((activeTab === 'pyqs' && (pyqYears.length > 0 || examTypes.length > 0 || pyqSubjects.length > 0)) || (activeTab === 'notes' && selectedNotesSubjects.length > 0)) && (
                  <button onClick={resetFilters} className="text-[#6366f1] text-[12px] font-medium hover:underline px-2 transition-all ml-auto flex-shrink-0">
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

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
            {activeTab === "pyqs" && <PYQsTab branch={pyqBranch} level={pyqLevel} years={pyqYears} examTypes={examTypes} subjects={pyqSubjects} />}
            {activeTab === "notes" && <BranchNotesTab branch={notesBranch} level={notesLevel} selectedSubjects={selectedNotesSubjects} onSubjectsLoaded={setAvailableNotesSubjects} />}
            {activeTab === "syllabus" && <SyllabusTab level={syllabusLevel} category={syllabusCategory} courseId={syllabusSubjectId} />}
            {activeTab === "tools" && <IITMToolsTab selectedTool={selectedTool} branch={toolsBranch} level={toolsLevel} />}
            {activeTab === "courses" && <PaidCoursesTab branch={courseBranch} levels={selectedCourseLevels} subjects={selectedCourseSubjects} priceRange={coursePriceRange} />}
            {activeTab === "news" && <NewsTab sortOrder={sortOrder} />}
            {activeTab === "dates" && <ImportantDatesTab sortOrder={sortOrder} />}
          </div>
        </section>
      </main>
      <Footer />
      {/* PORTAL-LIKE RENDERING AT ROOT LEVEL - PREVENTS CLIPPING */}
      {renderDropdownContent()}
    </div>
  );
};

export default IITMBSPrep;
