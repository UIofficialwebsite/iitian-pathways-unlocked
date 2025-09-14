import React, { useState, useEffect } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthWrapper from "@/components/AuthWrapper";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { ShimmerButton } from "./ui/shimmer-button";

interface JEEPYQTabProps {
  downloads: Record<string, number>;
  onDownload: (id: string) => void;
  onFilterChange?: (tab: string, subject?: string, classLevel?: string, year?: string, session?: string) => void;
}

const JEEPYQTab = ({ downloads: propDownloads, onDownload: propOnDownload, onFilterChange }: JEEPYQTabProps) => {
  const { pyqs, handleDownload, downloadCounts, contentLoading } = useBackend();
  const [activeSubject, setActiveSubject] = useState("Physics");
  const [year, setYear] = useState("2024");
  const [session, setSession] = useState("January");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  
  const subjects = ["Physics", "Mathematics", "Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry"];
  const years = ["2024", "2023", "2022", "2021", "2020"];

  const jeePyqs = pyqs.filter(pyq => pyq.exam_type === 'JEE');
  
  useEffect(() => {
    const sessionsForYearAndSubject = [...new Set(jeePyqs
      .filter(pyq => pyq.year?.toString() === year && pyq.subject === activeSubject && pyq.session)
      .map(pyq => pyq.session!))];
    
    setAvailableSessions(sessionsForYearAndSubject);
    
    if (!sessionsForYearAndSubject.includes(session) && sessionsForYearAndSubject.length > 0) {
      const newSession = sessionsForYearAndSubject[0];
      setSession(newSession);
      onFilterChange?.('pyqs', activeSubject, undefined, year, newSession);
    } else if (sessionsForYearAndSubject.length === 0) {
      setSession("");
    }
  }, [year, activeSubject, jeePyqs, session]);

  // Handle filter changes with URL updates
  const handleSubjectChange = (newSubject: string) => {
    setActiveSubject(newSubject);
    onFilterChange?.('pyqs', newSubject, undefined, year, session);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    onFilterChange?.('pyqs', activeSubject, undefined, newYear, session);
  };

  const handleSessionChange = (newSession: string) => {
    setSession(newSession);
    onFilterChange?.('pyqs', activeSubject, undefined, year, newSession);
  };
  
  const filteredPapers = jeePyqs.filter(
    pyq => pyq.year?.toString() === year && pyq.session === session && pyq.subject === activeSubject
  );

  const handleDownloadClick = async (pyqId: string, fileUrl?: string) => {
    await handleDownload(pyqId, 'pyqs', fileUrl);
  };
  
  const currentDownloads = downloadCounts;

  return (
    <AuthWrapper>
      <div className="space-y-6">
        {/* Subject Tabs */}
        <div className="mb-6">
          <Tabs value={activeSubject} onValueChange={handleSubjectChange}>
            <div className="overflow-x-auto pb-2">
              <TabsList className="w-full min-w-fit">
                {subjects.map((subject) => (
                  <TabsTrigger key={subject} value={subject} className="rounded-md flex-shrink-0">
                    {subject}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Filters and Subject-Specific Add Button */}
        <div className="flex justify-between items-end mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <Select value={year} onValueChange={handleYearChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <Select value={session} onValueChange={handleSessionChange} disabled={availableSessions.length === 0}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {availableSessions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {contentLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredPapers.map((pyq) => (
              <Card key={pyq.id} className="border-none shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">{pyq.title}</CardTitle>
                  <CardDescription>{pyq.description || ''}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <ShimmerButton
                    onClick={() => handleDownloadClick(pyq.id, pyq.file_link || undefined)}
                    background="rgba(26, 86, 219, 0.8)"
                    borderRadius="var(--radius)"
                  >
                    <span className="flex items-center text-white">
                        <Download className="h-4 w-4 mr-2" /> Download
                    </span>
                  </ShimmerButton>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">{currentDownloads[pyq.id] || pyq.download_count || 0}</span>
                    <div className="ml-2 bg-gray-200 h-1.5 w-16 rounded-full overflow-hidden">
                      <div 
                        className="bg-royal h-full rounded-full" 
                        style={{ width: `${Math.min(100, ((currentDownloads[pyq.id] || pyq.download_count || 0) / 100) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            {filteredPapers.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No {activeSubject} papers available for {year} {session}. Please try a different selection.
              </div>
            )}
          </div>
        )}
      </div>
    </AuthWrapper>
  );
};

export default JEEPYQTab;
