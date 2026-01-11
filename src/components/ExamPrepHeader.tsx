import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
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
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                  <Home className="h-4 w-4" />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/exam-preparation" className="text-gray-500 hover:text-gray-700 uppercase text-xs font-medium tracking-wide">
                  Exam Prep
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={examPath} className="text-gray-500 hover:text-gray-700 uppercase text-xs font-medium tracking-wide">
                  {examName}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {currentTab && currentTab !== "notes" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="uppercase text-xs font-medium tracking-wide">
                    {getTabDisplayName(currentTab)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          {displayTitle}
        </h1>

        {/* Share Button */}
        <ShareButton
          url={shareUrl}
          title={displayTitle}
          description={`${examName} preparation resources`}
          variant="outline"
          size="sm"
          showText={true}
          className="border-gray-300 text-gray-600 hover:bg-gray-100"
        />
      </div>
    </div>
  );
};

export default ExamPrepHeader;
