import React from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Download } from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { ShareButton } from "@/components/ShareButton";

interface PYQsTabProps {
  branch: string;
  level: string;
  year: string | null;
  examType?: string | null;
}

const PYQsTab = ({ branch, level, year, examType }: PYQsTabProps) => {
  const { handleDownload, downloadCounts, pyqs, contentLoading } = useBackend();
  
  const branchSlug = branch.toLowerCase().replace(/\s+/g, '-');
  const levelSlug = level.toLowerCase();
  
  const filteredPYQs = pyqs.filter(pyq => {
    // Check program context (Branch/Level)
    const matchesProgram = pyq.branch === branchSlug && pyq.level === levelSlug;
    // Check dynamic year filter
    const matchesYear = year ? pyq.year?.toString() === year : true;
    // Check dynamic assessment filter (Quiz 1, Quiz 2, etc.)
    const matchesType = examType ? pyq.exam_type === examType : true;
    
    return matchesProgram && matchesYear && matchesType;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contentLoading ? (
        <div className="col-span-3 flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
        </div>
      ) : filteredPYQs.length > 0 ? (
        filteredPYQs.map((pyq) => (
          <Card key={pyq.id} className="border-none shadow-md hover:shadow-lg flex flex-col h-full">
            <CardHeader className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-1 bg-blue-50 text-[#1E3A8A] text-[10px] font-bold uppercase rounded">
                  {pyq.exam_type}
                </span>
                <span className="text-[11px] font-medium text-gray-400">{pyq.year}</span>
              </div>
              <CardTitle className="text-lg leading-tight">{pyq.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1">{pyq.description}</CardDescription>
              {pyq.subject && (
                <div className="mt-3 inline-flex items-center text-[12px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {pyq.subject}
                </div>
              )}
            </CardHeader>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <div className="flex items-center gap-2">
                <ShimmerButton
                  onClick={() => handleDownload(pyq.id, 'pyqs', pyq.file_link || undefined)}
                  disabled={!pyq.file_link}
                  className="flex items-center gap-2 bg-green-600 h-9 px-4"
                  shimmerColor="#22c55e"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="text-xs">PDF</span>
                </ShimmerButton>
                <ShareButton url={window.location.href} title={pyq.title} variant="outline" size="icon" className="h-9 w-9" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Downloads</span>
                <span className="text-sm font-bold text-gray-700">{downloadCounts[pyq.id] || pyq.download_count || 0}</span>
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-3 text-center py-20 text-gray-400">
          No papers found for {examType || 'the selected'} filters in {year || 'any year'}.
        </div>
      )}
    </div>
  );
};

export default PYQsTab;
