import React, { useState, useEffect, useMemo } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ChevronDown } from "lucide-react";
import AuthWrapper from "@/components/AuthWrapper";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { ShimmerButton } from "./ui/shimmer-button";

interface JEEPYQTabProps {
  downloads: Record<string, number>;
  onDownload: (id: string) => void;
  onFilterChange?: (tab: string, subject?: string, classLevel?: string, year?: string, session?: string) => void;
}

const JEEPYQTab = ({ downloads: propDownloads, onDownload: propOnDownload, onFilterChange }: JEEPYQTabProps) => {
  const { pyqs, handleDownload, downloadCounts, contentLoading } = useBackend();
  
  // State for selections
  const [activeSubject, setActiveSubject] = useState("Physics");
  const [activeYear, setActiveYear] = useState("2024");
  const [activeSession, setActiveSession] = useState("");
  
  // UI State for dropdowns
  const [openDropdown, setOpenDropdown] = useState<'subject' | 'year' | 'session' | null>(null);

  const jeePyqs = useMemo(() => pyqs.filter(pyq => pyq.exam_type === 'JEE'), [pyqs]);

  // 1. Calculate dynamic Subjects (Categories)
  const availableSubjects = useMemo(() => {
    return Array.from(new Set(jeePyqs.map(p => p.subject).filter(Boolean))).sort() as string[];
  }, [jeePyqs]);

  // 2. Calculate dynamic Years for the chosen Subject
  const availableYears = useMemo(() => {
    return Array.from(new Set(
      jeePyqs
        .filter(p => p.subject === activeSubject)
        .map(p => p.year?.toString())
        .filter(Boolean)
    )).sort((a, b) => Number(b) - Number(a)) as string[];
  }, [jeePyqs, activeSubject]);

  // 3. Calculate dynamic Sessions for chosen Subject + Year
  const availableSessions = useMemo(() => {
    return Array.from(new Set(
      jeePyqs
        .filter(p => p.subject === activeSubject && p.year?.toString() === activeYear)
        .map(p => p.session)
        .filter(Boolean)
    )).sort() as string[];
  }, [jeePyqs, activeSubject, activeYear]);

  // Sync session and year when subject changes
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(activeYear)) {
      setActiveYear(availableYears[0]);
    }
  }, [activeSubject, availableYears]);

  useEffect(() => {
    if (availableSessions.length > 0 && !availableSessions.includes(activeSession)) {
      setActiveSession(availableSessions[0]);
    } else if (availableSessions.length === 0) {
      setActiveSession("");
    }
  }, [activeYear, availableSessions]);

  const handleDownloadClick = async (pyqId: string, fileUrl?: string) => {
    await handleDownload(pyqId, 'pyqs', fileUrl);
  };

  const filteredPapers = jeePyqs.filter(
    pyq => 
      pyq.subject === activeSubject && 
      pyq.year?.toString() === activeYear && 
      (activeSession === "" || pyq.session === activeSession)
  );

  const toggleDropdown = (type: 'subject' | 'year' | 'session') => {
    setOpenDropdown(openDropdown === type ? null : type);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <AuthWrapper>
      <div className="space-y-6">
        
        {/* CUSTOM DROPDOWN FILTERS (Course Listing Style) */}
        <div className="flex flex-nowrap items-center gap-3 py-4 border-b border-[#f3f4f6] font-sans overflow-visible">
          
          {/* Subject Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => toggleDropdown('subject')}
              className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] font-semibold active:scale-95`}
            >
              Subject: {activeSubject}
              <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${openDropdown === 'subject' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'subject' && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[100] min-w-[180px] p-2">
                {availableSubjects.map(sub => (
                  <button
                    key={sub}
                    onClick={() => { setActiveSubject(sub); setOpenDropdown(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${activeSubject === sub ? 'bg-[#f4f2ff] text-[#6366f1] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              disabled={availableYears.length === 0}
              onClick={() => toggleDropdown('year')}
              className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] font-semibold disabled:opacity-50 active:scale-95`}
            >
              Year: {activeYear}
              <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${openDropdown === 'year' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'year' && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[100] min-w-[140px] p-2">
                {availableYears.map(y => (
                  <button
                    key={y}
                    onClick={() => { setActiveYear(y); setOpenDropdown(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${activeYear === y ? 'bg-[#f4f2ff] text-[#6366f1] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button 
              disabled={availableSessions.length === 0}
              onClick={() => toggleDropdown('session')}
              className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151] font-semibold disabled:opacity-50 active:scale-95`}
            >
              Session: {activeSession || 'Select'}
              <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${openDropdown === 'session' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'session' && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[100] min-w-[140px] p-2">
                {availableSessions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setActiveSession(s); setOpenDropdown(null); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${activeSession === s ? 'bg-[#f4f2ff] text-[#6366f1] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* PAPERS GRID */}
        {contentLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366f1]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredPapers.map((pyq) => (
              <Card key={pyq.id} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-[#1a1a1a] line-clamp-2">{pyq.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500 line-clamp-1">{pyq.description || `${activeSubject} - ${activeYear}`}</CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between pt-2">
                  <ShimmerButton
                    onClick={() => handleDownloadClick(pyq.id, pyq.file_link || undefined)}
                    background="#6366f1"
                    borderRadius="8px"
                    className="h-9 px-4"
                  >
                    <span className="flex items-center text-[13px] font-bold text-white">
                        <Download className="h-3.5 w-3.5 mr-2" /> Download
                    </span>
                  </ShimmerButton>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-tight">
                        {downloadCounts[pyq.id] || pyq.download_count || 0} Downloads
                    </span>
                    <div className="bg-gray-100 h-1 w-16 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#6366f1] h-full rounded-full" 
                        style={{ width: `${Math.min(100, ((downloadCounts[pyq.id] || pyq.download_count || 0) / 500) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            {filteredPapers.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                    <Download className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">No papers found</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    We don't have any {activeSubject} papers for {activeYear} {activeSession} yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthWrapper>
  );
};

export default JEEPYQTab;
