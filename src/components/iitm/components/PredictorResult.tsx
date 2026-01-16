import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Share } from "lucide-react";

interface PredictorResultProps {
  results: Record<string, { required: number | null; possible: boolean; finalGrade: number }>;
  onReset: () => void;
}

export default function PredictorResult({ results, onReset }: PredictorResultProps) {
  const resultRef = useRef<HTMLDivElement>(null);

  const handleShareImage = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
      const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!imageBlob) throw new Error("Failed to generate image");
      const file = new File([imageBlob], "grade-prediction.png", { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Grade Prediction", text: `Here are my required marks for each grade!` });
      } else {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "Grade_Prediction.png";
        link.click();
      }
    } catch (err) { console.error(err); alert("Share failed."); }
  };

  const grades = ['S', 'A', 'B', 'C', 'D', 'E'];

  return (
    <div className="w-full mt-12 font-['Inter'] text-[#000000]">
      
      {/* CAPTURE AREA */}
      <div ref={resultRef} className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm relative w-full pb-16">
        
        {/* SECTION: PREDICTION TABLE */}
        <div className="mb-6 w-full">
          <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-3 border-b pb-2">Required End Term Scores</span>
          
          <div className="overflow-hidden border border-gray-200 rounded-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 border-b">Target Grade</th>
                  <th className="px-6 py-3 border-b text-center">Required Exam Score</th>
                  <th className="px-6 py-3 border-b text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {grades.map(grade => {
                  const data = results[grade];
                  const isPossible = data.possible && data.required !== null;
                  
                  return (
                    <tr key={grade} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-base">{grade}</td>
                      <td className="px-6 py-4 text-center">
                        {isPossible ? (
                          <span className="text-lg font-bold text-gray-900">{data.required}<span className="text-xs text-gray-400 font-normal ml-1">/100</span></span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPossible ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Possible
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Impossible
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: NOTE */}
        <div className="mb-2 w-full">
           <p className="text-xs text-gray-500 italic">
             * "Impossible" means you cannot achieve this grade even with 100/100 in the final exam based on current internal scores.
           </p>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-4 right-6 text-[10px] font-sans font-semibold text-black uppercase tracking-widest pointer-events-none opacity-90">
          IITM Pathways Unlocked
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between items-center mt-8 px-2">
        <button onClick={onReset} className="text-[13px] text-[#999999] underline font-medium hover:text-black transition-colors">
          Clear everything
        </button>
        <button onClick={handleShareImage} className="bg-black text-white px-6 py-3 text-[13px] font-semibold uppercase hover:bg-[#333333] transition-colors flex items-center gap-2 rounded-sm">
          <Share className="w-4 h-4" />
          Share Results
        </button>
      </div>

    </div>
  );
}
