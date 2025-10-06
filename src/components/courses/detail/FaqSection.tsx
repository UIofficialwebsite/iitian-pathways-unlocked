import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const FaqSection: React.FC = () => {
  const faqs = [
    {
      question: "How long do I have access to the course?",
      answer: "You have lifetime access to the course materials, including all future updates and additions."
    },
    {
      question: "Are there any prerequisites for this course?",
      answer: "While basic knowledge is helpful, the course is designed to be accessible to students at various skill levels. We start with fundamentals and gradually move to advanced topics."
    },
    {
      question: "Will I receive a certificate upon completion?",
      answer: "Yes! Upon successful completion of the course and all assignments, you will receive a certificate of completion that you can share on LinkedIn and your resume."
    },
    {
      question: "What is the refund policy?",
      answer: "We offer a 7-day money-back guarantee. If you're not satisfied with the course within the first week, you can request a full refund, no questions asked."
    },
    {
      question: "How is the course delivered?",
      answer: "The course is delivered through pre-recorded video lectures, live Q&A sessions, downloadable resources, and hands-on assignments. You can learn at your own pace."
    },
    {
      question: "Is there any support available if I get stuck?",
      answer: "Absolutely! We provide multiple support channels including discussion forums, live Q&A sessions, and direct messaging with instructors."
    }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-600">Got questions? We've got answers!</p>
        </div>
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FaqSection;
