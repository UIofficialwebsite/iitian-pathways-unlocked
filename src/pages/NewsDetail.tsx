import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Tag, ExternalLink } from "lucide-react";

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4 font-['Inter']">News Item Not Found</h1>
        <Button onClick={() => navigate(-1)} className="bg-black text-white font-['Inter']">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      <NavBar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8 pl-0 hover:bg-transparent hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Announcements
        </Button>

        {/* Header Section */}
        <header className="mb-10 border-b border-gray-100 pb-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {newsItem.is_important && (
              <Badge className="bg-[#fef2f2] text-[#991b1b] border border-[#991b1b] rounded-none hover:bg-[#fef2f2] px-3 py-1 text-[11px] uppercase tracking-wider">
                Important
              </Badge>
            )}
            {newsItem.is_featured && (
              <Badge className="bg-[#fefce8] text-[#854d0e] border border-[#854d0e] rounded-none hover:bg-[#fefce8] px-3 py-1 text-[11px] uppercase tracking-wider">
                Featured
              </Badge>
            )}
            {newsItem.tag && (
              <Badge variant="outline" className="border-gray-900 text-gray-900 rounded-none px-3 py-1 text-[11px] uppercase tracking-wider">
                {newsItem.tag}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
            {newsItem.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(newsItem.date_time || newsItem.created_at).toLocaleDateString("en-US", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            {(newsItem.branch || newsItem.level) && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>
                  {[newsItem.branch, newsItem.level].filter(Boolean).join(" • ")}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content Section */}
        <article className="prose prose-slate max-w-none prose-headings:font-['Inter'] prose-p:font-['Inter']">
          <div className="whitespace-pre-wrap text-lg text-gray-700 leading-8">
            {newsItem.content || newsItem.description}
          </div>
        </article>

        {/* Action Button (if exists) */}
        {newsItem.button_url && newsItem.button_text && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <a 
              href={newsItem.button_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-all rounded-sm"
            >
              {newsItem.button_text} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NewsDetail;
