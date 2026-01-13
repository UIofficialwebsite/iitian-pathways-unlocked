import React from "react";
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
  examType?: string; // This corresponds to 'quiz1', 'quiz2', 'endterm'
}

const PYQsTab = ({ branch, level, year, examType = "quiz1" }: PYQsTabProps) => {
  
  const branchSlug = branch.toLowerCase().replace(/\s+/g, '-');
  const levelSlug = level.toLowerCase();
  
  const { handleDownload, downloadCounts, pyqs, contentLoading } = useBackend();
  
  // 1. Filter by Program (Branch & Level)
  const iitmPyqs = pyqs.filter(pyq => {
    return pyq.branch === branchSlug && pyq.level === levelSlug;
  });

  const availableYears = [...new Set(iitmPyqs.map(pyq => pyq.year?.toString() || '2024'))].sort().reverse();
  const effectiveYear = year || availableYears[0] || '2024';

  // 2. Filter by selected Year and the specific Exam Type (Quiz 1, Quiz 2, etc.)
  const filteredPYQs = iitmPyqs.filter(pyq => {
    const yearMatch = pyq.year?.toString() === effectiveYear;
    // For Qualifier, usually there is only one type of exam, otherwise match the examType filter
    const typeMatch = levelSlug === "qualifier" ? true : pyq.exam_type === examType;
    
    return yearMatch && typeMatch;
  });

  const handleDownloadClick = async (pyqId: string, fileUrl?: string) => {
    await handleDownload(pyqId, 'pyqs', fileUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AdminAddButton 
          contentType="pyqs"
          examType={examType} // Pass 'quiz1', etc. to the admin form
          branch={branchSlug}
          level={levelSlug}
        >
          Add {examType.toUpperCase()} Paper
        </AdminAddButton>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentLoading ? (
          <div className="col-span-3 flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
          </div>
        ) : (
          filteredPYQs.map((pyq) => (
            <Card key={pyq.id} className="border-none shadow-md hover:shadow-lg transition-all flex flex-col">
              <CardHeader className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-blue-50 text-[#1E3A8A] text-[10px] font-bold uppercase rounded">
                    {pyq.exam_type}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">{pyq.year}</span>
                </div>
                <CardTitle className="text-lg leading-tight">{pyq.title}</CardTitle>
                <CardDescription className="line-clamp-2">{pyq.description}</CardDescription>
                {pyq.subject && (
                  <div className="mt-3 inline-flex items-center text-[12px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {pyq.subject}
                  </div>
                )}
              </CardHeader>

              <CardFooter className="flex justify-between items-center border-t pt-4">
                <div className="flex items-center gap-2">
                  <ShimmerButton
                    onClick={() => handleDownloadClick(pyq.id, pyq.file_link || undefined)}
                    disabled={!pyq.file_link}
                    className="flex items-center gap-2 bg-green-600 h-9 px-4"
                    shimmerColor="#22c55e"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="text-xs">PDF</span>
                  </ShimmerButton>
                  <ShareButton
                    url={window.location.href}
                    title={pyq.title}
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Downloads</span>
                  <span className="text-sm font-bold text-gray-700">{downloadCounts[pyq.id] || pyq.download_count || 0}</span>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
        
        {!contentLoading && filteredPYQs.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-xl">
             <p className="text-gray-400 text-sm">No {examType} papers found for this selection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PYQsTab;
