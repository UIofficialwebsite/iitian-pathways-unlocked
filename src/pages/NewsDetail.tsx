import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

const NewsDetail = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const navigate = useNavigate();
  const { newsUpdates, contentLoading } = useBackend();

  const newsItem = useMemo(() => 
    newsUpdates.find(item => item.id === newsId),
    [newsUpdates, newsId]
  );

  if (contentLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-['Inter']">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-['Inter']">
        <h1 className="text-2xl font-bold mb-4">Announcement Not Found</h1>
        <button 
          onClick={() => navigate(-1)}
          className="bg-black text-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.05em]"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Inter'] text-[#1a1a1a]">
      <NavBar />
      
      {/* Main Container - Adjusted padding to match design */}
      <main className="flex justify-center pt-[100px] pb-[60px] px-5">
        <div className="w-full max-w-[800px]">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex gap-2 mb-6 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#888]">
            <Link to="/exam-preparation/iitm-bs" className="text-black no-underline hover:underline">
              Announcements
            </Link>
            <span>/</span>
            <span className="text-[#666]">{newsItem.tag || "General"}</span>
          </nav>

          {/* Article Header */}
          <h1 className="text-[36px] font-[800] leading-[1.1] text-black mb-[30px] tracking-[-0.02em]">
            {newsItem.title}
            {newsItem.is_important && (
              <span className="inline-block align-middle ml-2 text-[10px] font-bold px-2 py-[2px] border border-[#991b1b] bg-[#fee2e2] text-[#991b1b] uppercase">
                Urgent
              </span>
            )}
            {newsItem.is_featured && !newsItem.is_important && (
              <span className="inline-block align-middle ml-2 text-[10px] font-bold px-2 py-[2px] border border-[#854d0e] bg-[#fefce8] text-[#854d0e] uppercase">
                Featured
              </span>
            )}
          </h1>

          {/* Meta Data Strip - Light Teal */}
          <div className="flex justify-between items-center bg-[#e6f7f7] px-5 py-[15px] border-y border-black mb-10">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-bold text-[#2c4a4a] tracking-[0.03em]">
                Publication Date
              </span>
              <span className="block text-[13px] font-normal text-black mt-0.5">
                {new Date(newsItem.date_time || newsItem.created_at).toLocaleDateString("en-US", {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex flex-col text-center">
              <span className="text-[11px] uppercase font-bold text-[#2c4a4a] tracking-[0.03em]">
                Document Level
              </span>
              <span className="block text-[13px] font-normal text-black mt-0.5">
                {[newsItem.level, newsItem.branch].filter(Boolean).join(" & ") || "All Levels"}
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-[11px] uppercase font-bold text-[#2c4a4a] tracking-[0.03em]">
                Classification
              </span>
              <span className="block text-[13px] font-normal text-black mt-0.5">
                Official Circular
              </span>
            </div>
          </div>

          {/* Article Content */}
          <article className="text-[16px] leading-[1.75] text-[#334155] mb-10">
            <div className="whitespace-pre-wrap font-['Inter']">
              {newsItem.content || newsItem.description}
            </div>
          </article>

          <hr className="h-px bg-[#e5e7eb] border-0 my-10" />

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-5">
            <button 
              onClick={() => window.print()}
              className="bg-white text-black border border-black px-6 py-3 text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-gray-50 transition-colors"
            >
              Print Circular
            </button>
            
            {newsItem.button_url && newsItem.button_text && (
              <a 
                href={newsItem.button_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-black text-white px-6 py-3 text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-[#333] transition-colors inline-flex items-center gap-1"
              >
                {newsItem.button_text} ↗
              </a>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
