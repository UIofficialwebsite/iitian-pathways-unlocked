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
  subject?: string | null; // Added subject filter
}

const PYQsTab = ({ branch, level, year, examType, subject }: PYQsTabProps) => {
  const { handleDownload, downloadCounts, pyqs, contentLoading } = useBackend();
  
  const branchSlug = branch.toLowerCase().replace(/\s+/g, '-');
  const levelSlug = level.toLowerCase();
  
  const filteredPYQs = pyqs.filter(pyq => {
    // 1. Program Match
    const matchesProgram = pyq.branch === branchSlug && pyq.level === levelSlug;
    // 2. Year Match
    const matchesYear = year ? pyq.year?.toString() === year : true;
    // 3. Exam Type Match (Quiz 1, etc.)
    const matchesType = examType ? pyq.exam_type === examType : true;
    // 4. Subject Match
    const matchesSubject = subject ? pyq.subject === subject : true;
    
    return matchesProgram && matchesYear && matchesType && matchesSubject;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contentLoading ? (
        <div className="col-span-3 flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
        </div>
      ) : filteredPYQs.length > 0 ? (
        filteredPYQs.map((pyq) => (
          <Card key={pyq.id} className="border-none shadow-md hover:shadow-lg flex flex-col h-full bg-white">
            <CardHeader className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <span className="px-2 py-1 bg-blue-50 text-[#1E3A8A] text-[10px] font-bold uppercase rounded">
                  {pyq.exam_type}
                </span>
                <span className="text-[11px] font-medium text-gray-400">{pyq.year}</span>
              </div>
              <CardTitle className="text-lg leading-tight font-bold">{pyq.title}</CardTitle>
              <CardDescription className="line-clamp-2 mt-1 text-xs">{pyq.description}</CardDescription>
              {pyq.subject && (
                <div className="mt-3 inline-flex items-center text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
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
        <div className="col-span-3 flex flex-col items-center justify-center py-20 bg-white border border-dashed rounded-xl">
           <p className="text-gray-400 text-sm">No papers found for the selected subject/year.</p>
        </div>
      )}
    </div>
  );
};

export default PYQsTab;
