import React, { useMemo, useEffect } from "react";
import BranchNotesAccordion from "./BranchNotesAccordion";
import { useIITMBranchNotes } from "./hooks/useIITMBranchNotes";

export interface BranchNotesTabProps {
  branch: string;
  level: string;
  selectedSubjects: string[];
  onSubjectsLoaded?: (subjects: string[]) => void;
}

const BranchNotesTab = ({ branch, level, selectedSubjects, onSubjectsLoaded }: BranchNotesTabProps) => {
  const branchSlug = branch.toLowerCase().replace(/\s+/g, '-');
  const levelSlug = level.toLowerCase();

  const { loading, groupedData } = useIITMBranchNotes(branchSlug, levelSlug);

  // Extract available subject names and notify parent
  useEffect(() => {
    if (groupedData.length > 0 && onSubjectsLoaded) {
      const subjects = groupedData.map(g => g.subjectName);
      onSubjectsLoaded(subjects);
    }
  }, [groupedData, onSubjectsLoaded]);

  const filteredData = useMemo(() => {
    // If no filter chosen from the main header dropdown, show all
    if (selectedSubjects.length === 0) return groupedData;
    return groupedData.filter(g => selectedSubjects.includes(g.subjectName));
  }, [groupedData, selectedSubjects]);

  return (
    <div className="space-y-8">
      {/* Subject Multi-select Filter button list has been removed to Row 2 filter bar */}
      <BranchNotesAccordion
        groupedData={filteredData}
        loading={loading}
        branch={branchSlug}
        level={levelSlug}
      />
    </div>
  );
};

export default BranchNotesTab;
