import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";

// --- Configuration ---
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
  updated_at?: string;
}

const ContentCard: React.FC<{ item: ContentItem; handleOpen: (item: ContentItem) => void }> = ({ item, handleOpen }) => {
    // Professional placeholder image
    const thumbnailUrl = `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80`;

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.url) window.open(item.url, '_blank');
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Updated Recently";
        return `Updated ${new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    };

    return (
        <Card 
            className="group bg-white border-[#e2e8f0] rounded-lg p-4 flex gap-5 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] h-[167px] cursor-default"
            // hover:border-[#1d4ed8] removed to prevent border highlight
        >
            {/* Left Side: Thumbnail */}
            <div className="w-[100px] h-[135px] bg-[#1e293b] rounded flex-shrink-0 overflow-hidden shadow-[2px_4px_8px_rgba(0,0,0,0.1)]">
                <img 
                    src={thumbnailUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover opacity-90"
                />
            </div>

            {/* Right Side: Content Area */}
            <div className="flex flex-col flex-1">
                <div className="mb-1">
                    <h3 className="text-[1.05rem] font-semibold text-[#0f172a] leading-tight mb-1 group-hover:text-[#1d4ed8] transition-colors line-clamp-2">
                        {item.title}
                    </h3>
                    <p className="text-[0.8rem] text-[#64748b]">
                        {formatDate(item.updated_at)}
                    </p>
                </div>

                {/* Tags Group */}
                <div className="flex gap-1.5 mb-3.5 mt-2">
                    <span className="px-2 py-0.5 rounded-[3px] text-[0.7rem] font-bold uppercase bg-[#fef2f2] text-[#dc2626] border border-[#fee2e2]">
                        PDF
                    </span>
                    <span className="px-2 py-0.5 rounded-[3px] text-[0.7rem] font-bold uppercase bg-[#eff6ff] text-[#1d4ed8] border border-[#dbeafe]">
                        {item.subject?.substring(0, 2).toUpperCase() || 'EN'}
                    </span>
                </div>

                {/* Actions Row */}
                <div className="mt-auto flex gap-2">
                    <Button 
                        variant="outline"
                        onClick={() => handleOpen(item)}
                        className="flex-grow h-9 text-[0.85rem] font-semibold text-[#0f172a] border-[#e2e8f0] hover:border-[#1d4ed8] hover:text-[#1d4ed8] hover:bg-[#f0f7ff] rounded-md transition-all shadow-none"
                    >
                        View Content
                    </Button>
                    <button 
                        onClick={handleDownload}
                        className="bg-[#1d4ed8] hover:bg-[#1e3a8a] w-9 h-9 rounded-md flex items-center justify-center transition-colors shrink-0"
                        title="Download"
                    >
                        <Download className="h-[18px] w-[18px] text-white" strokeWidth={2.8} />
                    </button>
                </div>
            </div>
        </Card>
    );
};

const LibrarySection: React.FC<{ profile: Tables<'profiles'> | null }> = ({ profile }) => {
  const navigate = useNavigate();
  const { materials, loading } = useStudyMaterials(); 
  
  const [activeTab, setActiveTab] = useState(contentCategories[0]);
  const [showAll, setShowAll] = useState(false);
  const [viewingItem, setViewingItem] = useState<ContentItem | null>(null);
  
  const allCategorizedContent = useMemo(() => {
    const contentMap: { [key: string]: ContentItem[] } = {};
    contentCategories.forEach(cat => contentMap[cat] = []);
    if (!materials) return contentMap;

    const userFocusProgram = profile?.program_type || 'General';
    const filteredMaterials = materials.filter(item => {
        if (!item.exam_category || item.exam_category === 'General') return true;
        return item.exam_category === userFocusProgram;
    });

    filteredMaterials.forEach(item => {
        const commonProps = {
            id: item.id,
            title: item.title,
            subject: item.subject || 'General',
            url: item.file_url,
            category: '',
            updated_at: item.created_at
        };

        if (item.material_type === 'pyq') {
             contentMap['PYQs (Previous Year Questions)'].push({ ...commonProps, category: 'PYQs' });
        } else if (item.material_type === 'note' || item.material_type === 'mindmap') {
             contentMap['Short Notes and Mindmaps'].push({ ...commonProps, category: 'Notes' });
        } else if (item.material_type === 'question_bank') {
             contentMap['Free Question Bank'].push({ ...commonProps, category: 'Bank' });
        }
    });
    return contentMap;
  }, [profile, materials]);

  const fullContent = allCategorizedContent[activeTab] || [];
  const displayedContent = showAll ? fullContent : fullContent.slice(0, 6);

  return (
    <div className="flex flex-col min-h-full bg-white font-sans">
      {/* HEADER SECTION - UNCHANGED */}
      <div className="bg-white border-b sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-5 mb-4">
              <div className="flex items-center gap-4">
                   <Button 
                        variant="ghost" size="icon" className="-ml-2 h-10 w-10 text-black rounded-full"
                        onClick={() => viewingItem ? setViewingItem(null) : navigate(-1)}
                   >
                      <ArrowLeft className="h-6 w-6" />
                   </Button>
                   <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                       {viewingItem ? viewingItem.title : 'UI Library'}
                   </h1>
              </div>
          </div>

          {!viewingItem && (
              <div className="px-4 md:px-8 pb-0">
                   <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
                        {contentCategories.map((category) => (
                          <button
                            key={category}
                            onClick={() => { setActiveTab(category); setShowAll(false); }}
                            className={cn(
                              "pb-3 text-sm font-medium transition-all whitespace-nowrap border-b-[3px] px-1",
                              activeTab === category ? "text-royal border-royal" : "text-gray-500 border-transparent hover:text-gray-700"
                            )}
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
            <div className="w-full bg-white rounded-lg border shadow-sm overflow-hidden h-[80vh]">
                 <iframe src={viewingItem.url || ''} className="w-full h-full border-0" title="Viewer" />
            </div>
        ) : (
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-6 md:p-8">
                <div className="section-header flex justify-between items-center mb-6">
                    <div className="header-title flex items-center gap-3">
                        <FileText className="h-[22px] w-[22px] text-[#1d4ed8]" strokeWidth={2.5} />
                        <h2 className="text-[1.1rem] font-bold text-[#0f172a] uppercase tracking-wide">
                            {activeTab}
                        </h2>
                    </div>
                    {fullContent.length > 0 && (
                        <button 
                            className="view-all-btn text-[0.85rem] font-bold text-[#1d4ed8] hover:opacity-70 transition-opacity uppercase"
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'SHOW LESS' : 'VIEW ALL →'}
                        </button>
                    )}
                </div>
                
                {loading ? (
                  <div className="text-center py-20 text-[#64748b]">Fetching premium resources...</div>
                ) : displayedContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {displayedContent.map((item) => (
                            <ContentCard key={item.id} item={item} handleOpen={(i) => setViewingItem(i)} />
                        ))}
                    </div>
                ) : (
                  <div className="text-center py-20 text-[#64748b]">
                    <p>No resources found for your focus area.</p>
                  </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;
