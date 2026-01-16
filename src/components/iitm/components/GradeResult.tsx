import React from "react";
import { Share } from "lucide-react";

interface GradeResultProps {
  result: {
    score: number;
    letter: string;
    points: number;
  };
  onReset: () => void;
}

export default function GradeResult({ result, onReset }: GradeResultProps) {
  
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
    <div className="w-full animate-in zoom-in-95 duration-500 ease-out mt-8 font-sans">
      
      {/* Black Result Card */}
      <div className="bg-black text-white rounded-2xl p-8 py-12 text-center shadow-xl mb-6 relative overflow-hidden max-w-[500px] mx-auto">
        
        {/* Subtle decorative gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 via-gray-500 to-gray-800 opacity-20"></div>

        <span className="block text-[13px] font-semibold uppercase tracking-[0.2em] opacity-60 mb-4 text-gray-300">
          Expected Grade
        </span>
        
        <div className="text-[110px] font-semibold leading-none tracking-tighter mb-8 text-white">
          {result.letter}
        </div>

        <div className="flex justify-center gap-12 pt-8 border-t border-white/15">
          <div className="flex flex-col items-center">
            <span className="block text-[28px] font-semibold">{result.score}</span>
            <span className="text-[11px] font-semibold uppercase opacity-50 mt-1 tracking-wider">Total Marks</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="block text-[28px] font-semibold">{result.points}</span>
            <span className="text-[11px] font-semibold uppercase opacity-50 mt-1 tracking-wider">Grade Point</span>
          </div>
        </div>
      </div>

      {/* Actions */}
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
