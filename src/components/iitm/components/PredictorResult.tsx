import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Share, CheckCircle, XCircle } from "lucide-react";

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
    <div className="w-full mt-12 font-['Inter'] text-[#000000] animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* CAPTURE AREA */}
      <div ref={resultRef} className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm relative w-full pb-16 font-['Inter']">
        
        {/* SECTION: PREDICTION TABLE */}
        <div className="mb-6 w-full">
          <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-4 border-b border-gray-100 pb-2 uppercase tracking-wide font-['Inter']">
            Required End Term Scores
          </span>
          
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="w-full text-sm text-left font-['Inter']">
              <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 border-b border-gray-200 w-1/3">Target Grade</th>
                  <th className="px-6 py-4 border-b border-gray-200 text-center w-1/3">Required Score</th>
                  <th className="px-6 py-4 border-b border-gray-200 text-right w-1/3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map(grade => {
                  const data = results[grade];
                  const isPossible = data.possible && data.required !== null;
                  
                  return (
                    <tr key={grade} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-base border border-slate-200">
                          {grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isPossible ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-gray-900">{data.required}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">out of 100</span>
                          </div>
                        ) : (
                          <span className="text-gray-300 font-medium text-lg">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPossible ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle className="w-3.5 h-3.5" /> Possible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                            <XCircle className="w-3.5 h-3.5" /> Impossible
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
        <div className="mb-2 w-full px-1">
           <p className="text-xs text-gray-500 italic font-['Inter'] leading-relaxed">
             <span className="font-semibold text-gray-700">* Impossible</span> indicates that mathematically, the target grade cannot be achieved even with a perfect score (100/100) in the End Term Exam based on current internal marks.
           </p>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-4 right-6 text-[10px] font-['Inter'] font-semibold text-gray-300 uppercase tracking-widest pointer-events-none">
          IITM Pathways Unlocked
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between items-center mt-8 px-2 font-['Inter']">
        <button onClick={onReset} className="text-[13px] text-gray-500 underline font-medium hover:text-black transition-colors">
          Start Over
        </button>
        <button onClick={handleShareImage} className="bg-black text-white px-6 py-3 text-[13px] font-semibold uppercase hover:bg-gray-800 transition-colors flex items-center gap-2 rounded-md shadow-sm">
          <Share className="w-4 h-4" />
          Share Results
        </button>
      </div>

    </div>
  );
}
