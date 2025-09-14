import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIITMBranchNotes } from "./hooks/useIITMBranchNotes";
import BranchNotesAccordion from "./BranchNotesAccordion";
import { Skeleton } from "@/components/ui/skeleton";

const BranchNotesTab = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const branch = pathParts[3] || "data-science";
  const level = pathParts[4] || "foundation";
  const specialization = pathParts[5] || "all";

  const { loading, error, groupedNotes, getAvailableSpecializations, getCurrentSubjects } = useIITMBranchNotes(branch, level);

  const availableSpecializations = getAvailableSpecializations();
  const subjectsInTab = getCurrentSubjects(specialization);

  const handleBranchChange = (newBranch: string) => {
    navigate(`/exam-preparation/iitm-bs/notes/${newBranch}/${level}`);
  };

  const handleLevelChange = (newLevel: string) => {
    navigate(`/exam-preparation/iitm-bs/notes/${branch}/${newLevel}`);
  };
  
  const handleSpecializationChange = (newSpecialization: string) => {
    navigate(`/exam-preparation/iitm-bs/notes/${branch}/${level}/${newSpecialization}`);
  };

  const relevantNotes = () => {
    if (level === 'diploma' && specialization && specialization !== 'all') {
      const filteredSubjects: Record<string, any[]> = {};
      subjectsInTab.forEach(subject => {
        if (groupedNotes[subject]) {
          filteredSubjects[subject] = groupedNotes[subject];
        }
      });
      return filteredSubjects;
    }
    return groupedNotes;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={branch} onValueChange={handleBranchChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="data-science">BS Data Science</SelectItem>
            <SelectItem value="electronic-systems">BS Electronic Systems</SelectItem>
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={handleLevelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="foundation">Foundation</SelectItem>
            <SelectItem value="diploma">Diploma</SelectItem>
            <SelectItem value="degree">Degree</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {level === 'diploma' && availableSpecializations.length > 0 && (
        <div className="mt-4">
          <Select value={specialization} onValueChange={handleSpecializationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specializations</SelectItem>
              {availableSpecializations.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error.toString()}</p>
        ) : (
          Object.keys(relevantNotes()).length > 0 ? (
            <BranchNotesAccordion subjects={relevantNotes()} />
          ) : (
            <p className="text-center text-gray-500 mt-8">No notes found for the selected criteria.</p>
          )
        )}
      </div>
    </div>
  );
};

export default BranchNotesTab;
