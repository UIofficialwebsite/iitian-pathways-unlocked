import React from "react";
import { Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ExamPrepHeaderProps {
  examName: string;
  examPath: string;
  currentTab: string;
  pageTitle?: string;
}

const ExamPrepHeader: React.FC<ExamPrepHeaderProps> = ({
  examName,
  examPath,
  currentTab,
  pageTitle,
}) => {
  const displayTitle = pageTitle || `${examName} Preparation`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const getTabDisplayName = (tab: string) => {
    const tabNames: Record<string, string> = {
      notes: "Notes",
      pyqs: "Previous Year Papers",
      "study-groups": "Study Groups",
      "news-updates": "News & Updates",
      "important-dates": "Important Dates",
      syllabus: "Syllabus",
      tools: "Tools",
      courses: "Courses",
      news: "News",
      dates: "Important Dates",
    };
    return tabNames[tab] || tab;
  };

  return (
    <div className="relative overflow-hidden bg-white border-b border-blue-100 min-h-[180px] flex items-center font-sans">
      {/* --- GLASSY WHITE-BLUE BACKGROUND DESIGN --- */}
      
      {/* 1. Base Gradient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/80 via-white to-transparent pointer-events-none" />
      
      {/* 2. Floating Glass Orbs (Decorative) */}
      <div className="absolute -top-[100px] -left-[40px] w-[300px] h-[300px] bg-blue-100/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-[10%] w-[250px] h-[250px] bg-indigo-50/40 rounded-full blur-[60px] pointer-events-none" />
      
      {/* 3. Glassy Mesh / Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#1E3A8A 0.5px, transparent 0.5px), linear-gradient(90deg, #1E3A8A 0.5px, transparent 0.5px)`,
          backgroundSize: '40px 40px' 
        }}
      />

      {/* 4. Frosted Glass Overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-white/10 pointer-events-none" />

      {/* --- END BACKGROUND DESIGN --- */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Breadcrumb - Preserving original content/logic */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList className="flex-wrap gap-1">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-gray-500 hover:text-black transition-colors">
                  <Home className="h-3.5 w-3.5" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/exam-preparation" className="text-gray-500 hover:text-black uppercase text-[11px] font-normal tracking-wider transition-colors">
                  Exam Prep
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={examPath} className="text-gray-500 hover:text-black uppercase text-[11px] font-normal tracking-wider transition-colors">
                  Exams
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {currentTab && (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="uppercase text-[11px] font-normal tracking-wider text-gray-400">
                    {getTabDisplayName(currentTab)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Heading - Preserving original content/logic */}
        <h1 className="text-2xl md:text-3xl lg:text-[40px] font-bold text-[#383838] mb-5 tracking-tight leading-tight uppercase">
          {displayTitle}
        </h1>

        {/* Share Button - Preserving original content/logic */}
        <ShareButton
          url={shareUrl}
          title={displayTitle}
          description={`${examName} preparation resources`}
          variant="outline"
          size="sm"
          showText={true}
          className="bg-white border-gray-100 text-gray-700 font-bold text-xs px-5 py-2.5 h-auto shadow-sm transition-none hover:bg-white active:bg-gray-50 pointer-events-auto"
        />
      </div>
    </div>
  );
};

export default ExamPrepHeader;
