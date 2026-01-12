import React, { useState, useEffect } from "react";
import BranchNotesAccordion from "./BranchNotesAccordion";
import { useIITMBranchNotes } from "./hooks/useIITMBranchNotes";

interface BranchNotesTabProps {
  branch: string;
  level: string;
  onSubjectChange?: (subject: string) => void;
}

const BranchNotesTab = ({ branch, level, onSubjectChange }: BranchNotesTabProps) => {
  const [specialization, setSpecialization] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Convert display name to slug for API
  const branchSlug = branch.toLowerCase().replace(/\s+/g, '-');
  const levelSlug = level.toLowerCase();

  const {
    loading,
    groupedData,
    availableSpecializations,
    reloadNotes,
  } = useIITMBranchNotes(branchSlug, levelSlug);

  useEffect(() => {
    setSpecialization("all");
  }, [branch, level]);
  
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    onSubjectChange?.(subject);
  };
  
  // Show specialization filter ONLY if the data from the DB has specializations
  const showSpecializationFilter = 
    levelSlug === 'diploma' && 
    availableSpecializations.length > 0;

  return (
    <div className="space-y-6">
      {showSpecializationFilter && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSpecialization("all")}
            className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all ${
              specialization === "all" 
                ? 'bg-[#6366f1] text-white border-[#6366f1]' 
                : 'bg-white border-[#e5e7eb] text-[#374151]'
            }`}
          >
            All Specializations
          </button>
          {availableSpecializations.map((spec) => (
            <button
              key={spec}
              onClick={() => setSpecialization(spec)}
              className={`px-4 py-1.5 border rounded-[30px] text-[12px] md:text-[13px] transition-all ${
                specialization === spec 
                  ? 'bg-[#6366f1] text-white border-[#6366f1]' 
                  : 'bg-white border-[#e5e7eb] text-[#374151]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4 capitalize">
          {branch} - {level} Level Notes
          {showSpecializationFilter && specialization !== 'all' && (
            <span className="text-sm font-normal text-gray-600 ml-2">({specialization})</span>
          )}
        </h2>

        <BranchNotesAccordion
          groupedData={groupedData}
          specialization={specialization}
          loading={loading}
          onNotesChange={reloadNotes}
          branch={branchSlug}
          level={levelSlug}
          selectedSubject={selectedSubject}
          onSubjectChange={handleSubjectChange}
        />
      </div>
    </div>
  );
};

export default BranchNotesTab;
