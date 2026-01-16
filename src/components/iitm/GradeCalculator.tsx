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
  
  // Initialize subject from URL if available
  const initialSubject = searchParams.get("subject") || "";
  
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; letter: string; points: number } | null>(null);

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

  // Validate and sync subject with filtered list
  useEffect(() => {
    const validSubject = filteredSubjects.find(s => s.key === selectedSubject);
    if (!validSubject && selectedSubject !== "") {
      // If the URL subject doesn't belong to this level/branch, clear it
      setSelectedSubject("");
    }
  }, [filteredSubjects, selectedSubject]);

  const currentSubject = filteredSubjects.find(s => s.key === selectedSubject);

  const handleSubjectChange = (val: string) => {
    setSelectedSubject(val);
    setInputValues({});
    setResult(null);
    
    // Update URL path/query when filter changes
    setSearchParams(prev => {
      if (val) {
        prev.set("subject", val);
      } else {
        prev.delete("subject");
      }
      return prev;
    }, { replace: true });
  };

  const handleInputChange = (fieldId: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputValues(prev => ({ ...prev, [fieldId]: value }));
    }
  };

  const calculateGrade = () => {
    if (!selectedSubject || !currentSubject) return;

    const numericValues: Record<string, number> = {};
    Object.keys(inputValues).forEach(key => {
      numericValues[key] = parseFloat(inputValues[key]) || 0;
    });

    const score = calculateGradeByLevel(level, selectedSubject, numericValues);
    
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
        <div className="mb-10 w-full max-w-3xl">
          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-600 font-sans mb-3 block">
            01. Select Course
          </Label>
          <Select value={selectedSubject} onValueChange={handleSubjectChange}>
            <SelectTrigger className="h-12 w-full text-lg bg-white border-2 border-gray-300 focus:border-black focus:ring-0 rounded-sm font-sans font-normal">
              <SelectValue placeholder="Choose a subject..." />
            </SelectTrigger>
            <SelectContent>
              {filteredSubjects.map((subject) => (
                <SelectItem key={subject.key} value={subject.key} className="font-sans">
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 02. Enter Scores */}
        {currentSubject && (
          <ScoreInputForm 
            subject={currentSubject}
            inputValues={inputValues}
            onInputChange={handleInputChange}
            onCalculate={calculateGrade}
          />
        )}

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
