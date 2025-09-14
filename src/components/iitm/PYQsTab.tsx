import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIITMBranchPyqs } from "./hooks/useIITMBranchPyqs";
import SubjectPyqs from "../SubjectPyqs";

const PYQsTab = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const branch = pathParts[3] || "data-science";
  const level = pathParts[4] || "foundation";

  const { subjects, loading, error } = useIITMBranchPyqs(branch, level);

  const handleBranchChange = (newBranch: string) => {
    navigate(`/exam-preparation/iitm-bs/pyqs/${newBranch}/${level}`);
  };

  const handleLevelChange = (newLevel: string) => {
    navigate(`/exam-preparation/iitm-bs/pyqs/${branch}/${newLevel}`);
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
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <SubjectPyqs key={index} subject={subject.name} pyqs={subject.pyqs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PYQsTab;
