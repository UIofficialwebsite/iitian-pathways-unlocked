import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ALL_SUBJECTS } from "./data/subjectsData";
import { calculateGradeByLevel, getGradeLetter, getGradePoints } from "./utils/gradeCalculations";
import { Level } from "./types/gradeTypes";
import ScoreInputForm from "./components/ScoreInputForm";
import GradeResult from "./components/GradeResult";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface GradeCalculatorProps {
  level: Level;
  branch: "data-science" | "electronic-systems";
}

export default function GradeCalculator({ level, branch }: GradeCalculatorProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for input values and calculation result only
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; letter: string; points: number } | null>(null);

  // 1. Get the list of subjects for the current Level/Branch
  const filteredSubjects = useMemo(() => {
    const getSubjectsKey = () => {
      if (branch === "electronic-systems") {
        if (level === "foundation") return "foundation-electronic-systems";
        if (level === "diploma") return "diploma-electronic-systems";
        if (level === "degree") return "degree-electronic-systems";
      }
      return level;
    };
    return ALL_SUBJECTS[getSubjectsKey()] || [];
  }, [branch, level]);

  // 2. Derive the current subject strictly from the URL parameter
  const urlSubjectKey = searchParams.get("subject");
  const currentSubject = useMemo(() => 
    filteredSubjects.find(s => s.key === urlSubjectKey),
    [filteredSubjects, urlSubjectKey]
  );

  // 3. Effect: Handle tab switching or invalid URLs
  // If the URL has a subject that doesn't exist in the current tab/branch, clear it.
  useEffect(() => {
    if (urlSubjectKey && !currentSubject) {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("subject");
        return newParams;
      }, { replace: true });
    }
  }, [urlSubjectKey, currentSubject, setSearchParams]);

  // 4. Effect: Clean up inputs when the subject changes
  useEffect(() => {
    setInputValues({});
    setResult(null);
  }, [currentSubject?.key]);

  const handleSubjectChange = (val: string) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (val) {
        newParams.set("subject", val);
      } else {
        newParams.delete("subject");
      }
      return newParams;
    });
  };

  const handleInputChange = (fieldId: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputValues(prev => ({ ...prev, [fieldId]: value }));
    }
  };

  const calculateGrade = () => {
    if (!currentSubject) return;

    const numericValues: Record<string, number> = {};
    Object.keys(inputValues).forEach(key => {
      numericValues[key] = parseFloat(inputValues[key]) || 0;
    });

    const score = calculateGradeByLevel(level, currentSubject.key, numericValues);
    
    setResult({
      score: Math.round(score * 100) / 100,
      letter: getGradeLetter(score),
      points: getGradePoints(score)
    });
  };

  const resetCalculator = () => {
    setInputValues({});
    setResult(null);
  };

  return (
    <div className="w-full bg-white font-sans text-gray-900">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-8">
        
        {/* 01. Select Course */}
        <div className="mb-10 w-full max-w-3xl relative z-50">
          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-sans mb-3 block">
            01. Select Course
          </Label>
          
          <Select 
            value={currentSubject?.key || ""} 
            onValueChange={handleSubjectChange}
          >
            <SelectTrigger className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-sans font-normal relative z-10">
              <SelectValue placeholder="Choose a subject..." />
            </SelectTrigger>
            
            {/* z-[9999] ensures dropdown is always on top */}
            <SelectContent className="z-[9999] max-h-[300px] bg-white border-2 border-gray-200 shadow-xl">
              {filteredSubjects.map((subject) => (
                <SelectItem 
                  key={subject.key} 
                  value={subject.key} 
                  className="font-sans cursor-pointer py-3 text-base focus:bg-gray-100 border-b border-gray-100 last:border-0"
                >
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 02. Enter Scores */}
        <div className="relative z-0">
          {currentSubject && (
            <ScoreInputForm 
              subject={currentSubject}
              inputValues={inputValues}
              onInputChange={handleInputChange}
              onCalculate={calculateGrade}
            />
          )}
        </div>

        {/* Result Card */}
        {result && (
          <GradeResult 
            result={result} 
            onReset={resetCalculator} 
          />
        )}
      </div>
    </div>
  );
}
