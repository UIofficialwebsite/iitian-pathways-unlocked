import React, { useState, useMemo } from "react";
import { ALL_SUBJECTS } from "./data/subjectsData";
import { calculateGradeByLevel, getGradeLetter, getGradePoints } from "./utils/gradeCalculations";
import { Level } from "./types/gradeTypes";
import ScoreInputForm from "./components/ScoreInputForm";
import GradeResult from "./components/GradeResult";

interface GradeCalculatorProps {
  level: Level;
  branch: "data-science" | "electronic-systems";
}

export default function GradeCalculator({ level, branch }: GradeCalculatorProps) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; letter: string; points: number } | null>(null);

  // Filter subjects based on branch/level
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

  const currentSubject = filteredSubjects.find(s => s.key === selectedSubject);

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
    setInputValues({});
    setResult(null);
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
    <div className="w-full p-6 font-sans text-black">
      
      {/* 01. Select Course */}
      <div className="mb-10 w-full">
        <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999] mb-4">
          01. Select Course
        </span>
        <div className="relative w-full">
          <select 
            value={selectedSubject} 
            onChange={handleSubjectChange}
            className="w-full h-[54px] px-4 bg-[#f4f4f5] border-2 border-[#f4f4f5] rounded-lg text-base font-medium text-black appearance-none outline-none focus:bg-white focus:border-black transition-all cursor-pointer"
          >
            <option value="">Choose a course...</option>
            {filteredSubjects.map((subject) => (
              <option key={subject.key} value={subject.key}>
                {subject.name}
              </option>
            ))}
          </select>
          
          {/* Custom Chevron Icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
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
  );
}
