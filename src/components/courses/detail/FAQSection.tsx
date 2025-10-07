import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// 👇 These are the default questions that will appear on any page using this component.
const defaultFaqs = [
  {
    question: "What is the enrollment process for courses?",
    answer: "You can enroll in any course by clicking the 'Enroll Now' button on the course's detail page. You will be prompted to create an account or log in, and then you can proceed with the payment."
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes, we have a 30-day money-back guarantee. If you are not satisfied with the course for any reason, you can request a full refund within 30 days of your purchase."
  },
  {
    question: "Are the courses self-paced or live?",
    answer: "Most of our courses are self-paced, allowing you to learn at your convenience. Some advanced courses or workshops may include live sessions, which will be clearly mentioned in the course schedule."
  },
  {
    question: "Will I receive a certificate upon completion?",
    answer: "Absolutely. Upon successful completion of any course, you will receive a verifiable certificate that you can add to your resume and share on professional platforms like LinkedIn."
  }
];

interface FAQSectionProps {
  // This allows you to pass a different set of questions if needed for a specific page.
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
