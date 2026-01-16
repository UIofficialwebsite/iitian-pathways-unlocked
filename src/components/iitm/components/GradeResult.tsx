import React from "react";
import { Share } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        await navigator.share({
          title: 'My Grades',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  return (
    <div className="w-full animate-in zoom-in-95 duration-500 ease-out mt-12 font-sans">
      
      {/* 1. Result Summary Card */}
      <div className="bg-black text-white rounded-2xl p-8 py-10 text-center shadow-xl mb-12 relative overflow-hidden max-w-[600px] mx-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 via-gray-500 to-gray-800 opacity-20"></div>
        
        <span className="block text-[13px] font-semibold uppercase tracking-[0.2em] opacity-60 mb-6 text-gray-300">
          Expected Grade
        </span>
        
        <div className="text-[100px] font-semibold leading-none tracking-tighter mb-8 text-white">
          {result.letter}
        </div>

        <div className="flex justify-center gap-16 pt-8 border-t border-white/15">
          <div className="flex flex-col items-center">
            <span className="block text-[28px] font-bold">{result.score}</span>
            <span className="text-[11px] font-medium uppercase opacity-50 mt-1 tracking-wider">Total Marks</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="block text-[28px] font-bold">{result.points}</span>
            <span className="text-[11px] font-medium uppercase opacity-50 mt-1 tracking-wider">Grade Point</span>
          </div>
        </div>
      </div>

      {/* 2. Detailed Breakdown Table */}
      <div className="max-w-4xl mx-auto mb-10 border rounded-lg overflow-hidden shadow-sm bg-white">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h3 className="font-bold text-gray-800">Calculation Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase text-gray-500 tracking-wider block mb-2">Applied Formula</span>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-700 break-all border border-gray-200">
              {formula}
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">Component</TableHead>
                <TableHead>Input Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(inputValues).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-medium text-gray-700">{key}</TableCell>
                  <TableCell>{value || "0"}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 font-bold">
                <TableCell>Final Calculated Score</TableCell>
                <TableCell className="text-blue-700">{result.score}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 3. Actions */}
      <div className="flex flex-col gap-3 max-w-[500px] mx-auto">
        <button 
          onClick={handleShare}
          className="w-full h-[54px] bg-white border-2 border-black text-black font-bold text-[15px] rounded-xl flex items-center justify-center gap-2.5 transition-all hover:bg-gray-200 active:scale-[0.98]"
        >
          <Share className="w-[18px] h-[18px] stroke-[2.5]" />
          Share Results
        </button>

        <button 
          onClick={onReset}
          className="text-[#999999] text-[13px] font-semibold underline py-2 hover:text-black transition-colors"
        >
          Clear everything
        </button>
      </div>

    </div>
  );
}
