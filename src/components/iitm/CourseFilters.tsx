// src/components/iitm/CourseFilters.tsx
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SlidersIcon from "@/components/ui/SliderIcon";

interface CourseFiltersProps {
  branch: string;
  setBranch: (value: string) => void;
  level: string;
  setLevel: (value: string) => void;
  availableBranches?: string[]; // New: Pass branches from data
  availableLevels?: string[];   // New: Pass levels from data
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ 
  branch, 
  setBranch, 
  level, 
  setLevel,
  availableBranches = ["Data Science", "Electronic Systems"], // Fallback defaults
  availableLevels = ["Qualifier", "Foundation", "Diploma", "Degree"]
}) => {
  
  // Helper to format slugs back to readable text if needed
  const formatSlug = (slug: string) => slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-gray-700 font-semibold">
        <SlidersIcon className="w-4 h-4" /> 
        <span>Filters</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dynamic Branch Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <Select value={branch} onValueChange={setBranch}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {availableBranches.map((b) => (
                <SelectItem key={b} value={b.toLowerCase().replace(/\s+/g, '-')}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Dynamic Level Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {availableLevels.map((l) => (
                <SelectItem key={l} value={l.toLowerCase()}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CourseFilters;
