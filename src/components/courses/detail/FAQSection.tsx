import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// 👇 These are the new default questions you provided.
const defaultFaqs = [
  {
    question: "Why should I join this course and how will this be helpful?",
    answer: "This course is thoughtfully designed to strengthen your understanding from the ground up. Through structured lessons, live interaction, and guided practice, you’ll gain the confidence to learn, apply, and excel. It will not only help you perform better in exams but also give you conceptual clarity that stays with you long term."
  },
  {
    question: "How will the classes be conducted?",
    answer: "All classes are conducted live and interactive, allowing you to engage directly with mentors and clarify your doubts in real time. In case you miss a session, recordings of all live classes are made available on your dashboard so you can learn at your own pace."
  },
  {
    question: "Can the classes be downloaded?",
    answer: "Class recordings cannot be downloaded due to content protection, but you’ll have unlimited access to all recorded sessions through your dashboard during your course period."
  },
  {
    question: "What are the class days and timings?",
    answer: "You can check your class schedule anytime in the Schedule tab after enrollment. Sessions are generally conducted in the evenings or late evenings to ensure convenience for both students and working professionals."
  },
  {
    question: "How will I get my doubts answered?",
    answer: "You can ask your doubts directly during the live classes or through our dedicated Doubt Portal, where you can post questions anytime. Every query is reviewed and answered by our academic team within 24 hours, ensuring you never stay stuck."
  },
  {
    question: "What is the Refund Policy",
    answer: "Dear Students, Once a batch has been purchased, refunds are not applicable. This is because significant resources are already invested in providing the best possible learning experience — including our learning platform, technology infrastructure, academic team, and support staff. We kindly request you to make a well-informed and conscious decision before enrolling in any batch."
  }
];

interface FAQSectionProps {
  // This prop allows course-specific FAQs to override the defaults.
  faqs?: { question: string; answer: string }[]; 
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs = defaultFaqs }) => {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default FAQSection;
