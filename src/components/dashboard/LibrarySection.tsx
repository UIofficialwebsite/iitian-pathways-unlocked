import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

const contentCategories = [
    'PYQs (Previous Year Questions)',
    'Short Notes and Mindmaps',
    'Free Lectures',
    'Free Question Bank',
    'UI ki Padhai',
];

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

const ContentCard: React.FC<{ item: ContentItem; handleOpen: (item: ContentItem) => void; isIITM: boolean }> = ({ item, handleOpen, isIITM }) => {
    const thumbnailUrl = `https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=200&q=80`;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.url) window.open(item.url, '_blank');
    };

    return (
        <Card className="group bg-white border-slate-200 rounded-lg p-4 flex gap-5 transition-all hover:shadow-md h-[180px] cursor-default overflow-hidden">
            <div className="w-[100px] h-[145px] bg-slate-800 rounded flex-shrink-0 overflow-hidden shadow-sm">
                <img src={thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-90 transition-transform group-hover:scale-105 duration-500" />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <div className="mb-1">
                    <h3 className="text-sm md:text-base font-semibold text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                    </h3>
                    {/* Clean metadata text without icons/emojis */}
                    {(item.year || item.session || item.shift) && (
                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                            {item.year || ''} {item.session || ''} {item.shift || ''}
                        </p>
                    )}
                </div>

                <div className="flex gap-1.5 mb-3 mt-auto">
                    <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase bg-red-50 text-red-600 border border-red-100">PDF</span>
                    <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100 truncate">
                        {isIITM && item.week_number ? `Week ${item.week_number}` : (item.subject || 'General')}
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

const LibrarySection: React.FC<{ profile: Tables<'profiles'> | null }> = ({ profile }) => {
  const navigate = useNavigate();
  const { materials: studyMaterials, loading: studyLoading } = useStudyMaterials(); 
  const [dbMaterials, setDbMaterials] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  const [showAll, setShowAll] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("none");
  const [selectedSubject, setSelectedSubject] = useState<string>("none");
  const [selectedWeekOrYear, setSelectedWeekOrYear] = useState<string>("none");

  const focusArea = (profile?.program_type as any) || 'General';
  const isIITM = focusArea === 'IITM_BS';

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        const { data: pyqData } = await supabase.from('pyqs').select('*').eq('exam_type', focusArea).eq('is_active', true);
        const { data: notesData } = await supabase.from('notes').select('*').eq('exam_type', focusArea).eq('is_active', true);
        const { data: iitmData } = isIITM ? await supabase.from('iitm_branch_notes').select('*').eq('is_active', true) : { data: [] };

        const combined: ContentItem[] = [
          ...(pyqData || []).map(p => ({ id: p.id, title: p.title, subject: p.subject, url: p.file_link || p.content_url, category: 'PYQs (Previous Year Questions)', year: p.year, level: p.level })),
          ...(notesData || []).map(n => ({ id: n.id, title: n.title, subject: n.subject, url: n.file_link || n.content_url, category: 'Short Notes and Mindmaps', level: n.class_level })),
          ...(iitmData || []).map(i => ({ id: i.id, title: i.title, subject: i.subject, url: i.file_link, category: 'Short Notes and Mindmaps', week_number: i.week_number, level: i.level }))
        ];
        setDbMaterials(combined);
      } finally { setLoading(false); }
    };
    fetchTables();
  }, [focusArea, isIITM]);

  const allContent = useMemo(() => {
    const studyMapped = (studyMaterials || []).filter(m => !m.exam_category || m.exam_category === focusArea).map(m => {
        let cat = 'Other';
        if (m.material_type === 'note' || m.material_type === 'mindmap') cat = 'Short Notes and Mindmaps';
        else if (m.material_type === 'pyq') cat = 'PYQs (Previous Year Questions)';
        else if (m.material_type === 'question_bank') cat = 'Free Question Bank';
        if (m.title.toLowerCase().includes('lecture')) cat = 'Free Lectures';
        if (m.title.toLowerCase().includes('ui')) cat = 'UI ki Padhai';
        return { id: m.id, title: m.title, subject: m.subject || 'General', url: m.file_url, category: cat, level: m.level, year: m.year, week_number: m.week_number };
    });
    return [...dbMaterials, ...studyMapped];
  }, [dbMaterials, studyMaterials, focusArea]);

  // Filtering Sequence: Category -> Search (matches any part) -> Level -> Subject -> Year/Week
  const catFiltered = useMemo(() => allContent.filter(m => m.category === activeTab), [allContent, activeTab]);
  
  const searchFiltered = useMemo(() => {
      if (!searchQuery) return catFiltered;
      return catFiltered.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [catFiltered, searchQuery]);

  const levelsAvailable = useMemo(() => Array.from(new Set(searchFiltered.map(m => m.level).filter(Boolean))), [searchFiltered]);
  const levelFiltered = useMemo(() => selectedLevel === "none" ? searchFiltered : searchFiltered.filter(m => m.level === selectedLevel), [searchFiltered, selectedLevel]);

  const subjectsAvailable = useMemo(() => Array.from(new Set(levelFiltered.map(m => m.subject).filter(Boolean))), [levelFiltered]);
  const subjectFiltered = useMemo(() => selectedSubject === "none" ? levelFiltered : levelFiltered.filter(m => m.subject === selectedSubject), [levelFiltered, selectedSubject]);

  const specificsAvailable = useMemo(() => {
      const field = activeTab.includes('PYQs') ? 'year' : 'week_number';
      return Array.from(new Set(subjectFiltered.map(m => m[field as keyof ContentItem]?.toString()).filter(Boolean))).sort().reverse();
  }, [subjectFiltered, activeTab]);

  const finalContent = useMemo(() => {
      if (selectedWeekOrYear === "none") return subjectFiltered;
      const field = activeTab.includes('PYQs') ? 'year' : 'week_number';
      return subjectFiltered.filter(m => m[field as keyof ContentItem]?.toString() === selectedWeekOrYear);
  }, [subjectFiltered, selectedWeekOrYear, activeTab]);

  const displayedContent = showAll ? finalContent : finalContent.slice(0, 6);

  return (
    <div className="flex flex-col min-h-full bg-white font-sans text-slate-900">
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
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
                          <button key={category} onClick={() => { setActiveTab(category); setShowAll(false); setSelectedLevel("none"); setSelectedSubject("none"); setSelectedWeekOrYear("none"); setSearchQuery(""); }} className={cn("pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 px-1", activeTab === category ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-slate-700")}>
                            {category}
                          </button>
                        ))}
                   </div>
              </div>
          )}
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
        {viewingItem ? (
            <div className="w-full bg-slate-50 rounded-lg border h-[80vh] overflow-hidden">
                 <iframe src={viewingItem.url || ''} className="w-full h-full border-0" title="Viewer" />
            </div>
        ) : (
            /* SECTOR BACKGROUND */
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                        <FileText className="h-5 w-5 text-blue-600" />
                        {activeTab}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search resources..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-white border-slate-200 text-sm" />
                        </div>
                        {catFiltered.length > 6 && (
                            <button className="text-sm font-medium text-blue-600 hover:underline shrink-0" onClick={() => setShowAll(!showAll)}>
                                {showAll ? 'Show Less' : 'View All →'}
                            </button>
                        )}
                    </div>
                </div>

                {/* PROGRESSIVE FILTERS: Level -> Subject -> Specifics */}
                {showAll && (
                  <div className="flex flex-wrap items-center gap-3 mb-8 animate-in fade-in">
                      {levelsAvailable.length > 0 && (
                          <Select value={selectedLevel} onValueChange={(val) => { setSelectedLevel(val); setSelectedSubject("none"); setSelectedWeekOrYear("none"); }}>
                              <SelectTrigger className="w-[160px] h-9 bg-white border-slate-200 text-sm"><SelectValue placeholder="Academic Level" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="none">All Levels</SelectItem>
                                  {levelsAvailable.map(l => <SelectItem key={l} value={l!}>{l}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      )}

                      {selectedLevel !== "none" && subjectsAvailable.length > 0 && (
                          <>
                              <ChevronRight className="h-4 w-4 text-slate-300" />
                              <Select value={selectedSubject} onValueChange={(val) => { setSelectedSubject(val); setSelectedWeekOrYear("none"); }}>
                                  <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="none">All Subjects</SelectItem>
                                      {subjectsAvailable.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </>
                      )}

                      {selectedSubject !== "none" && specificsAvailable.length > 0 && (
                          <>
                              <ChevronRight className="h-4 w-4 text-slate-300" />
                              <Select value={selectedWeekOrYear} onValueChange={setSelectedWeekOrYear}>
                                  <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200 text-sm">
                                      <SelectValue placeholder={activeTab.includes('PYQs') ? "Year" : "Week"} />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="none">{activeTab.includes('PYQs') ? "All Years" : "All Weeks"}</SelectItem>
                                      {specificsAvailable.map(v => <SelectItem key={v} value={v!}>{v}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </>
                      )}
                  </div>
                )}
                
                {(loading || studyLoading) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1,2,3].map(i => <div key={i} className="h-[180px] bg-white rounded-lg border" />)}
                  </div>
                ) : displayedContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedContent.map((item) => <ContentCard key={item.id} item={item} handleOpen={setViewingItem} isIITM={isIITM} />)}
                    </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-500 font-normal">No resources found matching these filters.</p>
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
