import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
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
    <section className="scroll-mt-24">
      <Card className="border border-border/60 shadow-sm">
        <CardContent className="p-5 md:p-6 lg:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-5">More Details</h2>
          <ul className="space-y-3">
            {details.map((detail, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-primary mt-0.5 flex-shrink-0">
                  <Check className="h-4 w-4 md:h-5 md:w-5" />
                </span>
                <span className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {detail}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};

export default MoreDetailsSection;
