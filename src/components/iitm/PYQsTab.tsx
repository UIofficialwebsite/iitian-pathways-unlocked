
import React, { useState, useEffect } from "react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAddButton from "@/components/admin/AdminAddButton";
import { useBackend } from "@/components/BackendIntegratedWrapper";

const PYQsTab = () => {
  const [branch, setBranch] = useState("data-science");
  const [level, setLevel] = useState("foundation");
  const [examType, setExamType] = useState("quiz1");
  const [year, setYear] = useState("2023");
  
  const { handleDownload, downloadCounts, pyqs, contentLoading } = useBackend();
  
  // Filter PYQs for IITM BS with real-time updates
  const iitmPyqs = pyqs.filter(pyq => {
    return (pyq.exam_type === 'IITM_BS' || pyq.exam_type === 'IITM BS') &&
           pyq.branch === branch &&
           pyq.level === level;
  });

  // Get available years from the filtered PYQs
  const availableYears = [...new Set(iitmPyqs.map(pyq => pyq.year?.toString() || '2023'))].sort().reverse();

  // Filter PYQs by selected year and exam type
  const filteredPYQs = iitmPyqs.filter(pyq => {
    const yearMatch = pyq.year?.toString() === year;
    // For qualifier level, don't filter by exam type
    if (level === "qualifier") {
      return yearMatch;
    }
    return yearMatch;
  });

  // Set default year if available years change
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(year)) {
      setYear(availableYears[0]);
    }
  }, [availableYears, year]);

  const handleDownloadClick = async (pyqId: string, fileUrl?: string) => {
    await handleDownload(pyqId, 'pyqs', fileUrl);
  };

  return (
    <div className="space-y-6">
      {/* Branch and Level Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <Tabs value={branch} onValueChange={setBranch}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="data-science">Data Science</TabsTrigger>
              <TabsTrigger value="electronic-systems">Electronic Systems</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <Tabs value={level} onValueChange={setLevel}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="foundation">Foundation</TabsTrigger>
              <TabsTrigger value="diploma">Diploma</TabsTrigger>
              <TabsTrigger value="degree">Degree</TabsTrigger>
              <TabsTrigger value="qualifier">Qualifier</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Exam Type (hidden for "qualifier"), Year selector and Add Button */}
      <div className="flex justify-between items-end mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
          {/* Hide EXAM TYPE selection if level is "qualifier" */}
          {level !== "qualifier" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
              <Tabs value={examType} onValueChange={setExamType}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="quiz1">Quiz 1</TabsTrigger>
                  <TabsTrigger value="quiz2">Quiz 2</TabsTrigger>
                  <TabsTrigger value="endterm">End Term</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <Select value={year} onValueChange={setYear} disabled={availableYears.length === 0}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AdminAddButton 
          contentType="pyqs"
          examType="IITM_BS"
          branch={branch}
          level={level}
        >
          Add PYQs
        </AdminAddButton>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
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
              <CardFooter className="flex justify-between">
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
