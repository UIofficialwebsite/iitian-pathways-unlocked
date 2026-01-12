import React, { useMemo } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import AuthWrapper from "@/components/AuthWrapper";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { ShimmerButton } from "./ui/shimmer-button";

interface JEEPYQTabProps {
  subject: string | null;
  year: string | null;
  session: string | null;
}

const JEEPYQTab = ({ subject, year, session }: JEEPYQTabProps) => {
  const { pyqs, handleDownload, contentLoading } = useBackend();

  const jeePyqs = useMemo(() => pyqs.filter(p => p.exam_type === 'JEE'), [pyqs]);
  
  const filtered = jeePyqs.filter(p => 
    (!subject || p.subject === subject) && 
    (!year || p.year?.toString() === year) && 
    (!session || p.session === session)
  );

  return (
    <AuthWrapper>
      <div className="space-y-6">
        {contentLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(pyq => (
              <Card key={pyq.id} className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-[#1a1a1a] line-clamp-2">{pyq.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {pyq.subject} - {pyq.year}
                    {pyq.session && ` - ${pyq.session}`}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex items-center justify-between">
                  <ShimmerButton onClick={() => handleDownload(pyq.id, 'pyqs', pyq.file_link)} background="#6366f1" borderRadius="8px" className="h-9 px-4">
                    <span className="flex items-center text-[13px] font-bold text-white"><Download className="h-3.5 w-3.5 mr-2" /> Download</span>
                  </ShimmerButton>
                </CardFooter>
              </Card>
            ))}
            {filtered.length === 0 && <div className="col-span-full py-20 text-center text-gray-500">No papers found. Try adjusting your filters.</div>}
          </div>
        )}
      </div>
    </AuthWrapper>
  );
};

export default JEEPYQTab;
