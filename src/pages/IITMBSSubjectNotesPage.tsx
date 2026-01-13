import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useIITMBranchNotes } from "@/components/iitm/hooks/useIITMBranchNotes";
import { useDownloadHandler } from "@/hooks/useDownloadHandler";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { ShareButton } from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft, Info, Search, Download, Home, ChevronRight } from "lucide-react";
import { slugify } from "@/utils/urlHelpers";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const IITMBSSubjectNotesPage = () => {
  const { branch, level, subjectSlug } = useParams<{ branch: string; level: string; subjectSlug: string }>();
  const navigate = useNavigate();
  const { loading, groupedData } = useIITMBranchNotes(branch || "", level || "");
  const { handleDownload, downloadCounts } = useDownloadHandler();
  
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (groupedData.length > 0 && subjectSlug) {
      const current = groupedData.find(s => slugify(s.subjectName) === subjectSlug);
      if (current) setSelectedSubject(current.subjectName);
    }
  }, [groupedData, subjectSlug]);

  const currentData = useMemo(() => 
    groupedData.find(s => s.subjectName === selectedSubject), 
  [groupedData, selectedSubject]);

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
        {/* 1. PAGE BANNER (Course Listing Style) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] border-b min-h-[220px] flex items-center font-sans">
            <div className="absolute -top-[120px] -left-[60px] w-[250px] h-[250px] bg-slate-300/25 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute -bottom-[40px] right-[12%] w-[200px] h-[200px] bg-purple-200/30 rounded-[40%_60%_70%_30%] blur-[50px] pointer-events-none" />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-gray-500 text-[11px] uppercase tracking-wider mb-6">
                    <Link to="/" className="hover:text-black transition-colors"><Home className="h-3.5 w-3.5" /></Link>
                    <ChevronRight className="h-3 w-3" />
                    <Link to="/exam-preparation/iitm-bs" className="hover:text-black transition-colors">IITM BS Prep</Link>
                    <ChevronRight className="h-3 w-3" />
                    <span className="text-gray-400">Subject Resources</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#383838] mb-4 tracking-tight leading-tight uppercase">
                    {selectedSubject || "Subject Resources"}
                </h1>
                <p className="text-slate-500 max-w-2xl text-sm md:text-base font-medium">
                    Access premium study notes, curated modules, and chapter-wise resources for {branch} {level}.
                </p>
            </div>
        </div>
        
        {/* 2. THE HEADER BAR (Sticky below NavBar) */}
        <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 px-3 text-slate-500 hover:text-black font-bold uppercase text-[11px] shrink-0 border border-transparent hover:border-slate-200 rounded-lg transition-all">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              
              <div className="h-6 w-[1px] bg-slate-200 mx-1 shrink-0" />
              
              {/* Central Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder={`Search for materials...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-slate-50 border-slate-200 text-xs focus-visible:ring-1 focus-visible:ring-[#1E3A8A] rounded-full"
                />
              </div>
            </div>

            <ShareButton 
              url={window.location.href} 
              title={`${selectedSubject} Notes`} 
              variant="outline" 
              size="sm" 
              showText={true}
              className="h-10 px-5 rounded-full border-slate-200 font-bold text-[#475569] bg-white shadow-sm" 
            />
          </div>
        </div>

        {/* 3. CONTENT (Notes Grid) */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl shadow-sm" />)}
            </div>
          ) : currentData ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-2 h-2 bg-[#1E3A8A] rounded-full" />
                   Available Materials ({filteredNotes.length})
                </h2>
              </div>

              {filteredNotes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredNotes.map(renderNoteCard)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">No matching materials found</p>
                  <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2 text-[#1E3A8A] font-bold h-auto p-0 text-xs">Clear search</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <Info className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-bold uppercase text-xs tracking-wider">Subject content not found</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IITMBSSubjectNotesPage;
