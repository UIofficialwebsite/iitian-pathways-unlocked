import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIITMBranchNotes } from "./hooks/useIITMBranchNotes";
import BranchNotesAccordion from "./BranchNotesAccordion";
import { Skeleton } from "@/components/ui/skeleton";

const BranchNotesTab = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read the branch and level from the URL
  const pathParts = location.pathname.split('/').filter(Boolean);
  const branch = pathParts[3] || "data-science";
  const level = pathParts[4] || "foundation";

  const { subjects, loading, error } = useIITMBranchNotes(branch, level);

  // Update URL when branch selection changes
  const handleBranchChange = (newBranch: string) => {
    navigate(`/exam-preparation/iitm-bs/notes/${newBranch}/${level}`);
  };

  // Update URL when level selection changes
  const handleLevelChange = (newLevel: string) => {
    navigate(`/exam-preparation/iitm-bs/notes/${branch}/${newLevel}`);
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

      <div>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <BranchNotesAccordion subjects={subjects} />
        )}
      </div>
    </div>
  );
};

export default BranchNotesTab;
