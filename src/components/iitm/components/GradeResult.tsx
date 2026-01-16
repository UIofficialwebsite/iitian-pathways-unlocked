import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Share, Download } from "lucide-react";
import { getGradeFormula } from "../utils/gradeCalculations";
import { ALL_SUBJECTS } from "../data/subjectsData";
import { Subject } from "../../types/gradeTypes";

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
  const resultRef = useRef<HTMLDivElement>(null);
  const formula = getGradeFormula(subjectKey);

  // Helper to find the subject object to get real labels
  const getSubjectDetails = (): Subject | undefined => {
    for (const level in ALL_SUBJECTS) {
      const found = ALL_SUBJECTS[level].find((s) => s.key === subjectKey);
      if (found) return found;
    }
    return undefined;
  };

  const subjectDetails = getSubjectDetails();

  // Helper to map input keys (e.g., "Qz1") to Labels (e.g., "Quiz 1")
  const getLabelForKey = (key: string) => {
    const field = subjectDetails?.fields.find((f) => f.id === key);
    return field ? field.label : key;
  };

  // Helper to generate Legend based on formula keys
  const getFormulaLegend = (formula: string) => {
    const legendItems = [];
    if (formula.includes("F")) legendItems.push("F = End Term Exam");
    if (formula.includes("Qz")) legendItems.push("Qz = Quiz");
    if (formula.includes("GAA")) legendItems.push("GAA = Graded Assignment Avg");
    if (formula.includes("OP") || formula.includes("OPPE")) legendItems.push("OPPE = Online Programming Exam");
    if (formula.includes("PE")) legendItems.push("PE = Programming Exam");
    if (formula.includes("Bonus")) legendItems.push("Bonus = Extra Marks");
    
    return legendItems.length > 0 ? legendItems.join(", ") : "Standard Grading Components";
  };

  const handleShareImage = async () => {
    if (!resultRef.current) return;

    try {
      // Capture the element as a canvas
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: "#ffffff", // Ensure white background for image
        scale: 2, // Higher resolution
        useCORS: true,
      });

      const imageBlob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob(resolve, "image/png")
      );

      if (!imageBlob) throw new Error("Failed to generate image");

      const file = new File([imageBlob], "grade-result.png", { type: "image/png" });

      // Check if native sharing is supported (Mobile/Modern Browsers)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Expected Grade",
          text: `I calculated my expected grade for ${subjectDetails?.name || 'Course'}!`,
        });
      } else {
        // Fallback: Download the image
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = `Grade_Result_${subjectDetails?.name || "Report"}.png`;
        link.click();
        alert("Result image downloaded!");
      }
    } catch (err) {
      console.error("Error generating image:", err);
      alert("Could not generate image. Please try taking a screenshot.");
    }
  };

  // Conditional Color Logic
  const gradeColor = result.letter === 'U' ? '#d32f2f' : '#16a34a';

  return (
    <div className="w-full max-w-[800px] mx-auto mt-12 font-['Inter'] text-[#000000]">
      
      {/* CAPTURE AREA START */}
      <div ref={resultRef} className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm relative">
        
        {/* Branding Watermark */}
        <div className="absolute top-4 right-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest pointer-events-none">
          predicted by Unknown IITians
        </div>

        {/* SECTION 1: OVERVIEW */}
        <div className="mb-10">
          <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-3 border-b pb-2">Overview</span>
          <table className="w-full border-collapse border border-black table-fixed">
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
        </div>

        {/* SECTION 2: SCORE BREAKDOWN */}
        <div className="mb-10">
          <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-3 border-b pb-2">Score Breakdown</span>
          <table className="w-full border-collapse border border-black text-[14px]">
            <thead>
              <tr>
                <th className="border border-black bg-[#f8f9fa] font-bold text-[12px] uppercase tracking-wide p-4 text-left w-2/3">
                  Component Name
                </th>
                <th className="border border-black bg-[#f8f9fa] font-bold text-[12px] uppercase tracking-wide p-4 text-right w-1/3">
                  Input Value
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(inputValues).map(([key, value]) => (
                <tr key={key}>
                  <td className="border border-black p-4 text-left font-medium text-gray-800">
                    {getLabelForKey(key)}
                  </td>
                  <td className="border border-black p-4 text-right font-bold text-black">
                    {value || "0"}
                  </td>
                </tr>
              ))}
              <tr className="bg-[#fafafa]">
                <td className="border border-black p-4 text-left font-bold text-black">Final Calculated Score</td>
                <td className="border border-black p-4 text-right font-bold text-blue-700">{result.score}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 3: CALCULATION LOGIC */}
        <div className="mb-6">
          <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-3 border-b pb-2">Calculation Logic</span>
          <table className="w-full border-collapse border border-black text-[14px]">
            <thead>
              <tr>
                <th className="border border-black bg-[#f8f9fa] font-bold text-[12px] uppercase tracking-wide p-4 text-left">
                  Applied Formula Formula
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-4 bg-white">
                  <div className="font-mono text-[13px] leading-relaxed text-[#333333] mb-3">
                    {formula}
                  </div>
                  {/* Legend Section */}
                  <div className="text-[11px] text-gray-500 border-t pt-2 mt-1">
                    <span className="font-bold">Legend: </span>
                    {getFormulaLegend(formula)}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* CAPTURE AREA END */}

      {/* FOOTER ACTIONS */}
      <div className="flex justify-between items-center mt-8 px-2">
        <button 
          onClick={onReset}
          className="text-[13px] text-[#999999] underline font-medium hover:text-black transition-colors"
        >
          Clear everything
        </button>
        
        <button 
          onClick={handleShareImage}
          className="bg-black text-white px-6 py-3 text-[13px] font-semibold uppercase hover:bg-[#333333] transition-colors flex items-center gap-2 rounded-sm"
        >
          <Share className="w-4 h-4" />
          Share Results
        </button>
      </div>

    </div>
  );
}
