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
    // Reduced height from min-h-[280px] to min-h-[200px] and adjusted padding
    <div className="relative overflow-hidden bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] border-b min-h-[200px] flex items-center font-sans">
      {/* Background Decorative Elements - Scaled down for the new height */}
      <div className="absolute -top-[120px] -left-[60px] w-[250px] h-[250px] bg-slate-300/25 rounded-full blur-[50px] pointer-events-none" />
      <div className="absolute -bottom-[40px] right-[12%] w-[200px] h-[200px] bg-purple-200/30 rounded-[40%_60%_70%_30%] blur-[50px] pointer-events-none" />
      <div className="absolute top-8 right-[18%] w-[120px] h-[80px] bg-white/20 border border-white/30 rounded-lg -rotate-12 pointer-events-none hidden md:block" />

      {/* Glassy Overlay Layer */}
      <div className="absolute inset-0 backdrop-blur-[6px] bg-white/5 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb - Reduced text size and spacing */}
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
                <Link to="/exam-preparation" className="text-gray-400 hover:text-black uppercase text-[10px] font-bold tracking-widest transition-colors">
                  School Prep
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={examPath} className="text-gray-400 hover:text-black uppercase text-[10px] font-bold tracking-widest transition-colors">
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
                  <BreadcrumbPage className="uppercase text-[10px] font-bold tracking-widest text-gray-600">
                    {getTabDisplayName(currentTab)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Heading - Reduced font size and zoom effect */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#383838] mb-5 tracking-tight leading-tight uppercase">
          {displayTitle}
        </h1>

        {/* Share Button - Removed hover translations and reduced padding */}
        <ShareButton
          url={shareUrl}
          title={displayTitle}
          description={`${examName} preparation resources`}
          variant="outline"
          size="sm"
          showText={true}
          // Removed hover:translate-y and simplified shadows
          className="bg-white border-gray-100 text-gray-700 font-bold text-xs px-4 py-2.5 h-auto shadow-sm backdrop-blur-none hover:bg-white active:bg-gray-50 transition-none"
        />
      </div>
    </div>
  );
};

export default ExamPrepHeader;
