import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIITMBranchNotes } from "@/components/iitm/hooks/useIITMBranchNotes";
import { useDownloadHandler } from "@/hooks/useDownloadHandler";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ExamPrepHeader from "@/components/ExamPrepHeader";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Info, Search, Download } from "lucide-react";
import { slugify } from "@/utils/urlHelpers";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const IITMBSSubjectNotesPage = () => {
  const { branch, level, subjectSlug } = useParams<{ branch: string; level: string; subjectSlug: string }>();
  const navigate = useNavigate();
  const { loading, groupedData } = useIITMBranchNotes(branch || "", level || "");
  const { handleDownload, downloadCounts } = useDownloadHandler();
  
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    if (!currentData) return [];
    if (!searchQuery.trim()) return currentData.notes;
    return currentData.notes.filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [currentData, searchQuery]);

  const renderNoteCard = (note: any) => {
    const dCount = downloadCounts[note.id] || note.download_count || 0;
    const displayDownloads = dCount >= 1000 ? `${(dCount / 1000).toFixed(1)}k` : dCount;

    return (
      <article 
        key={note.id} 
        className="bg-white rounded-lg p-5 flex flex-col justify-between h-full border border-black/[0.08] hover:border-black/20 transition-all shadow-sm"
        style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
      >
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="text-[#b93a3a]">
              <FileText className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <div className="flex items-center text-gray-400 text-[11px] font-medium">
              <Download className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
              <span>{displayDownloads}</span>
            </div>
          </div>
          
          <h3 className="font-bold text-gray-900 mb-2 text-sm leading-tight line-clamp-2">
            {note.title}
          </h3>
          <p className="text-xs text-gray-500 mb-6 line-clamp-2">
            {note.description || `Comprehensive study material for ${note.title}.`}
          </p>
        </div>

        <div className="flex space-x-3 mt-auto font-sans">
          <button 
            className="flex-1 border-[1.5px] border-[#1E3A8A] text-[#1E3A8A] h-[38px] text-[11px] font-bold uppercase rounded-md hover:bg-blue-50 transition-colors"
            onClick={() => note.file_link && window.open(note.file_link, '_blank')}
          >
            View
          </button>
          <button 
            className="flex-1 bg-[#1E3A8A] text-white h-[38px] text-[11px] font-bold uppercase rounded-md hover:opacity-90 transition-opacity shadow-sm"
            onClick={() => handleDownload(note.id, 'notes', note.file_link)}
          >
            Get PDF
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <NavBar />
      <main className="pt-16">
        {/* Keep Banner */}
        <ExamPrepHeader examName="IITM BS" examPath="/exam-preparation/iitm-bs" currentTab="notes" />
        
        {/* Updated Filter Bar: No subject filter, now has Search Bar */}
        <div 
          ref={filterBarRef}
          className={`w-full bg-white border-b border-slate-200 transition-all ${
            isSticky ? "fixed top-16 z-[50] shadow-sm" : "relative"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-9 px-2 text-slate-500 shrink-0">
                <ArrowLeft className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="h-5 w-[1px] bg-slate-200 mx-1 shrink-0" />
              
              {/* Search Bar Implementation */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder={`Search in ${selectedSubject || 'materials'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-slate-50 border-slate-200 text-xs focus-visible:ring-1 focus-visible:ring-[#1E3A8A]"
                />
              </div>
            </div>

            <ShareButton url={window.location.href} title={`${selectedSubject} Notes`} variant="outline" size="sm" className="h-9" />
          </div>
        </div>

        {isSticky && <div className="h-14" />}

        <section className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-56 w-full rounded-lg" />)}
            </div>
          ) : currentData ? (
            <div>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                    {currentData.subjectName}
                  </h2>
                  <p className="text-[12px] text-slate-500 mt-1">
                    Showing {filteredNotes.length} of {currentData.notes.length} total study materials.
                  </p>
                </div>
                {searchQuery && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchQuery("")}
                    className="h-auto p-0 text-xs text-[#1E3A8A] font-bold uppercase"
                  >
                    Clear Search
                  </Button>
                )}
              </div>

              {filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredNotes.map(renderNoteCard)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50 border border-dashed rounded-xl">
                  <Search className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No materials match your search.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed rounded-xl">
              <Info className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No materials found for this subject.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IITMBSSubjectNotesPage;
