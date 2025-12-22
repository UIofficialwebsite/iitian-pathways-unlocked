import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Calendar, ChevronRight } from "lucide-react";
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
}

const ContentCard: React.FC<{ item: ContentItem; handleOpen: (item: ContentItem) => void }> = ({ item, handleOpen }) => {
    const thumbnailUrl = `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80`;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.url) window.open(item.url, '_blank');
    };

    return (
        <Card className="group bg-white border-slate-200 rounded-lg p-4 flex gap-5 transition-all hover:shadow-md h-[167px] cursor-default overflow-hidden">
            <div className="w-[100px] h-[135px] bg-slate-800 rounded flex-shrink-0 overflow-hidden shadow-sm">
                <img src={thumbnailUrl} alt={item.title} className="w-full h-full object-cover opacity-90" />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
                <div className="mb-1">
                    <h3 className="text-base font-medium text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.title}
                    </h3>
                    {(item.year || item.session || item.shift) && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            {item.year || ''} {item.session || ''} {item.shift || ''}
                        </p>
                    )}
                </div>

                <div className="flex gap-1.5 mb-3 mt-auto">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase bg-red-50 text-red-600 border border-red-100">PDF</span>
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-100 truncate">
                        {item.subject || 'General'}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => handleOpen(item)}
                        className="flex-grow h-8 text-xs font-normal text-slate-700 border-slate-200 hover:bg-slate-50 rounded-md shadow-none"
                    >
                        View Content
                    </Button>
                    <button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 w-8 h-8 rounded-md flex items-center justify-center transition-colors">
                        <Download className="h-4 w-4 text-white" strokeWidth={2} />
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

  const [selectedSubject, setSelectedSubject] = useState<string>("none");
  const [selectedYear, setSelectedYear] = useState<string>("none");

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
            category: 'PYQs (Previous Year Questions)', year: p.year, session: p.session, shift: p.shift
          })),
          ...(notesData || []).map(n => ({
            id: n.id, title: n.title, subject: n.subject, url: n.file_link || n.content_url,
            category: 'Short Notes and Mindmaps'
          })),
          ...iitmData.map(i => ({
            id: i.id, title: i.title, subject: i.subject, url: i.file_link,
            category: 'Short Notes and Mindmaps'
          }))
        ];
        setDbMaterials(combined);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [focusArea]);

  const allContent = useMemo(() => {
    const studyMapped = (studyMaterials || [])
      .filter(m => !m.exam_category || m.exam_category === focusArea)
      .map(m => {
        let cat = 'Other';
        if (m.material_type === 'note' || m.material_type === 'mindmap') cat = 'Short Notes and Mindmaps';
        else if (m.material_type === 'pyq') cat = 'PYQs (Previous Year Questions)';
        else if (m.material_type === 'question_bank') cat = 'Free Question Bank';
        
        if (m.title.toLowerCase().includes('lecture')) cat = 'Free Lectures';
        if (m.title.toLowerCase().includes('ui')) cat = 'UI ki Padhai';
        return { id: m.id, title: m.title, subject: m.subject || 'General', url: m.file_url, category: cat };
    });
    return [...dbMaterials, ...studyMapped];
  }, [dbMaterials, studyMaterials, focusArea]);

  const filteredByCategory = useMemo(() => allContent.filter(m => m.category === activeTab), [allContent, activeTab]);
  const subjectsAvailable = useMemo(() => Array.from(new Set(filteredByCategory.map(m => m.subject).filter(Boolean))), [filteredByCategory]);
  
  const filteredBySubject = useMemo(() => {
    if (selectedSubject === "none") return filteredByCategory;
    return filteredByCategory.filter(m => m.subject === selectedSubject);
  }, [filteredByCategory, selectedSubject]);

  const yearsAvailable = useMemo(() => Array.from(new Set(filteredBySubject.map(m => m.year?.toString()).filter(Boolean))).sort().reverse(), [filteredBySubject]);

  const finalContent = useMemo(() => {
    if (selectedYear === "none") return filteredBySubject;
    return filteredBySubject.filter(m => m.year?.toString() === selectedYear);
  }, [filteredBySubject, selectedYear]);

  const displayedContent = showAll ? finalContent : finalContent.slice(0, 6);

  return (
    <div className="flex flex-col min-h-full bg-white font-sans text-slate-900">
      {/* Header Tabs */}
      <div className="bg-white border-b sticky top-0 z-30">
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
                          <button 
                            key={category} 
                            onClick={() => { setActiveTab(category); setShowAll(false); setSelectedSubject("none"); setSelectedYear("none"); }} 
                            className={cn("pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 px-1", activeTab === category ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-slate-700")}
                          >
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
            <div className="space-y-6">
                {/* Fixed Section Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                        <FileText className="h-5 w-5 text-blue-600" />
                        {activeTab}
                    </h2>
                    {filteredByCategory.length > 6 && (
                        <button className="text-sm font-medium text-blue-600 hover:underline" onClick={() => setShowAll(!showAll)}>
                            {showAll ? 'Show Less' : 'View All →'}
                        </button>
                    )}
                </div>

                {/* Conditional Filters: Only show when showAll is true */}
                {showAll && (
                  <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
                      {subjectsAvailable.length > 0 && (
                          <Select value={selectedSubject} onValueChange={(val) => { setSelectedSubject(val); setSelectedYear("none"); }}>
                              <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-sm">
                                  <SelectValue placeholder="Select Subject" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="none">All Subjects</SelectItem>
                                  {subjectsAvailable.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      )}

                      {/* Progressive Disclosure: Second filter appears based on availability */}
                      {selectedSubject !== "none" && yearsAvailable.length > 0 && (
                          <>
                              <ChevronRight className="h-4 w-4 text-slate-300" />
                              <Select value={selectedYear} onValueChange={setSelectedYear}>
                                  <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200 text-sm">
                                      <SelectValue placeholder="Select Year" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="none">All Years</SelectItem>
                                      {yearsAvailable.map(y => <SelectItem key={y} value={y!}>{y}</SelectItem>)}
                                  </SelectContent>
                              </Select>
                          </>
                      )}
                  </div>
                )}
                
                {(loading || studyLoading) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-[167px] bg-slate-50 animate-pulse rounded-lg border" />)}
                  </div>
                ) : displayedContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedContent.map((item) => <ContentCard key={item.id} item={item} handleOpen={setViewingItem} />)}
                    </div>
                ) : (
                  <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-slate-500 font-normal">No resources found for your current selection.</p>
                    <Button variant="link" className="text-blue-600" onClick={() => { setSelectedSubject("none"); setSelectedYear("none"); }}>Reset Filters</Button>
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
