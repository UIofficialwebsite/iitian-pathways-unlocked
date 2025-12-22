import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Download, Calendar, Filter } from "lucide-react";
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

// --- Original Header Tabs Restored ---
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
        <Card className="group bg-white border-[#e2e8f0] rounded-lg p-4 flex gap-5 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] h-[167px] cursor-default overflow-hidden">
            <div className="w-[100px] h-[135px] bg-[#1e293b] rounded flex-shrink-0 overflow-hidden shadow-[2px_4px_8px_rgba(0,0,0,0.1)]">
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

                <div className="flex gap-1.5 mb-3.5 mt-2">
                    <span className="px-2 py-0.5 rounded-[3px] text-[0.7rem] font-bold uppercase bg-[#fef2f2] text-[#dc2626] border border-[#fee2e2]">PDF</span>
                    <span className="px-2 py-0.5 rounded-[3px] text-[0.7rem] font-bold uppercase bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe] truncate">
                        {item.subject?.substring(0, 10).toUpperCase() || 'GENERAL'}
                    </span>
                </div>

                <div className="mt-auto flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => handleOpen(item)}
                        className="flex-grow h-9 text-[0.85rem] font-semibold text-[#0f172a] border-[#e2e8f0] hover:border-[#1d4ed8] hover:text-[#1d4ed8] hover:bg-[#f0f7ff] rounded-md transition-all shadow-none"
                    >
                        View Content
                    </Button>
                    <button onClick={handleDownload} className="bg-[#1d4ed8] hover:bg-[#1e3a8a] w-9 h-9 rounded-md flex items-center justify-center transition-colors shrink-0">
                        <Download className="h-[18px] w-[18px] text-white" strokeWidth={2.8} />
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
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const focusArea = profile?.program_type || 'General';

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        // Strict Filtering by Focus Area
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
          // Merged IITM Branch Notes into Short Notes as requested
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
      .filter(m => !m.exam_category || m.exam_category === focusArea) // Focus filtering
      .map(m => {
        let cat = 'Other';
        if (m.material_type === 'note' || m.material_type === 'mindmap') cat = 'Short Notes and Mindmaps';
        else if (m.material_type === 'pyq') cat = 'PYQs (Previous Year Questions)';
        else if (m.material_type === 'question_bank') cat = 'Free Question Bank';
        
        if (m.title.toLowerCase().includes('lecture')) cat = 'Free Lectures';
        if (m.title.toLowerCase().includes('ui')) cat = 'UI ki Padhai';
        return { id: m.id, title: m.title, subject: m.subject, url: m.file_url, category: cat };
    });
    return [...dbMaterials, ...studyMapped];
  }, [dbMaterials, studyMaterials, focusArea]);

  const filteredContent = useMemo(() => {
    let res = allContent.filter(m => m.category === activeTab);
    if (subjectFilter !== "all") res = res.filter(m => m.subject === subjectFilter);
    return res;
  }, [allContent, activeTab, subjectFilter]);

  const availableSubjects = useMemo(() => {
    return Array.from(new Set(allContent.filter(m => m.category === activeTab && m.subject).map(m => m.subject as string)));
  }, [allContent, activeTab]);

  const displayedContent = showAll ? filteredContent : filteredContent.slice(0, 6);

  return (
    <div className="flex flex-col min-h-full bg-white font-sans">
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-5 mb-4">
              <div className="flex items-center gap-4">
                   <Button variant="ghost" size="icon" className="-ml-2 h-10 w-10 text-black rounded-full" onClick={() => viewingItem ? setViewingItem(null) : navigate(-1)}>
                      <ArrowLeft className="h-6 w-6" />
                   </Button>
                   <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{viewingItem ? viewingItem.title : 'UI Library'}</h1>
              </div>
          </div>
          {!viewingItem && (
              <div className="px-4 md:px-8 pb-0">
                   <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
                        {contentCategories.map((category) => (
                          <button key={category} onClick={() => { setActiveTab(category); setShowAll(false); setSubjectFilter("all"); }} className={cn("pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-[3px] px-1", activeTab === category ? "text-royal border-royal" : "text-gray-500 border-transparent hover:text-gray-700")}>
                            {category}
                          </button>
                        ))}
                   </div>
              </div>
          )}
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
        {viewingItem ? (
            <div className="w-full bg-white rounded-lg border shadow-sm overflow-hidden h-[80vh]">
                 <iframe src={viewingItem.url || ''} className="w-full h-full border-0" title="Viewer" />
            </div>
        ) : (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-[22px] w-[22px] text-[#1d4ed8]" strokeWidth={2.5} />
                        <h2 className="text-[1.1rem] font-bold text-[#0f172a] uppercase tracking-wide">{activeTab}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        {showAll && availableSubjects.length > 0 && (
                            <div className="flex items-center gap-2">
                                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                    <SelectTrigger className="w-[160px] h-9 bg-white border-[#e2e8f0] text-xs font-semibold">
                                        <SelectValue placeholder="Filter Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                        {availableSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {filteredContent.length > 6 && (
                            <button className="text-[0.85rem] font-bold text-[#1d4ed8] hover:opacity-70 transition-opacity uppercase" onClick={() => setShowAll(!showAll)}>
                                {showAll ? 'SHOW LESS' : 'VIEW ALL →'}
                            </button>
                        )}
                    </div>
                </div>
                
                {(loading || studyLoading) ? (
                  <div className="text-center py-20 text-[#64748b]">Loading library...</div>
                ) : displayedContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayedContent.map((item) => <ContentCard key={item.id} item={item} handleOpen={setViewingItem} />)}
                    </div>
                ) : (
                  <div className="text-center py-20 text-[#64748b]"><p>No resources found for your focus area.</p></div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
