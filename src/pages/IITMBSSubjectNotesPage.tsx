import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIITMBranchNotes } from "@/components/iitm/hooks/useIITMBranchNotes";
import { useDownloadHandler } from "@/hooks/useDownloadHandler";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ExamPrepHeader from "@/components/ExamPrepHeader";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, ArrowLeft, Info } from "lucide-react";
import { slugify } from "@/utils/urlHelpers";
import { Skeleton } from "@/components/ui/skeleton";

const IITMBSSubjectNotesPage = () => {
  const { branch, level, subjectSlug } = useParams<{ branch: string; level: string; subjectSlug: string }>();
  const navigate = useNavigate();
  const { loading, groupedData } = useIITMBranchNotes(branch || "", level || "");
  const { handleDownload, downloadCounts } = useDownloadHandler();
  
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const [isSticky, setIsSticky] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Sync selected subject with URL slug
  useEffect(() => {
    if (groupedData.length > 0) {
      const initialSubject = groupedData.find(s => slugify(s.subjectName) === subjectSlug);
      if (initialSubject) setSelectedSubject(initialSubject.subjectName);
    }
  }, [groupedData, subjectSlug]);

  // Sticky Logic
  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        setIsSticky(window.scrollY > 150);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentSubjectData = useMemo(() => 
    groupedData.find(s => s.subjectName === selectedSubject), 
  [groupedData, selectedSubject]);

  const handleSubjectChange = (subjectName: string) => {
    setSelectedSubject(subjectName);
    setOpenDropdown(false);
    navigate(`/exam-preparation/iitm-bs/notes/${branch}/${level}/${slugify(subjectName)}`, { replace: true });
  };

  const renderNoteCard = (note: any) => {
    const dCount = downloadCounts[note.id] || note.download_count || 0;
    return (
      <div key={note.id} className="flex flex-col gap-3 p-3 bg-white border border-slate-200 rounded-md hover:border-black transition-all">
        <div className="flex gap-3 items-start">
          <div className="relative flex flex-col items-center justify-center w-8 h-10 bg-red-50 border border-red-100 rounded flex-shrink-0">
            <FileText className="h-3.5 w-3.5 text-red-500 -mt-1" />
            <span className="absolute bottom-0.5 text-[6px] font-black text-red-500 uppercase">PDF</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[12px] text-slate-900 truncate">{note.title}</h4>
            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {dCount >= 1000 ? `${(dCount / 1000).toFixed(1)}k` : dCount} Downloads
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-7 text-[10px] bg-slate-50" onClick={() => note.file_link && window.open(note.file_link, '_blank')}>Preview</Button>
          <Button className="h-7 text-[10px] bg-blue-600 text-white" onClick={() => handleDownload(note.id, 'notes', note.file_link)}>Download</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <NavBar />
      <main className="pt-16">
        <ExamPrepHeader examName="IITM BS" examPath="/exam-preparation/iitm-bs" currentTab="notes" />
        
        {/* Sticky Filter System */}
        <div 
          ref={filterRef}
          className={`w-full border-b bg-white transition-all duration-300 ${
            isSticky ? "fixed top-16 z-[9999] shadow-sm" : "relative"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 gap-1 text-slate-500">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <div className="h-6 w-[1px] bg-slate-200" />
              
              {/* Subject Filter Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setOpenDropdown(!openDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-[13px] font-bold text-slate-900 transition-colors"
                >
                  {selectedSubject || "Select Subject"}
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-[10000] p-2">
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {groupedData.map((s) => (
                        <button
                          key={s.subjectId}
                          onClick={() => handleSubjectChange(s.subjectName)}
                          className={`w-full text-left px-3 py-2 rounded-md text-xs transition-colors ${
                            selectedSubject === s.subjectName ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {s.subjectName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ShareButton
              url={window.location.href}
              title={`${selectedSubject} Notes`}
              variant="outline"
              size="sm"
              className="h-8"
            />
          </div>
        </div>

        {isSticky && <div className="h-14" />}

        <section className="max-w-7xl mx-auto px-4 py-8 min-h-[600px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
            </div>
          ) : currentSubjectData ? (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900 mb-2">{currentSubjectData.subjectName}</h1>
                <p className="text-sm text-slate-500">All study materials, lecture notes, and practice resources.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentSubjectData.notes.map(renderNoteCard)}
              </div>
              
              {currentSubjectData.notes.length === 0 && (
                <div className="text-center py-20 bg-slate-50 border border-dashed rounded-xl">
                  <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No notes found for this subject.</p>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IITMBSSubjectNotesPage;k
