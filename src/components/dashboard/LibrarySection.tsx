import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Search, Youtube, PlayCircle, Loader2, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from '@/integrations/supabase/client';
import { useStudyMaterials } from "@/hooks/useStudyMaterials";

// --- Types & Interfaces ---
interface ContentItem {
  id: string | number;
  title: string;
  subject?: string;
  url?: string | null;
  category: string;
  year?: number | null;
  session?: string | null;
  shift?: string | null;
  week_number?: number | null;
  level?: string | null;
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
}

interface YouTubePlaylist {
  title: string;
  videos: YouTubeVideo[];
}

const contentCategories = [
    'PYQs (Previous Year Questions)',
    'Short Notes and Mindmaps',
    'Free Lectures',
    'Free Question Bank',
    'UI ki Padhai',
];

// --- Sub-component: Content Card ---
const ContentCard: React.FC<{ item: ContentItem; handleOpen: (item: ContentItem) => void; isIITM: boolean }> = ({ item, handleOpen, isIITM }) => {
    const thumbnailUrl = `https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=200&q=80`;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.url) window.open(item.url, '_blank');
    };

    return (
        <Card className="group bg-white border-slate-200 rounded-lg p-4 flex gap-5 transition-all hover:shadow-md h-[180px] cursor-default overflow-hidden">
            <div className="w-[100px] h-[145px] bg-slate-800 rounded flex-shrink-0 overflow-hidden shadow-sm">
                <img src={thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-90" />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <div className="mb-1">
                    <h3 className="text-base font-semibold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                    </h3>
                    {(item.year || item.session || item.shift) && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 truncate">
                            {item.year || ''} {item.session || ''} {item.shift || ''}
                        </p>
                    )}
                </div>

                <div className="flex gap-1.5 mb-3 mt-auto">
                    <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase bg-red-50 text-red-600 border border-red-100">PDF</span>
                    <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100 truncate">
                        {isIITM && item.week_number ? `Week ${item.week_number}` : (item.subject || 'Gen')}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleOpen(item)} className="flex-grow h-8 text-xs font-normal text-slate-700 border-slate-200 hover:bg-slate-50 rounded-md">
                        View Content
                    </Button>
                    <button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 w-8 h-8 rounded-md flex items-center justify-center">
                        <Download className="h-4 w-4 text-white" />
                    </button>
                </div>
            </div>
        </Card>
    );
};

// --- Main Component: LibrarySection ---
const LibrarySection: React.FC<{ profile: Tables<'profiles'> | null }> = ({ profile }) => {
  const navigate = useNavigate();
  const { materials: studyMaterials, loading: studyLoading } = useStudyMaterials(); 
  
  const [dbMaterials, setDbMaterials] = useState<ContentItem[]>([]);
  const [ytPlaylists, setYtPlaylists] = useState<YouTubePlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  const [showAll, setShowAll] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [ytSearchQuery, setYtSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("none");
  const [selectedSubject, setSelectedSubject] = useState<string>("none");
  const [selectedWeekOrYear, setSelectedWeekOrYear] = useState<string>("none");

  const focusArea = (profile?.program_type as any) || 'General';
  const isIITM = focusArea === 'IITM_BS';

  // 1. Fetch DB Materials (PYQs, Notes, Branch Notes)
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        const { data: pyqData } = await supabase.from('pyqs').select('*').eq('exam_type', focusArea).eq('is_active', true);
        const { data: notesData } = await supabase.from('notes').select('*').eq('exam_type', focusArea).eq('is_active', true);
        const { data: iitmData } = isIITM ? await supabase.from('iitm_branch_notes').select('*').eq('is_active', true) : { data: [] };

        const combined: ContentItem[] = [
          ...(pyqData || []).map(p => ({ 
            id: p.id, title: p.title, subject: p.subject, url: p.file_link || p.content_url, 
            category: 'PYQs (Previous Year Questions)', year: p.year, level: p.level || p.class_level, 
            session: p.session, shift: p.shift 
          })),
          ...(notesData || []).map(n => ({ 
            id: n.id, title: n.title, subject: n.subject, url: n.file_link || n.content_url, 
            category: 'Short Notes and Mindmaps', level: n.class_level || n.level 
          })),
          ...(iitmData || []).map(i => ({ 
            id: i.id, title: i.title, subject: i.subject, url: i.file_link, 
            category: 'Short Notes and Mindmaps', week_number: i.week_number, level: i.level 
          }))
        ];
        setDbMaterials(combined);
      } catch (err) {
        console.error("Library sync error:", err);
      } finally { setLoading(false); }
    };
    fetchTables();
  }, [focusArea, isIITM]);

  // 2. Fetch YouTube Data for Lectures
  useEffect(() => {
    if (activeTab === 'Free Lectures' && isIITM) {
      const fetchYT = async () => {
        setLoading(true);
        try {
          const { data } = await supabase.functions.invoke('get-youtube-playlist');
          if (data?.playlists) setYtPlaylists(data.playlists);
        } catch (err) { console.error("YT Fetch Error:", err); }
        finally { setLoading(false); }
      };
      fetchYT();
    }
  }, [activeTab, isIITM]);

  // 3. Filtering Logic
  const allContent = useMemo(() => {
    const studyMapped = (studyMaterials || [])
        .filter(m => !m.exam_category || m.exam_category === focusArea || m.exam_category === 'General')
        .map(m => {
            let cat = 'Other';
            const materialType = (m as any).material_type;
            const titleLower = m.title.toLowerCase();
            if (materialType === 'ui_ki_padhai' || titleLower.includes('ui ki padhai')) cat = 'UI ki Padhai';
            else if (materialType === 'note' || materialType === 'mindmap') cat = 'Short Notes and Mindmaps';
            else if (materialType === 'question_bank') cat = 'Free Question Bank';
            else if (titleLower.includes('lecture')) cat = 'Free Lectures';
            
            return { 
                id: m.id, title: m.title, subject: m.subject || 'General', url: m.file_url, 
                category: cat, level: m.level || m.class_level, year: m.year, week_number: m.week_number 
            };
        });
    return [...dbMaterials, ...studyMapped];
  }, [dbMaterials, studyMaterials, focusArea]);

  const catFiltered = useMemo(() => allContent.filter(m => m.category === activeTab), [allContent, activeTab]);
  const searchFiltered = useMemo(() => searchQuery ? catFiltered.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())) : catFiltered, [catFiltered, searchQuery]);
  const levelFiltered = useMemo(() => selectedLevel === "none" ? searchFiltered : searchFiltered.filter(m => m.level === selectedLevel), [searchFiltered, selectedLevel]);
  const subjectFiltered = useMemo(() => selectedSubject === "none" ? levelFiltered : levelFiltered.filter(m => m.subject === selectedSubject), [levelFiltered, selectedSubject]);
  
  const finalContent = useMemo(() => {
      if (selectedWeekOrYear === "none") return subjectFiltered;
      const field = activeTab.includes('PYQs') ? 'year' : 'week_number';
      return subjectFiltered.filter(m => m[field as keyof ContentItem]?.toString() === selectedWeekOrYear);
  }, [subjectFiltered, selectedWeekOrYear, activeTab]);

  const displayedContent = showAll ? finalContent : finalContent.slice(0, 6);

  // Derived filters for the UI
  const levelsAvailable = useMemo(() => Array.from(new Set(catFiltered.map(m => m.level))).filter(Boolean), [catFiltered]);
  const subjectsAvailable = useMemo(() => Array.from(new Set(levelFiltered.map(m => m.subject))).filter(Boolean), [levelFiltered]);
  const specificsAvailable = useMemo(() => {
      const field = activeTab.includes('PYQs') ? 'year' : 'week_number';
      return Array.from(new Set(subjectFiltered.map(m => m[field as keyof ContentItem]))).filter(Boolean).map(String);
  }, [subjectFiltered, activeTab]);

  const filteredYtContent = useMemo(() => {
    if (!ytSearchQuery) return ytPlaylists;
    return ytPlaylists.map(playlist => ({
      ...playlist,
      videos: playlist.videos.filter(v => v.title.toLowerCase().includes(ytSearchQuery.toLowerCase()))
    })).filter(playlist => playlist.videos.length > 0);
  }, [ytPlaylists, ytSearchQuery]);

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-slate-900 overflow-hidden">
      {/* Header Section */}
      <div className="bg-white border-b flex-none z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-5 mb-4">
              <div className="flex items-center gap-4">
                   <Button variant="ghost" size="icon" className="-ml-2 h-10 w-10 rounded-full" onClick={() => viewingItem ? setViewingItem(null) : navigate(-1)}>
                      <ArrowLeft className="h-6 w-6" />
                   </Button>
                   <h1 className="text-xl font-semibold tracking-tight">{viewingItem ? viewingItem.title : 'Library'}</h1>
              </div>
          </div>
          {!viewingItem && (
              <div className="px-4 md:px-8 overflow-x-auto scrollbar-hide">
                   <div className="flex space-x-6">
                        {contentCategories.map((category) => (
                          <button key={category} onClick={() => { setActiveTab(category); setShowAll(false); setSelectedLevel("none"); setSelectedSubject("none"); setSelectedWeekOrYear("none"); setSearchQuery(""); setYtSearchQuery(""); }} className={cn("pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 px-1", activeTab === category ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-slate-700")}>
                            {category}
                          </button>
                        ))}
                   </div>
              </div>
          )}
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full scrollbar-hide">
        {viewingItem ? (
            <div className="w-full bg-black rounded-xl border border-slate-800 h-full overflow-hidden flex items-center justify-center relative">
                 {/* PW-STYLE PLAYER SHELL: Crops branding bars */}
                 <div className="relative w-full h-full overflow-hidden">
                    <iframe 
                        src={`${viewingItem.url}&modestbranding=1&rel=0&controls=1&iv_load_policy=3&disablekb=0`} 
                        className="absolute top-[-7%] left-0 w-full h-[114%] border-0" 
                        title="Viewer" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                    
                    {/* TRANSPARENT SECURITY SHIELD: Blocks clicks to top branding bar */}
                    <div 
                        className="absolute top-0 left-0 w-full h-[18%] z-10 bg-transparent cursor-default" 
                        onContextMenu={(e) => e.preventDefault()}
                    />
                 </div>
            </div>
        ) : (
            <div className="space-y-8">
                {activeTab === 'Free Lectures' && isIITM ? (
                    <div className="space-y-10 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* YouTube Search Bar */}
                        <div className="relative max-w-md mx-auto mb-10">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input placeholder="Search lectures..." value={ytSearchQuery} onChange={(e) => setYtSearchQuery(e.target.value)} className="pl-10 h-12 bg-slate-50 border-slate-200 rounded-full shadow-sm focus:ring-2 focus:ring-blue-500" />
                        </div>

                        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div> : 
                            filteredYtContent.map((playlist, idx) => (
                                <section key={idx} className="space-y-4">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Youtube className="text-red-600 h-6 w-6" /> {playlist.title}</h3>
                                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                        {playlist.videos.map((video) => (
                                            <div 
                                              key={video.id} 
                                              className="min-w-[280px] w-[280px] group cursor-pointer" 
                                              onClick={() => {
                                                setViewingItem({
                                                    id: video.id,
                                                    title: video.title,
                                                    category: 'Free Lectures',
                                                    url: `https://www.youtube.com/embed/${video.id}?autoplay=1`
                                                });
                                              }}
                                            >
                                                <div className="aspect-video rounded-xl overflow-hidden relative mb-3">
                                                    <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={video.title} />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center transition-all">
                                                        <PlayCircle className="text-white h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                                <h4 className="font-semibold text-sm line-clamp-2 text-slate-700 group-hover:text-blue-600">{video.title}</h4>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            ))
                        }
                    </div>
                ) : (
                    <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-6 md:p-8 mb-20">
                        {/* Section Header & Search */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                                <FileText className="h-5 w-5 text-blue-600" />
                                {activeTab}
                            </h2>
                            <div className="flex items-center gap-4">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search titles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-white border-slate-200 text-sm" />
                                </div>
                                {catFiltered.length > 6 && (
                                    <button className="text-sm font-medium text-blue-600 hover:underline shrink-0" onClick={() => setShowAll(!showAll)}>
                                        {showAll ? 'Show Less' : 'View All →'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Dropdown Filters (Restored) */}
                        {showAll && (
                            <div className="flex flex-wrap items-center gap-3 mb-8 animate-in fade-in">
                                {levelsAvailable.length > 0 && (
                                    <Select value={selectedLevel} onValueChange={(val) => { setSelectedLevel(val); setSelectedSubject("none"); setSelectedWeekOrYear("none"); }}>
                                        <SelectTrigger className="w-[160px] h-9 bg-white border-slate-200 text-sm">
                                            <SelectValue placeholder="Academic Level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">All Levels</SelectItem>
                                            {levelsAvailable.map(l => <SelectItem key={l} value={l!}>{l}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                )}
                                {selectedLevel !== "none" && subjectsAvailable.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                        <Select value={selectedSubject} onValueChange={(val) => { setSelectedSubject(val); setSelectedWeekOrYear("none"); }}>
                                            <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-sm">
                                                <SelectValue placeholder="Subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">All Subjects</SelectItem>
                                                {subjectsAvailable.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                {selectedSubject !== "none" && specificsAvailable.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                        <Select value={selectedWeekOrYear} onValueChange={setSelectedWeekOrYear}>
                                            <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200 text-sm">
                                                <SelectValue placeholder={activeTab.includes('PYQs') ? "Year" : "Week"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">{activeTab.includes('PYQs') ? "All Years" : "All Weeks"}</SelectItem>
                                                {specificsAvailable.map(v => <SelectItem key={v} value={v!}>{v}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cards Grid */}
                        {(loading || studyLoading) ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                                {[1,2,3,4,5,6].map(i => <div key={i} className="h-[180px] bg-slate-100 rounded-lg border" />)}
                            </div>
                        ) : displayedContent.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedContent.map((item) => <ContentCard key={item.id} item={item} handleOpen={setViewingItem} isIITM={isIITM} />)}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-slate-400">No resources available.</div>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
