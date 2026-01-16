import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ALL_SUBJECTS } from "./data/subjectsData";
import { predictRequiredScore } from "./utils/predictorLogic";
import { Level } from "./types/gradeTypes";
import PredictorInputForm from "./components/PredictorInputForm";
import PredictorResult from "./components/PredictorResult";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MarksPredictorProps {
  level: string; 
  branch: "data-science" | "electronic-systems" | string;
}

export type PredictionResultData = { 
  required: number | null; 
  possible: boolean; 
  finalGrade: number 
};

export default function MarksPredictor({ level, branch }: MarksPredictorProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSubject = searchParams.get("subject") || "";

  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  // Stores the calculation result for ALL grades (S, A, B...)
  const [results, setResults] = useState<Record<string, PredictionResultData> | null>(null);

  const filteredSubjects = useMemo(() => {
    const getSubjectsKey = () => {
      const normalizedLevel = level?.toLowerCase() || "foundation";
      const normalizedBranch = branch?.toLowerCase().replace(" ", "-") || "data-science";

      if (normalizedBranch === "electronic-systems") {
        if (normalizedLevel === "foundation") return "foundation-electronic-systems";
        if (normalizedLevel === "diploma") return "diploma-electronic-systems";
        if (normalizedLevel === "degree") return "degree-electronic-systems";
      }
      return normalizedLevel;
    };
    return ALL_SUBJECTS[getSubjectsKey()] || [];
  }, [branch, level]);

  const currentSubject = useMemo(() => 
    filteredSubjects.find(s => s.key === initialSubject),
    [filteredSubjects, initialSubject]
  );

  const handleSubjectChange = (val: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (val) newParams.set("subject", val);
      else newParams.delete("subject");
      return newParams;
    });
    setInputValues({});
    setResults(null);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputValues(prev => ({ ...prev, [fieldId]: value }));
    }
  };

  const handleCalculate = () => {
    if (!currentSubject) return;

    const numericValues: Record<string, number> = {};
    Object.keys(inputValues).forEach(key => {
      numericValues[key] = parseFloat(inputValues[key]) || 0;
    });

    const safeLevel = (level?.toLowerCase() || "foundation") as Level;
    const grades = ['S', 'A', 'B', 'C', 'D', 'E'];
    const newResults: Record<string, PredictionResultData> = {};

    // Calculate requirements for ALL grades
    grades.forEach(grade => {
      newResults[grade] = predictRequiredScore(safeLevel, currentSubject.key, numericValues, grade);
    });

    setResults(newResults);
  };

  const handleReset = () => {
    setInputValues({});
    setResults(null);
  };

  return (
    <div className="w-full bg-white font-sans text-gray-900">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-8">
        
        {/* 01. Select Course */}
        <div className="mb-10 w-full max-w-3xl relative z-50">
          <Label className="text-xs font-bold uppercase tracking-wide text-gray-600 font-['Inter'] mb-3 block">
            01. Select Course
          </Label>
          
          <Select value={currentSubject?.key || ""} onValueChange={handleSubjectChange}>
            <SelectTrigger className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-['Inter'] font-normal relative z-10">
              <SelectValue placeholder="Choose a subject..." />
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-[300px] bg-white border-2 border-gray-200 shadow-xl">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <SelectItem key={subject.key} value={subject.key} className="font-['Inter'] cursor-pointer py-3 text-base focus:bg-gray-100 border-b border-gray-100 last:border-0">
                    {subject.name}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No subjects found for {level} ({branch})
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* 02. Enter Scores */}
        <div className="relative z-0">
          {currentSubject && (
            <PredictorInputForm 
              subject={currentSubject}
              inputValues={inputValues}
              onInputChange={handleInputChange}
              onCalculate={handleCalculate}
            />
          )}
        </div>

        {/* Result Card */}
        {results && currentSubject && (
          <PredictorResult 
            results={results}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
