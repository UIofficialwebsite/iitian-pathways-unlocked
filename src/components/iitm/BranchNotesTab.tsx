
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BranchNotesAccordion from "./BranchNotesAccordion";
import { useIITMBranchNotes, Note } from "./hooks/useIITMBranchNotes";

const BranchNotesTab = () => {
  const [branch, setBranch] = useState("data-science");
  const [level, setLevel] = useState("foundation");
  const [specialization, setSpecialization] = useState("all");

  const {
    loading,
    groupedNotes,
    getCurrentSubjects,
    getAvailableSpecializations,
  } = useIITMBranchNotes(branch, level);

  useEffect(() => {
    setSpecialization("all");
  }, [branch, level]);

  const handleDownload = (noteId: string) => {
    console.log(`Downloading note: ${noteId}`);
    // Actual download logic would go here
  };

  const availableSpecializations = getAvailableSpecializations();
  const currentSubjects = getCurrentSubjects(specialization);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <Tabs value={branch} onValueChange={setBranch} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="data-science">Data Science</TabsTrigger>
              <TabsTrigger value="electronic-systems">Electronic Systems</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <Select value={level} onValueChange={(value) => { setLevel(value); setSpecialization('all'); }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              {[
                { value: "qualifier", label: "Qualifier" },
                { value: "foundation", label: "Foundation" },
                { value: "diploma", label: "Diploma" },
                { value: "degree", label: "Degree" }
              ].map((lvl) => (
                <SelectItem key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {level === "diploma" && availableSpecializations.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {availableSpecializations.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4 capitalize">
          {branch.replace('-', ' ')} - {level.charAt(0).toUpperCase() + level.slice(1)} Level Notes
          {level === "diploma" && specialization !== 'all' && (
            <span className="text-sm font-normal text-gray-600 ml-2">({specialization})</span>
          )}
          {level === "qualifier" && (
            <span className="text-sm font-normal text-gray-600 ml-2">(Weeks 1-4 only)</span>
          )}
        </h2>

        <BranchNotesAccordion
          groupedNotes={groupedNotes}
          level={level}
          handleDownload={handleDownload}
          currentSubjects={currentSubjects}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default BranchNotesTab;
