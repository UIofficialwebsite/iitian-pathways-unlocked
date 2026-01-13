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
  
  // Show specialization filter ONLY if the data from the DB has specializations
  const showSpecializationFilter = 
    levelSlug === 'diploma' && 
    availableSpecializations.length > 0;

  return (
    <div className="space-y-12">
      {showSpecializationFilter && (
        <div className="flex flex-wrap gap-2 mb-8">
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

      <BranchNotesAccordion
        groupedData={groupedData}
        specialization={specialization}
        loading={loading}
        onNotesChange={reloadNotes}
        branch={branchSlug}
        level={levelSlug}
      />
    </div>
  );
};

export default BranchNotesTab;
