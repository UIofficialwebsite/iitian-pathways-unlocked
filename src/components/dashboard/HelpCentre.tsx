import React, { useState } from 'react';
import { Search, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const HelpCentre = () => {
  const [activeTab, setActiveTab] = useState<'Help Centre' | 'Notice Board'>('Help Centre');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const faqItems: FAQItem[] = [
    {
      question: "How do I access my enrolled batches?",
      answer: "Navigate to the 'Study Portal' from the sidebar. Under 'My Classroom', click on 'My Batches' to see all your active enrollments."
    },
    {
      question: "Where can I find class notes and PYQs?",
      answer: "Go to the 'Digital Library' section. You can toggle between PYQs, Short Notes, and other resources using the tabs at the top of the page."
    },
    {
      question: "How to update my profile details?",
      answer: "Click on your profile picture in the top right corner and select 'My Profile'. You can edit your academic details and preferences there."
    },
    {
      question: "My FastTrack batch is not showing up.",
      answer: "Please ensure you have selected the correct 'Focus Area' (e.g., JEE, NEET). You can switch your focus area from the sidebar top menu."
    },
    {
      question: "How do I join a live class?",
      answer: "Live classes appear in your batch schedule 10 minutes before the start time. Click the 'Join Now' button on your batch dashboard."
    },
    {
      question: "Can I download lectures for offline viewing?",
      answer: "Yes, if your batch supports it, you will see a download icon next to the lecture video in the player."
    },
    {
      question: "How to contact support for payment issues?",
      answer: "Please email us at support@unknowniitians.live with your transaction ID and registered email address."
    }
  ];

  const displayedItems = showAll ? faqItems : faqItems.slice(0, 5);

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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
                  ? 'bg-white text-blue-600 font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'bg-transparent text-slate-500 font-medium hover:text-slate-700'
              }`}
            >
              Help Centre
            </button>
            <button
              onClick={() => setActiveTab('Notice Board')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                activeTab === 'Notice Board'
                  ? 'bg-white text-blue-600 font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
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
              className="w-full py-3 px-4 pr-11 border border-[#eef2f6] bg-[#fafbfc] rounded-xl text-sm outline-none text-slate-800 placeholder:text-slate-400 focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-all"
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
              {displayedItems.map((item, index) => {
                const isOpen = expandedIndex === index;
                return (
                  <div
                    key={index}
                    onClick={() => toggleAccordion(index)}
                    className={`bg-[#f0f3ff] rounded-lg overflow-hidden transition-all duration-200 group border border-transparent ${
                      isOpen ? 'bg-blue-50/50 border-blue-100' : 'hover:bg-[#e8ebff] hover:scale-[1.002] cursor-pointer'
                    }`}
                  >
                    <div className="p-[18px_24px] flex justify-between items-center">
                      <span className={`text-[15px] font-medium transition-colors ${
                        isOpen ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'
                      }`}>
                        {item.question}
                      </span>
                      <div className={`transition-transform duration-200 shrink-0 ml-4 ${
                         isOpen ? 'rotate-90 text-blue-600' : 'text-slate-500 group-hover:text-blue-600'
                      }`}>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                    
                    {/* Accordion Answer */}
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-5 pt-0">
                          <p className="text-[15px] font-normal text-gray-900 leading-relaxed border-t border-blue-100/50 pt-4">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8 border-t border-slate-100 pt-5">
              <button 
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center justify-center gap-1.5 text-blue-600 text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer transition-colors hover:text-blue-700"
              >
                {showAll ? (
                  <>Show Less <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Show More <ChevronDown className="w-4 h-4" /></>
                )}
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
