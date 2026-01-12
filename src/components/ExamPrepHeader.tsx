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
    <div className="relative overflow-hidden bg-gradient-to-br from-[#f0f4ff] to-[#faf5ff] border-b min-h-[280px] flex items-center">
      {/* Background Decorative Elements (Blobs) */}
      <div className="absolute -top-[100px] -left-[50px] w-[300px] h-[300px] bg-slate-300/30 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-[50px] right-[10%] w-[250px] h-[250px] bg-purple-200/40 rounded-[40%_60%_70%_30%] blur-[60px] pointer-events-none" />
      <div className="absolute top-10 right-[15%] w-[150px] h-[100px] bg-white/20 border border-white/30 rounded-xl -rotate-12 pointer-events-none hidden md:block" />

      {/* Glassy Overlay Effect */}
      <div className="absolute inset-0 backdrop-blur-[8px] bg-white/5 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb with refined styling */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList className="flex-wrap">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-gray-600 hover:text-black transition-colors">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/exam-preparation" className="text-gray-500 hover:text-black uppercase text-[11px] font-semibold tracking-wider transition-colors">
                  Exam Prep
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator>
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={examPath} className="text-gray-500 hover:text-black uppercase text-[11px] font-semibold tracking-wider transition-colors">
                  {examName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {currentTab && currentTab !== "notes" && (
              <>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="uppercase text-[11px] font-semibold tracking-wider text-gray-800">
                    {getTabDisplayName(currentTab)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Heading - Styled to match "Main Title" */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 tracking-tight">
          {displayTitle}
        </h1>

        {/* Share Button - Styled as Modern White Glass */}
        <ShareButton
          url={shareUrl}
          title={displayTitle}
          description={`${examName} preparation resources`}
          variant="outline"
          size="sm"
          showText={true}
          className="bg-white/80 hover:bg-white border-white/50 text-gray-700 font-semibold px-6 py-5 h-auto shadow-sm backdrop-blur-sm transition-all hover:translate-y-[-1px] hover:shadow-md"
        />
      </div>
    </div>
  );
};

export default ExamPrepHeader;
