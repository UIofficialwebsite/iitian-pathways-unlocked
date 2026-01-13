import React from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import AdminAddButton from "@/components/admin/AdminAddButton";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { ShareButton } from "@/components/ShareButton";

interface PYQsTabProps {
  branch: string;
  level: string;
  years: string[];
  examTypes: string[];
  subjects: string[];
}

const PYQsTab = ({ branch, level, years, examTypes, subjects }: PYQsTabProps) => {
  const { handleDownload, downloadCounts, pyqs, contentLoading } = useBackend();
  const branchSlug = branch.toLowerCase().replace(/\s+/g, '-');
  const levelSlug = level.toLowerCase();
  
  const filteredPYQs = pyqs.filter(pyq => {
    const matchesProgram = pyq.branch === branchSlug && pyq.level === levelSlug;
    // Multi-Select Logic: If array is empty, include all. Else, check if included.
    const matchesYear = years.length === 0 || (pyq.year && years.includes(pyq.year.toString()));
    const matchesType = examTypes.length === 0 || (pyq.exam_type && examTypes.includes(pyq.exam_type));
    const matchesSubject = subjects.length === 0 || (pyq.subject && subjects.includes(pyq.subject));
    
    return matchesProgram && matchesYear && matchesType && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AdminAddButton contentType="pyqs" examType="IITM_BS" branch={branchSlug} level={levelSlug}>
          Add Paper
        </AdminAddButton>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentLoading ? (
          <div className="col-span-3 flex justify-center py-20 animate-pulse text-slate-400 font-bold">LOADING PAPERS...</div>
        ) : filteredPYQs.length > 0 ? (
          filteredPYQs.map((pyq) => (
            <Card key={pyq.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full bg-white group rounded-xl">
              <CardHeader className="flex-grow pb-4 px-5 pt-5">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-0.5 bg-blue-50 text-indigo-600 text-[10px] font-bold uppercase rounded">{pyq.exam_type}</span>
                  <span className="text-[11px] font-medium text-slate-400">{pyq.year}</span>
                </div>
                <CardTitle className="text-[15px] font-bold text-slate-900 leading-tight mb-2 font-sans">{pyq.title}</CardTitle>
                <CardDescription className="text-[12px] text-slate-500 line-clamp-2 font-sans">{pyq.description || `Assessment paper for ${pyq.subject}.`}</CardDescription>
                {pyq.subject && (
                  <div className="mt-4"><span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md">{pyq.subject}</span></div>
                )}
              </CardHeader>
              <CardFooter className="flex justify-between items-center border-t border-slate-50 px-5 py-4 mt-auto">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownload(pyq.id, 'pyqs', pyq.file_link || undefined)} disabled={!pyq.file_link} className="flex items-center gap-2 bg-black text-white h-9 px-4 rounded-full hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
                    <Download className="h-3.5 w-3.5" /> <span className="text-[11px] font-bold uppercase">PDF</span>
                  </button>
                  <ShareButton url={window.location.href} title={pyq.title} variant="outline" size="icon" className="h-9 w-9 rounded-md border-slate-200 text-slate-500" />
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-tight">Downloads</span>
                  <span className="text-sm font-bold text-slate-700">{downloadCounts[pyq.id] || pyq.download_count || 0}</span>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400 font-medium italic">No papers found. Try adjusting filters.</div>
        )}
      </div>
    </div>
  );
};

export default PYQsTab;
