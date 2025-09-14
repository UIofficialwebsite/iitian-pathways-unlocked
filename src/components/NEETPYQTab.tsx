import React, { useState, useEffect } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import AuthWrapper from "@/components/AuthWrapper";
import { ShimmerButton } from "./ui/shimmer-button";

interface NEETPYQTabProps {
  onFilterChange?: (tab: string, subject?: string, classLevel?: string, year?: string, session?: string) => void;
}

const NEETPYQTab = ({ onFilterChange }: NEETPYQTabProps) => {
  const [year, setYear] = useState("2024");
  const { 
    isAdmin, 
    handleDownload, 
    downloadCounts, 
    updateDownloadCount,
    pyqs,
    contentLoading,
    deletePyq,
    refreshPyqs
  } = useBackend();
  
  const years = ["2024", "2023", "2022", "2021", "2020"];
  
  // Handle year changes
  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    onFilterChange?.('pyqs', undefined, undefined, newYear);
  };
  
  // Filter pyqs by year and exam type
  const filteredPyqs = pyqs.filter(pyq => 
    pyq.year?.toString() === year && 
    pyq.exam_type?.toLowerCase().includes('neet')
  );

  // Update download counts from database
  useEffect(() => {
    pyqs.forEach(pyq => {
      if (pyq.download_count && !downloadCounts[pyq.id]) {
        updateDownloadCount(pyq.id, pyq.download_count);
      }
    });
  }, [pyqs, downloadCounts, updateDownloadCount]);

  const handleDownloadClick = async (pyqId: string, fileUrl?: string) => {
    await handleDownload(pyqId, 'pyqs', fileUrl);
  };

  const handleDeleteClick = async (pyqId: string) => {
    if (window.confirm('Are you sure you want to delete this PYQ?')) {
      await deletePyq(pyqId);
    }
  };

  const currentDownloads = downloadCounts;

  return (
    <AuthWrapper>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 max-w-xs">
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
        </div>
        
        {contentLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filteredPyqs.map((pyq) => (
              <Card key={pyq.id} className="border-none shadow-md hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pyq.title}</CardTitle>
                      <CardDescription>{pyq.description || 'NEET previous year question paper'}</CardDescription>
                      {pyq.subject && (
                        <div className="mt-2">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                            {pyq.subject}
                          </span>
                        </div>
                      )}
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(pyq.id)}
                        className="admin-only text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
            
            {filteredPyqs.length === 0 && (
              <div className="col-span-3 text-center py-8 text-gray-500">
                No previous year papers available for this year. Please try another year.
              </div>
            )}
          </div>
        )}
      </div>
    </AuthWrapper>
  );
};

export default NEETPYQTab;
