import React, { useState } from 'react';
import { Search, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode; 
}

const HelpCentre = () => {
  const [activeTab, setActiveTab] = useState<'Help Centre' | 'Notice Board'>('Help Centre');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems: FAQItem[] = [
    {
      question: "Where can I find notes and PYQs?",
      answer: (
        <span>
          Enrolled batch class notes will be in the{" "}
          <a 
            href="https://ssp.unknowniitians.live" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-medium"
          >
            SSP Portal
          </a>. 
          For free notes and PYQs, please check the <strong>Digital Library</strong> or <strong>Exam Preparation</strong> sections.
        </span>
      )
    },
    {
      question: "How do I join live classes?",
      answer: "Live classes are conducted according to the schedule. You can join them from the dashboard by navigating to the 'My Classroom' section."
    },
    {
      question: "Is offline viewing possible?",
      answer: "Offline viewing is not possible."
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
      question: "How to contact support?",
      answer: "Please email us at support@unknowniitians.live with your query."
    },
    {
      question: "I forgot my password, how do I reset it?",
      answer: "You can reset your password from the login screen by clicking 'Forgot Password'. A reset link will be sent to your registered email."
    }
  ];

  // Search Filtering Logic
  const filteredItems = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If searching, show all matches. Otherwise, respect showAll/slice logic
  const displayedItems = searchQuery 
    ? filteredItems 
    : (showAll ? filteredItems : filteredItems.slice(0, 5));

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "mailto:support@unknowniitians.live?cc=unknowniitians@gmail.com";
  };

  return (
    <div className="w-full flex justify-center py-6 sm:py-8 px-4 bg-[#fcfdfe] min-h-full font-sans">
      <div className="bg-white w-full max-w-[960px] rounded-2xl p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] h-fit border border-gray-100/50">
        
        {/* Top Navigation & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="bg-[#f4f7fa] p-1.5 rounded-xl flex gap-1 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('Help Centre')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm transition-all duration-200 ${
                activeTab === 'Help Centre'
                  ? 'bg-white text-blue-600 font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'bg-transparent text-slate-500 font-medium hover:text-slate-700'
              }`}
            >
              Help Centre
            </button>
            <button
              onClick={() => setActiveTab('Notice Board')}
              className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-sm transition-all duration-200 ${
                activeTab === 'Notice Board'
                  ? 'bg-white text-blue-600 font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'bg-transparent text-slate-500 font-medium hover:text-slate-700'
              }`}
            >
              Notice Board
            </button>
          </div>

          <div className="relative w-full sm:w-[300px]">
            <input
              type="text"
              placeholder="Type your query here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 px-4 pr-10 border border-[#eef2f6] bg-[#fafbfc] rounded-xl text-sm outline-none text-slate-800 placeholder:text-slate-400 focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'Help Centre' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-5">
              {searchQuery ? `Search results for "${searchQuery}"` : "Tell us how we can help 👋"}
            </h3>

            <div className="flex flex-col gap-2.5 min-h-[200px]">
              {displayedItems.length > 0 ? (
                displayedItems.map((item, index) => {
                  const isOpen = expandedIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => toggleAccordion(index)}
                      className={`bg-[#f0f3ff] rounded-lg overflow-hidden transition-all duration-200 group border border-transparent ${
                        isOpen ? 'bg-blue-50/50 border-blue-100' : 'hover:bg-[#e8ebff] hover:scale-[1.002] cursor-pointer'
                      }`}
                    >
                      <div className="p-4 sm:px-6 flex justify-between items-center">
                        <span className={`text-[14px] sm:text-[15px] font-medium transition-colors ${
                          isOpen ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {item.question}
                        </span>
                        <div className={`transition-transform duration-200 shrink-0 ml-4 ${
                           isOpen ? 'rotate-90 text-blue-600' : 'text-slate-500 group-hover:text-blue-600'
                        }`}>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                      
                      {/* Accordion Answer */}
                      <div 
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-4 sm:px-6 pb-4 pt-0">
                            <div className="text-[14px] sm:text-[15px] font-normal text-black leading-relaxed border-t border-blue-100/50 pt-3 font-sans">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-500">
                  No results found for your query.
                </div>
              )}
            </div>

            {/* Show More / Less Link */}
            {!searchQuery && faqItems.length > 5 && (
              <div className="text-center mt-6 border-t border-slate-100 pt-4">
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
            )}

            {/* Compact Support Banner Section */}
            <div className="mt-8 bg-white w-full border border-[#e2e8f0] rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.02)] gap-6">
               <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-lg sm:text-xl font-semibold text-[#1a1a1a] mb-2 tracking-tight">
                    Still need help?
                  </h2>
                  <p className="text-sm text-slate-500 mb-5 font-normal leading-snug">
                    Have Queries? Please get in touch & we will help you.
                  </p>
                  <a 
                    href="#" 
                    onClick={handleContactClick}
                    className="inline-block bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 hover:bg-blue-700 hover:-translate-y-[1px] hover:shadow-md shadow-blue-600/10"
                  >
                    Contact Us
                  </a>
               </div>
               
               <div className="flex-shrink-0 order-first sm:order-last">
                  <img 
                    src="https://i.ibb.co/Xz9Zrtn/image.png" 
                    alt="Support" 
                    className="w-[120px] sm:w-[140px] h-auto object-contain block"
                  />
               </div>
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
