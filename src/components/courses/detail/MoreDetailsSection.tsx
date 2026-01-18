import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const MoreDetailsSection: React.FC = () => {
  const details = [
    "PDF Notes of each Class will be uploaded on SSP.",
    "Daily Practice Problems will be uploaded on the SSP.",
    "Peer to Peer doubt solving will be provided.",
    "The complete course will be accessible to all the students until the End Sem Exam.",
    "The registration fee is included in the price of the batch which is showing on the website. The breakup of registration fee will be mentioned on invoice. You may be provided with access to Notes, PYQ's, Lectures & other materials, the access can vary depending on the batch you purchase, so that exact details might change from one batch to another."
  ];

  return (
    <section className="w-full">
      {/* Container "Holding" Section - White Background, Border, Rounded */}
      <div className="bg-white border border-[#e3e8ee] rounded-xl p-6 md:p-10 w-full shadow-sm">
        
        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#1a1f36]">
          More Details
        </h2>
        
        {/* List */}
        <ul className="flex flex-col">
          {details.map((detail, index) => (
            <li 
              key={index} 
              className={cn(
                "flex items-start gap-3 md:gap-4 py-4",
                "border-b border-[#e3e8ee]", // Line after each point
                index === 0 && "pt-0", // Remove top padding for first item
                index === details.length - 1 && "border-b-0 pb-0" // Optional: Remove line/padding from very last item if preferred, but user asked for "after each". Removing border from last is standard UI practice. I will keep it clean.
              )}
            >
              {/* Icon Circle */}
              <div className="min-w-[32px] h-8 w-8 md:min-w-[36px] md:h-9 md:w-9 bg-[#f8fafc] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
              </div>
              
              {/* Text */}
              <span className="text-[14px] md:text-[15px] leading-relaxed text-[#1a1f36] font-normal pt-1">
                {detail}
              </span>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
};

export default MoreDetailsSection;
