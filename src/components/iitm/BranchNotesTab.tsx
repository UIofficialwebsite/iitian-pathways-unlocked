import React, { useState, useMemo } from "react";
import BranchNotesAccordion from "./BranchNotesAccordion";
import { useIITMBranchNotes } from "./hooks/useIITMBranchNotes";
import { X } from "lucide-react";

const BranchNotesTab = ({ branch, level }: { branch: string; level: string }) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const branchSlug = branch.toLowerCase().replace(/\s+/g, '-');
  const levelSlug = level.toLowerCase();

  const { loading, groupedData, reloadNotes } = useIITMBranchNotes(branchSlug, levelSlug);

  const allSubjects = useMemo(() => 
    groupedData.map(g => g.subjectName).sort(), 
  [groupedData]);

  const filteredData = useMemo(() => {
    // If no filter chosen, show all (behaviour from courses page)
    if (selectedSubjects.length === 0) return groupedData;
    return groupedData.filter(g => selectedSubjects.includes(g.subjectName));
  }, [groupedData, selectedSubjects]);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  return (
    <div className="space-y-8">
      {/* Subject Multi-select Filter */}
      <div className="flex flex-nowrap items-center gap-3 py-2 overflow-x-auto no-scrollbar border-b border-gray-100">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0">Subjects:</span>
        {allSubjects.map(sub => (
          <button
            key={sub}
            onClick={() => toggleSubject(sub)}
            className={`shrink-0 px-4 py-1.5 border rounded-full text-[12px] whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedSubjects.includes(sub) 
                ? 'border-black bg-black text-white font-semibold' 
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 shadow-sm'
            }`}
          >
            {sub} {selectedSubjects.includes(sub) && <X className="w-3 h-3" />}
          </button>
        ))}
        {selectedSubjects.length > 0 && (
          <button onClick={() => setSelectedSubjects([])} className="text-blue-600 text-xs font-bold hover:underline px-2 shrink-0">Reset</button>
        )}
      </div>

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
