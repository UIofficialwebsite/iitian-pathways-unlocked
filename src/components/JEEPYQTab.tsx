import React, { useState, useMemo, useEffect } from "react";
import ReactDOM from "react-dom";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ChevronDown } from "lucide-react";
import AuthWrapper from "@/components/AuthWrapper";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { ShimmerButton } from "./ui/shimmer-button";

const JEEPYQTab = ({ renderInRow2 = false }: { renderInRow2?: boolean }) => {
  const { pyqs, handleDownload, contentLoading } = useBackend();
  const [activeSubject, setActiveSubject] = useState("Physics");
  const [activeYear, setActiveYear] = useState("2024");
  const [activeSession, setActiveSession] = useState("");
  const [openDropdown, setOpenDropdown] = useState<'subject' | 'year' | 'session' | null>(null);

  const jeePyqs = useMemo(() => pyqs.filter(p => p.exam_type === 'JEE'), [pyqs]);
  const subjects = useMemo(() => Array.from(new Set(jeePyqs.map(p => p.subject).filter(Boolean))), [jeePyqs]);
  const years = useMemo(() => Array.from(new Set(jeePyqs.filter(p => p.subject === activeSubject).map(p => p.year?.toString()).filter(Boolean))).sort().reverse(), [jeePyqs, activeSubject]);
  const sessions = useMemo(() => Array.from(new Set(jeePyqs.filter(p => p.subject === activeSubject && p.year?.toString() === activeYear).map(p => p.session).filter(Boolean))), [jeePyqs, activeSubject, activeYear]);

  const filtered = jeePyqs.filter(p => p.subject === activeSubject && p.year?.toString() === activeYear && (activeSession === "" || p.session === activeSession));

  const filterContent = (
    <div className="flex flex-nowrap items-center gap-3 overflow-visible font-sans">
      {[
        { id: 'subject', label: 'Subject', value: activeSubject, items: subjects, setter: setActiveSubject },
        { id: 'year', label: 'Year', value: activeYear, items: years, setter: setActiveYear },
        { id: 'session', label: 'Session', value: activeSession || "Select", items: sessions, setter: setActiveSession }
      ].map((filter) => (
        <div key={filter.id} className="relative" onClick={(e) => e.stopPropagation()}>
          <button 
            disabled={filter.items.length === 0}
            onClick={() => setOpenDropdown(openDropdown === filter.id ? null : (filter.id as any))}
            className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center bg-white border-[#e5e7eb] text-[#374151] font-semibold disabled:opacity-50"
          >
            {filter.label}: {filter.value}
            <ChevronDown className={`ml-2 h-3 w-3 transition-transform ${openDropdown === filter.id ? 'rotate-180' : ''}`} />
          </button>
          {openDropdown === filter.id && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[100] min-w-[160px] p-2">
              {filter.items.map((item: any) => (
                <button
                  key={item}
                  onClick={() => { filter.setter(item); setOpenDropdown(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${filter.value === item ? 'bg-[#f4f2ff] text-[#6366f1] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const portalTarget = document.getElementById('pyq-filter-portal');

  return (
    <AuthWrapper>
      <div className="space-y-6">
        {/* If renderInRow2 is true, we move these filters to the parent's Row 2 container using a Portal */}
        {renderInRow2 && portalTarget ? ReactDOM.createPortal(filterContent, portalTarget) : !renderInRow2 && filterContent}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(pyq => (
            <Card key={pyq.id} className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-[#1a1a1a] line-clamp-2">{pyq.title}</CardTitle>
                <CardDescription className="text-xs">{activeSubject} - {activeYear}</CardDescription>
              </CardHeader>
              <CardFooter className="flex items-center justify-between">
                <ShimmerButton onClick={() => handleDownload(pyq.id, 'pyqs', pyq.file_link)} background="#6366f1" borderRadius="8px" className="h-9 px-4">
                  <span className="flex items-center text-[13px] font-bold text-white"><Download className="h-3.5 w-3.5 mr-2" /> Download</span>
                </ShimmerButton>
              </CardFooter>
            </Card>
          ))}
          {filtered.length === 0 && <div className="col-span-full py-20 text-center text-gray-500">No papers found.</div>}
        </div>
      </div>
    </AuthWrapper>
  );
};

export default JEEPYQTab;
