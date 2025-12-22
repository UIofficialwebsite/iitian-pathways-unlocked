import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Calendar, Filter, X, ChevronRight, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

// --- Tab Configuration ---
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
  created_at?: string;
}

// --- Card Component (Updated for better metadata alignment) ---
const ContentCard: React.FC<{ item: ContentItem; handleOpen: (item: ContentItem) => void }> = ({ item, handleOpen }) => {
    const thumbnailUrl = `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80`;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.url) window.open(item.url, '_blank');
    };

    return (
        <Card className="group bg-white border-[#e2e8f0] rounded-lg p-4 flex gap-5 transition-all duration-200 hover:shadow-lg h-[167px] cursor-default overflow-hidden">
            <div className="w-[100px] h-[135px] bg-[#1e293b] rounded flex-shrink-0 overflow-hidden shadow-sm">
                <img src={thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-90" />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <div className="mb-1">
                    <h3 className="text-[1.05rem] font-semibold text-[#0f172a] leading-tight mb-1 group-hover:text-[#1d4ed8] transition-colors line-clamp-2">
                        {item.title}
                    </h3>
                    {(item.year || item.session || item.shift) && (
                        <p className="text-[0.75rem] text-[#64748b] flex items-center gap-1 mt-1 truncate">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            {item.year || ''} {item.session || ''} {item.shift || ''}
                        </p>
                    )}
                </div>

                <div className="flex gap-1.5 mb-3 mt-auto">
                    <span className="px-2 py-0.5 rounded-sm text-[0.7rem] font-bold uppercase bg-red-50 text-red-600 border border-red-100">PDF</span>
                    <span className="px-2 py-0.5 rounded-sm text-[0.7rem] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-100 truncate">
                        {item.subject?.toUpperCase() || 'GENERAL'}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => handleOpen(item)}
                        className="flex-grow h-8 text-[0.8rem] font-semibold text-[#0f172a] border-[#e2e8f0] hover:border-[#1d4ed8] hover:text-[#1d4ed8] hover:bg-[#f0f7ff] rounded-md transition-all shadow-none"
                    >
                        View
                    </Button>
                    <button onClick={handleDownload} className="bg-[#1d4ed8] hover:bg-[#1e3a8a] w-8 h-8 rounded-md flex items-center justify-center transition-colors">
                        <Download className="h-4 w-4 text-white" strokeWidth={2.5} />
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
  
  // --- States for Tabs and Layout ---
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  const [showAll, setShowAll] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);

  // --- States for Filter Logic ---
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"new" | "old">("new");

  const focusArea = profile?.program_type || 'General';

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        const { data: pyqData } = await supabase.from('pyqs').select('*').eq('exam_type', focusArea).eq('is_active', true);
        const { data: notesData } = await supabase.from('notes').select('*').eq('exam_type', focusArea).eq('is_active', true);
        
        let iitmData: any[] = [];
        if (focusArea === 'IITM_BS') {
            const { data } = await supabase.from('iitm_branch_notes').select('*').eq('is_active', true);
            iitmData = data || [];
        }

        const combined: ContentItem[] = [
          ...(pyqData || []).map(p => ({
            id: p.id, title: p.title, subject: p.subject, url: p.file_link || p.content_url,
            category: 'PYQs (Previous Year Questions)', year: p.year, session: p.session, shift: p.shift, created_at: p.created_at
          })),
          ...(notesData || []).map(n => ({
            id: n.id, title: n.title, subject: n.subject, url: n.file_link || n.content_url,
            category: 'Short Notes and Mindmaps', created_at: n.created_at
          })),
          ...iitmData.map(i => ({
            id: i.id, title: i.title, subject: i.subject, url: i.file_link,
            category: 'Short Notes and Mindmaps', created_at: i.created_at
          }))
        ];
        setDbMaterials(combined);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [focusArea]);

  // --- Filter and Sort Memo ---
  const filteredContent = useMemo(() => {
    let list = [...dbMaterials, ...(studyMaterials || []).map(m => ({
        id: m.id, title: m.title, subject: m.subject || 'General', url: m.file_url,
        category: m.material_type === 'pyq' ? 'PYQs (Previous Year Questions)' : 'Short Notes and Mindmaps',
        created_at: m.created_at
    }))];

    // 1. Category Tab Filter
    list = list.filter(m => m.category === activeTab);

    // 2. Subject Filter
    if (subjectFilter !== "all") list = list.filter(m => m.subject === subjectFilter);

    // 3. Year Filter (Only for PYQs)
    if (activeTab.includes('PYQs') && yearFilter !== "all") {
        list = list.filter(m => m.year?.toString() === yearFilter);
    }

    // 4. Sort Logic
    list.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return sortOrder === "new" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [dbMaterials, studyMaterials, activeTab, subjectFilter, yearFilter, sortOrder]);

  // --- Dynamic Option Extraction ---
  const availableSubjects = useMemo(() => Array.from(new Set(dbMaterials.filter(m => m.category === activeTab && m.subject).map(m => m.subject as string))), [dbMaterials, activeTab]);
  const availableYears = useMemo(() => Array.from(new Set(dbMaterials.filter(m => m.category === activeTab && m.year).map(m => m.year?.toString() as string))).sort().reverse(), [dbMaterials, activeTab]);

  const displayedContent = showAll ? filteredContent : filteredContent.slice(0, 6);

  return (
    <div className="flex flex-col min-h-full bg-white font-sans">
      {/* Header & Tabs */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-5 mb-4">
              <div className="flex items-center gap-4">
                   <Button variant="ghost" size="icon" className="-ml-2 h-10 w-10 rounded-full" onClick={() => viewingItem ? setViewingItem(null) : navigate(-1)}>
                      <ArrowLeft className="h-6 w-6" />
                   </Button>
                   <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{viewingItem ? viewingItem.title : 'UI Library'}</h1>
              </div>
          </div>
          {!viewingItem && (
              <div className="px-4 md:px-8">
                   <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
                        {contentCategories.map((category) => (
                          <button key={category} onClick={() => { setActiveTab(category); setShowAll(false); setSubjectFilter("all"); setYearFilter("all"); }} className={cn("pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-[3px] px-1", activeTab === category ? "text-royal border-royal" : "text-gray-500 border-transparent hover:text-gray-700")}>
                            {category}
                          </button>
                        ))}
                   </div>
              </div>
          )}
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
        {viewingItem ? (
            <div className="w-full bg-white rounded-lg border shadow-sm h-[80vh] overflow-hidden">
                 <iframe src={viewingItem.url || ''} className="w-full h-full border-0" title="Viewer" />
            </div>
        ) : (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-6 md:p-8">
                {/* --- PREMIUM FILTER BAR --- */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-700 rounded-lg"><FileText className="h-5 w-5 text-white" /></div>
                            <h2 className="text-lg font-bold text-[#0f172a] tracking-tight">{activeTab}</h2>
                        </div>

                        {/* Filter Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Sort Toggle */}
                            <Button 
                                variant="outline" size="sm" 
                                className="h-9 gap-2 border-[#e2e8f0] bg-white text-xs font-bold"
                                onClick={() => setSortOrder(sortOrder === "new" ? "old" : "new")}
                            >
                                {sortOrder === "new" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                                {sortOrder === "new" ? "Newest First" : "Oldest First"}
                            </Button>

                            {/* Dynamic Subject Select */}
                            {availableSubjects.length > 0 && (
                                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                    <SelectTrigger className="w-[140px] h-9 bg-white border-[#e2e8f0] text-xs font-bold">
                                        <SelectValue placeholder="Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                        {availableSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}

                            {/* Secondary Year Filter (Appears if subject is selected or for PYQs) */}
                            {(activeTab.includes('PYQs') && availableYears.length > 0) && (
                                <Select value={yearFilter} onValueChange={setYearFilter}>
                                    <SelectTrigger className="w-[120px] h-9 bg-white border-[#e2e8f0] text-xs font-bold">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}

                            {filteredContent.length > 6 && (
                                <button className="text-[0.85rem] font-bold text-[#1d4ed8] hover:underline uppercase" onClick={() => setShowAll(!showAll)}>
                                    {showAll ? 'Show Less' : 'View All →'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Active Filter Chips */}
                    {(subjectFilter !== "all" || yearFilter !== "all") && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-2">Active:</span>
                            {subjectFilter !== "all" && (
                                <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
                                    {subjectFilter} <X className="h-3 w-3 cursor-pointer" onClick={() => setSubjectFilter("all")} />
                                </Badge>
                            )}
                            {yearFilter !== "all" && (
                                <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-100 px-3 py-1">
                                    {yearFilter} <X className="h-3 w-3 cursor-pointer" onClick={() => setYearFilter("all")} />
                                </Badge>
                            )}
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-500 hover:text-red-500" onClick={() => {setSubjectFilter("all"); setYearFilter("all");}}>
                                Clear All
                            </Button>
                        </div>
                    )}
                </div>
                
                {/* Content Grid */}
                {(loading || studyLoading) ? (
                  <div className="text-center py-20 text-[#64748b] font-medium italic animate-pulse">Scanning the library...</div>
                ) : displayedContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedContent.map((item) => <ContentCard key={item.id} item={item} handleOpen={setViewingItem} />)}
                    </div>
                ) : (
                  <div className="text-center py-24 bg-white/50 rounded-lg border border-dashed border-[#e2e8f0]">
                    <div className="max-w-xs mx-auto space-y-3">
                        <Filter className="h-10 w-10 text-slate-300 mx-auto" />
                        <p className="text-[#64748b] font-semibold">No results found with these filters.</p>
                        <Button variant="link" className="text-blue-700 p-0" onClick={() => {setSubjectFilter("all"); setYearFilter("all");}}>Reset Filters</Button>
                    </div>
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
