import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';

const MoreDetailsSection: React.FC = () => {
  const details = [
    "PDF Notes of each Class will be uploaded on SSP.",
    "Daily Practice Problems will be uploaded on the SSP.",
    "Peer to Peer doubt solving will be provided.",
    "The complete course will be accessible to all the students until the End Sem Exam.",
    "The registration fee is included in the price of the batch which is showing on the website. The breakup of registration fee will be mentioned on invoice. You may be provided with access to Notes, PYQ’s, Lectures & other materials, the access can vary depending on the batch you purchase, so that exact details might change from one batch to another.",
  ];

  return (
    <section>
      <Card>
        <CardHeader>
          <CardTitle>More Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {details.map((detail, idx) => (
              <li key={idx} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
};

export default MoreDetailsSection;
