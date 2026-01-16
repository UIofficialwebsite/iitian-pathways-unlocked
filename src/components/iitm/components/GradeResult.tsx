import React from "react";

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
    const text = `My projected grade is ${result.letter} (${result.score}%)! Checked with UI Grade Planner.`;
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
    <div className="w-full max-w-[500px] mx-auto animate-in zoom-in-95 duration-500 ease-out mt-8">
      
      {/* 1. The Result Card (Black Block) */}
      <div className="bg-black text-white rounded-2xl p-8 py-12 text-center shadow-xl mb-6 relative overflow-hidden">
        
        {/* Subtle decorative gradient at top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-800 via-gray-500 to-gray-800 opacity-20"></div>

        {/* Label */}
        <span className="block text-[11px] font-bold uppercase tracking-[0.2em] opacity-50 mb-4 font-sans text-gray-300">
          Projected Grade
        </span>
        
        {/* Big Grade Letter */}
        <div className="text-[110px] font-black leading-none tracking-tighter mb-8 font-sans text-white">
          {result.letter}
        </div>

        {/* Stats Row (Bordered Top) */}
        <div className="flex justify-center gap-10 pt-8 border-t border-white/15">
          <div className="flex flex-col items-center">
            <span className="block text-[22px] font-bold font-sans">{result.score}</span>
            <span className="text-[10px] font-bold uppercase opacity-40 mt-1 font-sans tracking-wider">Total Marks</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="block text-[22px] font-bold font-sans">{result.points}</span>
            <span className="text-[10px] font-bold uppercase opacity-40 mt-1 font-sans tracking-wider">Grade Value</span>
          </div>
        </div>
      </div>

      {/* 2. Actions (Outside the card) */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={handleShare}
          className="w-full h-[54px] bg-white border-2 border-black text-black font-bold text-[15px] rounded-xl flex items-center justify-center gap-2.5 transition-all hover:bg-black hover:text-white active:scale-[0.98]"
        >
          <svg className="w-[18px] h-[18px] stroke-current stroke-[2.5] fill-none" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
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
