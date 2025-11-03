import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BranchNotesAccordion from "./BranchNotesAccordion";
import { useIITMBranchNotes } from "./hooks/useIITMBranchNotes";

interface BranchNotesTabProps {
  onFilterChange?: (tab: string, branch?: string, level?: string) => void;
  initialParams?: Record<string, string>; // For deep linking
}

const BranchNotesTab = ({ onFilterChange, initialParams }: BranchNotesTabProps) => {
  // Set initial state from URL params if available
  const [branch, setBranch] = useState(initialParams?.branch || "data-science");
  const [level, setLevel] = useState(initialParams?.level || "foundation");
  const [specialization, setSpecialization] = useState(initialParams?.specialization || "all");

  const {
    loading,
    groupedData,
    availableSpecializations,
    reloadNotes,
  } = useIITMBranchNotes(branch, level);

  // Update URL when filters change
  useEffect(() => {
    // Only update URL if params are different
    if (branch !== initialParams?.branch || level !== initialParams?.level) {
      onFilterChange?.('notes', branch, level);
    }
    // Reset specialization when branch or level changes
    setSpecialization("all");
  }, [branch, level]);

  // Handle branch changes
  const handleBranchChange = (newBranch: string) => {
    setBranch(newBranch);
    onFilterChange?.('notes', newBranch, level);
  };

  // Handle level changes
  const handleLevelChange = (newLevel: string) => {
    setLevel(newLevel);
    setSpecialization('all'); // Reset specialization on level change
    onFilterChange?.('notes', branch, newLevel);
  };
  
  // Show specialization filter ONLY for Data Science Diploma
  const showSpecializationFilter = 
    branch === 'data-science' && 
    level === 'diploma' && 
    availableSpecializations.length > 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <Tabs value={branch} onValueChange={handleBranchChange} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="data-science">Data Science</TabsTrigger>
              <TabsTrigger value="electronic-systems">Electronic Systems</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <Select value={level} onValueChange={handleLevelChange}>
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

      {/* Specialization filter logic updated */}
      {showSpecializationFilter && (
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
          {showSpecializationFilter && specialization !== 'all' && (
            <span className="text-sm font-normal text-gray-600 ml-2">({specialization})</span>
          )}
        </h2>

        {/* Pass new props to the accordion */}
        <BranchNotesAccordion
          groupedData={groupedData}
          specialization={specialization}
          loading={loading}
          onNotesChange={reloadNotes}
        />
      </div>
    </div>
  );
};

export default BranchNotesTab;
