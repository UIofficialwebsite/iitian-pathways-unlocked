import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIITMBranchNotes } from "@/components/iitm/hooks/useIITMBranchNotes";
import { useDownloadHandler } from "@/hooks/useDownloadHandler";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ExamPrepHeader from "@/components/ExamPrepHeader";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Info } from "lucide-react";
import { slugify } from "@/utils/urlHelpers";
import { Skeleton } from "@/components/ui/skeleton";

const IITMBSSubjectNotesPage = () => {
  const { branch, level, subjectSlug } = useParams<{ branch: string; level: string; subjectSlug: string }>();
  const navigate = useNavigate();
  const { loading, groupedData } = useIITMBranchNotes(branch || "", level || "");
  const { handleDownload, downloadCounts } = useDownloadHandler();
  
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [openSubjectSelect, setOpenSubjectSelect] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const filterBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupedData.length > 0 && subjectSlug) {
      const current = groupedData.find(s => slugify(s.subjectName) === subjectSlug);
      if (current) setSelectedSubject(current.subjectName);
    }
  }, [groupedData, subjectSlug]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 140) setIsSticky(true);
      else setIsSticky(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentData = useMemo(() => 
    groupedData.find(s => s.subjectName === selectedSubject), 
  [groupedData, selectedSubject]);

  const handleSubjectChange = (name: string) => {
    setSelectedSubject(name);
    setOpenSubjectSelect(false);
    navigate(`/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(name)}`, { replace: true });
  };

  const renderNoteCard = (note: any) => {
    const dCount = downloadCounts[note.id] || note.download_count || 0;
    return (
      <div key={note.id} className="bg-white border border-slate-200 rounded-md p-3 hover:border-black hover:ring-1 hover:ring-black transition-all">
        <div className="flex gap-3 items-start mb-3">
          <div className="relative flex flex-col items-center justify-center w-8 h-10 bg-red-50 border border-red-100 rounded flex-shrink-0">
            <FileText className="h-3.5 w-3.5 text-red-500 -mt-1" />
            <span className="absolute bottom-0.5 text-[6px] font-black text-red-500 uppercase">PDF</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[12px] text-slate-900 truncate">{note.title}</h4>
            <div className="text-[9px] font-bold text-slate-500 bg-slate-100 w-fit px-1.5 py-0.5 rounded border border-slate-200 mt-1">
              {dCount >= 1000 ? `${(dCount / 1000).toFixed(1)}k` : dCount} DOWNLOADS
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-7 text-[10px] bg-slate-50 font-bold" onClick={() => note.file_link && window.open(note.file_link, '_blank')}>PREVIEW</Button>
          <Button className="h-7 text-[10px] bg-blue-600 text-white font-bold" onClick={() => handleDownload(note.id, 'notes', note.file_link)}>DOWNLOAD</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <NavBar />
      <main className="pt-16">
        <ExamPrepHeader examName="IITM BS" examPath="/exam-preparation/iitm-bs" currentTab="notes" />
        
        {/* Sticky Filter Bar - Matching JEE/NEET design */}
        <div 
          ref={filterBarRef}
          className={`w-full bg-white border-b border-[#f3f4f6] transition-all ${
            isSticky ? "fixed top-16 z-[9999] shadow-sm" : "relative z-[9999]"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-nowrap items-center gap-3 py-3 font-sans overflow-x-auto no-scrollbar">
              {/* Back button */}
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 px-2 text-slate-500 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              
              <div className="h-4 w-[1px] bg-slate-200 mx-1 flex-shrink-0" />
              
              {/* Subject dropdown with count badge - matching JEE/NEET design */}
              <div className="relative dropdown-container">
                <button 
                  onClick={() => setOpenSubjectSelect(!openSubjectSelect)}
                  className="px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] flex items-center transition-all bg-white border-[#e5e7eb] text-[#374151]"
                >
                  {selectedSubject && <span className="w-5 h-5 bg-[#6366f1] text-white rounded-full text-[10px] flex items-center justify-center mr-2">1</span>}
                  Subjects
                  <span className={`ml-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] transition-transform ${openSubjectSelect ? 'rotate-180' : ''} border-t-[#374151] border-l-transparent border-r-transparent`}></span>
                </button>
              </div>
              
              <div className="flex-1" />
              
              <ShareButton url={window.location.href} title={`${selectedSubject} Notes`} variant="outline" size="sm" className="h-8 flex-shrink-0" />
            </div>
          </div>
          
          {/* Dropdown rendered OUTSIDE scrollable area for proper z-index */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {openSubjectSelect && (
              <div className="absolute top-0 left-4 right-4 sm:right-auto sm:left-[140px] lg:left-[150px] bg-white border border-[#e5e7eb] rounded-xl shadow-xl z-[9999] sm:min-w-[200px] max-w-[calc(100vw-2rem)] p-3 dropdown-container">
                <div className="max-h-[200px] overflow-y-auto mb-3 space-y-1">
                  {groupedData.map((s) => (
                    <label key={s.subjectId} className="flex items-center gap-2 p-1.5 hover:bg-[#f9fafb] rounded cursor-pointer text-xs text-gray-700">
                      <input 
                        type="radio" 
                        name="subject" 
                        checked={selectedSubject === s.subjectName} 
                        onChange={() => handleSubjectChange(s.subjectName)} 
                        className="accent-[#6366f1]" 
                      /> 
                      {s.subjectName}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <button onClick={() => setOpenSubjectSelect(false)} className="flex-1 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 rounded">Cancel</button>
                  <button onClick={() => setOpenSubjectSelect(false)} className="flex-1 py-1 text-[11px] font-semibold bg-[#6366f1] text-white rounded hover:bg-[#5255e0]">Apply</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {isSticky && <div className="h-12" />}

        <section className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-32 w-full rounded-md" />)}
            </div>
          ) : currentData ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">{currentData.subjectName}</h2>
                <p className="text-[11px] text-slate-500 mt-1">Found {currentData.notes.length} total study materials for this subject.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentData.notes.map(renderNoteCard)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed rounded-md">
              <Info className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-slate-500 text-xs">No materials found for the selected subject.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IITMBSSubjectNotesPage;
