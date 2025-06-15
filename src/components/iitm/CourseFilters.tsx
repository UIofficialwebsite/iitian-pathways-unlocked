
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CourseFiltersProps {
  branch: string;
  setBranch: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ branch, setBranch, level, setLevel }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
        <Select value={branch} onValueChange={setBranch}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            <SelectItem value="data-science">Data Science</SelectItem>
            <SelectItem value="electronic-system">Electronic Systems</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="qualifier">Qualifier</SelectItem>
            <SelectItem value="foundation">Foundation</SelectItem>
            <SelectItem value="diploma">Diploma</SelectItem>
            <SelectItem value="degree">Degree</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default CourseFilters;
