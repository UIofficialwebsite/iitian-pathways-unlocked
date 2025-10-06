import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How long do I have access to the course?",
      answer: "You get lifetime access to all course materials, including recorded lectures, notes, and practice questions. Even after the live classes end, you can revisit the content anytime through the SSP Portal."
    },
    {
      question: "What if I miss a live class?",
      answer: "No worries! All live classes are automatically recorded and uploaded to the SSP Portal within 24 hours. You can watch them at your convenience."
    },
    {
      question: "How do I access the SSP Portal?",
      answer: "After enrollment, you'll receive login credentials via email. Simply visit our SSP Portal website and log in to access all course materials and features."
    },
    {
      question: "Can I get my doubts clarified?",
      answer: "Absolutely! You can ask your doubts during live classes, post them in the discussion forum, or use the dedicated doubt-clearing sessions on Sundays."
    },
    {
      question: "Will I receive a certificate?",
      answer: "Yes! Upon successful completion of the course and assignments, you'll receive a certificate of completion that you can share on your resume and LinkedIn."
    },
    {
      question: "What is the refund policy?",
      answer: "We offer a 7-day money-back guarantee. If you're not satisfied with the course within the first week, you can request a full refund, no questions asked."
    },
    {
      question: "Are the classes live or recorded?",
      answer: "The classes are conducted live, allowing real-time interaction with instructors. However, all sessions are recorded and made available on the portal for revision."
    },
    {
      question: "What is the batch size?",
      answer: "We maintain small batch sizes to ensure personalized attention. Typically, each batch has 25-30 students for optimal learning experience."
    }
  ];

  return (
    <section id="faqs" className="py-12 scroll-mt-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">Got questions? We've got answers!</p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, idx) => (
            <AccordionItem 
              key={idx} 
              value={`faq-${idx}`}
              className="border rounded-lg px-6 bg-card"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
