import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Share } from "lucide-react";

interface PredictorResultProps {
  result: {
    required: number | null;
    possible: boolean;
    finalGrade: number;
  };
  targetGrade: string;
  subjectKey: string;
  onReset: () => void;
}

export default function PredictorResult({ result, targetGrade, subjectKey, onReset }: PredictorResultProps) {
  const resultRef = useRef<HTMLDivElement>(null);

  const handleShareImage = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
      const imageBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!imageBlob) throw new Error("Failed to generate image");
      const file = new File([imageBlob], "grade-prediction.png", { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "Grade Prediction", text: `I need ${result.required} marks to get Grade ${targetGrade}!` });
      } else {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "Grade_Prediction.png";
        link.click();
      }
    } catch (err) { console.error(err); alert("Share failed."); }
  };

  const isPossible = result.possible && result.required !== null;
  const gradeColor = isPossible ? '#16a34a' : '#d32f2f'; // Green or Red

  return (
    <div className="w-full mt-12 font-['Inter'] text-[#000000]">
      
      {/* CAPTURE AREA */}
      <div ref={resultRef} className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm relative w-full pb-16">
        
        {/* SECTION 1: PREDICTION */}
        <div className="mb-10 w-full">
          <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-3 border-b pb-2">Prediction Result</span>
          
          <table className="w-full border-collapse border border-black table-fixed">
            <tbody>
              <tr>
                <td className="border border-black p-6 text-center w-1/2">
                  <span className="block text-[11px] font-semibold text-[#666666] uppercase mb-2">Target Grade</span>
                  <span className="text-[40px] font-extrabold text-black">
                    {targetGrade}
                  </span>
                </td>
                <td className="border border-black p-6 text-center w-1/2 bg-gray-50">
                  <span className="block text-[11px] font-semibold text-[#666666] uppercase mb-2">
                    Required Exam Score
                  </span>
                  {isPossible ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[40px] font-extrabold" style={{ color: gradeColor }}>
                        {result.required}
                        <span className="text-[16px] text-gray-400 font-bold ml-1">/ 100</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-[24px] font-bold text-red-600 uppercase">
                      Not Possible
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION 2: DETAILS */}
        <div className="mb-6 w-full">
          <span className="block text-[14px] font-semibold text-[#1a1a1a] mb-3 border-b pb-2">Analysis</span>
          <div className="border border-black p-5 bg-white text-[14px] leading-relaxed">
            {isPossible ? (
              <p>
                To achieve <strong>Grade {targetGrade}</strong>, you must score at least <strong>{result.required}</strong> marks in the End Term Exam. 
                This will bring your total course score to <strong>{Math.round(result.finalGrade * 100) / 100}</strong>.
              </p>
            ) : (
              <p>
                Based on your current internal scores, it is mathematically <strong>impossible</strong> to achieve Grade {targetGrade} 
                even if you score 100/100 in the End Term Exam. Please try calculating for a lower grade.
              </p>
            )}
          </div>
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
          Share Prediction
        </button>
      </div>

    </div>
  );
}
