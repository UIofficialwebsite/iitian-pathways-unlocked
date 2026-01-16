import React from "react";
import { getGradeFormula } from "../utils/gradeCalculations";

interface GradeResultProps {
  result: {
    score: number;
    letter: string;
    points: number;
  };
  inputValues: Record<string, string>;
  subjectKey: string;
  onReset: () => void;
}

export default function GradeResult({ result, inputValues, subjectKey, onReset }: GradeResultProps) {
  const formula = getGradeFormula(subjectKey);

  const handleShare = async () => {
    const text = `My expected grade is ${result.letter} (${result.score}%)! Checked with UI Grade Planner.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Grades', text: text, url: window.location.href });
      } catch (err) { console.log('Error sharing:', err); }
    } else {
      navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  // Conditional Color Logic: Green for Pass (S,A,B,C,D,E), Red for Fail (U)
  const gradeColor = result.letter === 'U' ? '#d32f2f' : '#16a34a';

  return (
    <div className="w-full max-w-[800px] mx-auto mt-12 font-['Inter'] text-[#000000]">
      
      {/* SECTION 1: OVERVIEW */}
      <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-3 mt-0">Overview</span>
      <table className="w-full border-collapse border border-black mb-10">
        <tbody>
          <tr>
            <td className="border border-black p-5 text-center w-1/3">
              <span className="block text-[11px] font-semibold text-[#666666] uppercase mb-2">Expected Grade</span>
              <span className="text-[40px] font-extrabold" style={{ color: gradeColor }}>
                {result.letter}
              </span>
            </td>
            <td className="border border-black p-5 text-center w-1/3">
              <span className="block text-[11px] font-semibold text-[#666666] uppercase mb-2">Total Marks</span>
              <span className="text-[26px] font-extrabold text-black">{result.score}</span>
            </td>
            <td className="border border-black p-5 text-center w-1/3">
              <span className="block text-[11px] font-semibold text-[#666666] uppercase mb-2">Grade Point</span>
              <span className="text-[26px] font-extrabold text-black">{result.points}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* SECTION 2: SCORE BREAKDOWN */}
      <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-3">Score Breakdown</span>
      <table className="w-full border-collapse border border-black mb-10 text-[14px]">
        <thead>
          <tr>
            <th className="border border-black bg-[#f8f9fa] font-bold text-[12px] uppercase tracking-wide p-4 text-left">
              Component Name
            </th>
            <th className="border border-black bg-[#f8f9fa] font-bold text-[12px] uppercase tracking-wide p-4 text-right w-[160px]">
              Input Value
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(inputValues).map(([key, value]) => (
            <tr key={key}>
              <td className="border border-black p-4 text-left">{key}</td>
              <td className="border border-black p-4 text-right font-bold">{value || "0"}</td>
            </tr>
          ))}
          <tr className="bg-[#fafafa]">
            <td className="border border-black p-4 text-left font-semibold">Final Calculated Score</td>
            <td className="border border-black p-4 text-right font-bold text-blue-600">{result.score}</td>
          </tr>
        </tbody>
      </table>

      {/* SECTION 3: CALCULATION LOGIC */}
      <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-3">Calculation Logic</span>
      <table className="w-full border-collapse border border-black text-[14px]">
        <thead>
          <tr>
            <th className="border border-black bg-[#f8f9fa] font-bold text-[12px] uppercase tracking-wide p-4 text-left">
              Applied Formula Logic
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-4 font-normal leading-relaxed break-all text-[#333333]">
              {formula}
            </td>
          </tr>
        </tbody>
      </table>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-between items-center mt-8">
        <button 
          onClick={onReset}
          className="text-[12px] text-[#999999] underline font-medium hover:text-black transition-colors"
        >
          Clear everything
        </button>
        
        <button 
          onClick={handleShare}
          className="bg-black text-white px-6 py-3 text-[13px] font-semibold uppercase hover:bg-[#333333] transition-colors"
        >
          Share Results
        </button>
      </div>

    </div>
  );
}
