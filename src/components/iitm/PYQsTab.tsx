import React, { useState, useEffect } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Download } from "lucide-react";
import AdminAddButton from "@/components/admin/AdminAddButton";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { ShareButton } from "@/components/ShareButton";

interface PYQsTabProps {
  branch: string;
  level: string;
  year: string | null;
}

const PYQsTab = ({ branch, level, year }: PYQsTabProps) => {
  const [examType, setExamType] = useState("quiz1");
  
  // Convert display name to slug for API
  const branchSlug = branch.toLowerCase().replace(/\s+/g, '-');
  const levelSlug = level.toLowerCase();
  
  const { handleDownload, downloadCounts, pyqs, contentLoading } = useBackend();
  
  // Filter PYQs for IITM BS with real-time updates
  const iitmPyqs = pyqs.filter(pyq => {
    return (pyq.exam_type === 'IITM_BS' || pyq.exam_type === 'IITM BS') &&
           pyq.branch === branchSlug &&
           pyq.level === levelSlug;
  });

  // Get available years from the filtered PYQs
  const availableYears = [...new Set(iitmPyqs.map(pyq => pyq.year?.toString() || '2023'))].sort().reverse();

  // Use provided year or default to first available
  const effectiveYear = year || availableYears[0] || '2023';

  // Filter PYQs by selected year and exam type
  const filteredPYQs = iitmPyqs.filter(pyq => {
    const yearMatch = pyq.year?.toString() === effectiveYear;
    // For qualifier level, don't filter by exam type
    if (levelSlug === "qualifier") {
      return yearMatch;
    }
    return yearMatch;
  });

  const handleDownloadClick = async (pyqId: string, fileUrl?: string) => {
    await handleDownload(pyqId, 'pyqs', fileUrl);
  };

  return (
    <div className="space-y-6">
      {/* Exam Type (only shown if not qualifier level) */}
      {levelSlug !== "qualifier" && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Exam Type:</span>
          {["quiz1", "quiz2", "endterm"].map((type) => (
            <button
              key={type}
              onClick={() => setExamType(type)}
              className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all ${
                examType === type 
                  ? 'bg-[#6366f1] text-white border-[#6366f1]' 
                  : 'bg-white border-[#e5e7eb] text-[#374151]'
              }`}
            >
              {type === 'quiz1' ? 'Quiz 1' : type === 'quiz2' ? 'Quiz 2' : 'End Term'}
            </button>
          ))}
          
          <div className="ml-auto">
            <AdminAddButton 
              contentType="pyqs"
              examType="IITM_BS"
              branch={branchSlug}
              level={levelSlug}
            >
              Add PYQs
            </AdminAddButton>
          </div>
        </div>
      )}

      {levelSlug === "qualifier" && (
        <div className="flex justify-end">
          <AdminAddButton 
            contentType="pyqs"
            examType="IITM_BS"
            branch={branchSlug}
            level={levelSlug}
          >
            Add PYQs
          </AdminAddButton>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentLoading ? (
          <div className="col-span-3 flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
          </div>
        ) : (
          filteredPYQs.map((pyq) => (
            <Card key={pyq.id} className="border-none shadow-md hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-lg">{pyq.title}</CardTitle>
                <CardDescription>{pyq.description}</CardDescription>
                {pyq.subject && (
                  <div className="text-sm text-gray-600">Subject: {pyq.subject}</div>
                )}
                {pyq.session && (
                  <div className="text-sm text-gray-600">Session: {pyq.session}</div>
                )}
                {pyq.shift && (
                  <div className="text-sm text-gray-600">Shift: {pyq.shift}</div>
                )}
              </CardHeader>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShimmerButton
                    onClick={() => handleDownloadClick(pyq.id, pyq.file_link || undefined)}
                    disabled={!pyq.file_link}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    shimmerColor="#22c55e"
                    background="rgba(34, 197, 94, 1)"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </ShimmerButton>
                  <ShareButton
                    url={window.location.href}
                    title={pyq.title}
                    description={pyq.description || `${pyq.subject} - ${effectiveYear}`}
                    variant="outline"
                    size="icon"
                  />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">{downloadCounts[pyq.id] || pyq.download_count || 0}</span>
                  <div className="ml-2 bg-gray-200 h-1.5 w-16 rounded-full overflow-hidden">
                    <div 
                      className="bg-royal h-full rounded-full" 
                      style={{ width: `${Math.min(100, ((downloadCounts[pyq.id] || pyq.download_count || 0) / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
        
        {!contentLoading && filteredPYQs.length === 0 && (
          <div className="col-span-3 text-center py-8 text-gray-500">
            No papers available for this selection. Please try another filter combination.
          </div>
        )}
      </div>
    </div>
  );
};

export default PYQsTab;
