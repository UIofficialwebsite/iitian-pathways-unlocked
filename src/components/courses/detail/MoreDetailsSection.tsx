import React from 'react';
import { Check } from 'lucide-react';

const MoreDetailsSection: React.FC = () => {
  const details = [
    "PDF Notes of each Class will be uploaded on SSP.",
    "Daily Practice Problems will be uploaded on the SSP.",
    "Peer to Peer doubt solving will be provided.",
    "The complete course will be accessible to all the students until the End Sem Exam.",
    "The registration fee is included in the price of the batch which is showing on the website. The breakup of registration fee will be mentioned on invoice. You may be provided with access to Notes, PYQ's, Lectures & other materials, the access can vary depending on the batch you purchase, so that exact details might change from one batch to another."
  ];

  return (
    <section className="border-t pt-12">
      <h2 className="text-3xl font-bold mb-6">More Details</h2>
      
      <ul className="space-y-3">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="text-primary text-lg mt-1 flex-shrink-0">
              <Check className="h-5 w-5" />
            </span>
            <span className="text-muted-foreground leading-relaxed">
              {detail}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default MoreDetailsSection;
