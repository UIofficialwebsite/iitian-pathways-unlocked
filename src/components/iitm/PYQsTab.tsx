import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIITMBranchPyqs } from "./hooks/useIITMBranchPyqs";
import SubjectPyqs from "../SubjectPyqs";

const PYQsTab = () => {
  const [branch, setBranch] = useState("data-science");
  const [level, setLevel] = useState("foundation");
  const { subjects, loading, error } = useIITMBranchPyqs(branch, level);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={branch} onValueChange={setBranch}>
          <SelectTrigger>
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="data-science">BS Data Science</SelectItem>
            <SelectItem value="electronic-systems">BS Electronic Systems</SelectItem>
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
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
