import React from "react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { Link } from "react-router-dom";

interface NewsTabProps {
  sortOrder?: 'recent' | 'oldest';
}

const NewsTab = ({ sortOrder = 'recent' }: NewsTabProps) => {
  const { newsUpdates, contentLoading } = useBackend();

  // Filter news for IITM BS and sort
  const iitmNews = newsUpdates
    .filter(news => 
      news.exam_type === 'IITM_BS' || news.exam_type === 'IITM BS' || !news.exam_type
    )
    .sort((a, b) => {
      const dateA = new Date(a.date_time || a.created_at).getTime();
      const dateB = new Date(b.date_time || b.created_at).getTime();
      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

  if (contentLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (iitmNews.length === 0) {
    return (
      <div className="text-center py-12 font-['Inter']">
        <p className="text-gray-500">No official announcements at this time.</p>
      </div>
    );
  }

  return (
    <div className="w-full font-['Inter'] bg-white">
      <h2 className="text-[14px] font-semibold text-black uppercase tracking-[0.05em] mb-5">
        Official Announcements
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black min-w-[600px]">
          <thead>
            <tr className="bg-[#e6f7f7]">
              <th className="border border-black px-5 py-4 text-left font-bold text-[11px] uppercase tracking-[0.05em] text-[#2c4a4a] w-[75%]">
                Announcement Detail
              </th>
              <th className="border border-black px-5 py-4 text-right font-bold text-[11px] uppercase tracking-[0.05em] text-[#2c4a4a] w-[25%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {iitmNews.map((newsItem) => (
              <tr key={newsItem.id} className="hover:bg-gray-50 transition-colors">
                <td className="border border-black p-5 align-top">
                  <div className="text-[18px] font-bold text-black mb-2 leading-tight">
                    {newsItem.title}
                  </div>
                  <p className="text-[14px] text-[#4b5563] leading-[1.6] mb-4 line-clamp-2">
                    {newsItem.description}
                  </p>
                  
                  {/* Tags Row */}
                  <div className="flex flex-wrap gap-2">
                    {newsItem.is_important && (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 border border-[#991b1b] bg-[#fef2f2] text-[#991b1b]">
                        Important
                      </span>
                    )}
                    {newsItem.is_featured && (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 border border-[#854d0e] bg-[#fefce8] text-[#854d0e]">
                        Featured
                      </span>
                    )}
                    {newsItem.tag && (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 border border-black bg-white text-black">
                        {newsItem.tag}
                      </span>
                    )}
                    {(newsItem.level || newsItem.branch) && (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 border border-black bg-white text-black">
                        {[newsItem.level, newsItem.branch].filter(Boolean).join(' - ')}
                      </span>
                    )}
                    {newsItem.date_time && (
                      <span className="text-[10px] font-medium uppercase px-2.5 py-1 border border-gray-200 text-gray-500">
                        {new Date(newsItem.date_time).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </td>
                
                <td className="border border-black p-5 align-top">
                  <div className="flex flex-col gap-2.5 items-end">
                    {/* Primary Button: Open Portal / External Link */}
                    {newsItem.button_url && newsItem.button_text && (
                      <a 
                        href={newsItem.button_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2.5 text-[11px] font-bold text-white bg-black border border-black uppercase tracking-[0.05em] hover:bg-[#333333] transition-all w-[140px] text-center no-underline"
                      >
                        {newsItem.button_text} ↗
                      </a>
                    )}
                    
                    {/* Secondary Button: View Details */}
                    <Link 
                      to={`/news/${newsItem.id}`}
                      className="inline-flex items-center justify-center px-4 py-2.5 text-[11px] font-bold text-black bg-white border border-black uppercase tracking-[0.05em] hover:bg-[#f8f9fa] transition-all w-[140px] text-center no-underline"
                    >
                      View Details
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsTab;
