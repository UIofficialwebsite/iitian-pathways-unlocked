import React, { useState } from 'react';
import { Search, ChevronRight, ChevronUp } from 'lucide-react';

const HelpCentre = () => {
  const [activeTab, setActiveTab] = useState<'Help Centre' | 'Notice Board'>('Help Centre');

  const faqItems = [
    "How to Track PW store order/order status?",
    "I want to change my mobile number on PW App",
    "How to Join Live Class ?",
    "How to find lecture planner, class schedule and test planner ?",
    "How to use Mentorship",
    "How to enroll in Power Batch (web)"
  ];

  return (
    <div className="w-full flex justify-center py-6 sm:py-10 px-4 sm:px-5 bg-[#fcfdfe] min-h-full font-sans">
      <div className="bg-white w-full max-w-[960px] rounded-2xl p-6 sm:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.03)] h-fit border border-gray-100/50">
        {/* Top Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-5">
          <div className="bg-[#f4f7fa] p-1.5 rounded-xl flex gap-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('Help Centre')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeTab === 'Help Centre'
                  ? 'bg-white text-[#5a4bda] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'bg-transparent text-slate-500 font-medium hover:text-slate-700'
              }`}
            >
              Help Centre
            </button>
            <button
              onClick={() => setActiveTab('Notice Board')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeTab === 'Notice Board'
                  ? 'bg-white text-[#5a4bda] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'bg-transparent text-slate-500 font-medium hover:text-slate-700'
              }`}
            >
              Notice Board
            </button>
          </div>

          <div className="relative w-full sm:w-[320px]">
            <input
              type="text"
              placeholder="Type your query here..."
              className="w-full py-3 px-4 pr-11 border border-[#eef2f6] bg-[#fafbfc] rounded-xl text-sm outline-none text-slate-800 placeholder:text-slate-400 focus:border-[#5a4bda]/20 focus:ring-2 focus:ring-[#5a4bda]/10 transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'Help Centre' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Tell us how we can help 👋</h3>

            <div className="flex flex-col gap-3">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#f0f3ff] rounded-lg p-[18px_24px] flex justify-between items-center cursor-pointer transition-all duration-200 hover:bg-[#e8ebff] hover:scale-[1.002] group"
                >
                  <span className="text-[15px] font-medium text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-1">
                    {item}
                  </span>
                  <div className="text-slate-500 group-hover:text-[#5a4bda] transition-colors shrink-0 ml-4">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 border-t border-slate-100 pt-5">
              <button className="inline-flex items-center justify-center gap-1.5 text-[#5a4bda] text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer">
                Show Less <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 animate-in fade-in slide-in-from-bottom-2 duration-300 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="font-medium">No new notices at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCentre;
