import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageSEO, SEO_TITLES } from "@/utils/seoManager";

const FAQ = () => {
  usePageSEO(SEO_TITLES.FAQ, "/faq");
  const faqs = [
    {
      question: "What is Unknown IITians?",
      answer: "Unknown IITians is an educational platform that provides comprehensive study materials, notes, and resources for competitive exams like JEE, NEET, and IITM BS."
    },
    {
      question: "How can I access the study materials?",
      answer: "You can access our study materials by creating a free account and browsing through our subject-wise content. Some premium content may require authentication."
    },
    {
      question: "Are the materials free?",
      answer: "Most of our basic study materials are free to access. We also offer premium courses and advanced materials for enhanced learning experience."
    },
    {
      question: "How often is the content updated?",
      answer: "Our content is regularly updated by our team of experts and contributors. We add new materials and update existing ones based on current exam patterns and syllabus changes."
    },
    {
      question: "Can I contribute content to the platform?",
      answer: "Yes! We welcome contributions from students and educators. Please contact our admin team for guidelines on content submission."
    },
    {
      question: "How do I report an issue or get support?",
      answer: "You can reach out to us at help.unknowniitians@gmail.com for any issues, feedback, or support requests. We typically respond within 24 hours."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take data security seriously. Please read our Privacy Policy for detailed information about how we protect and handle your personal data."
    },
    {
      question: "Can I download the study materials?",
      answer: "Yes, most of our materials are available for download. You can access download links after logging into your account."
    }
  ];

  return (
    <>
      <NavBar />
      
      <main className="pt-20">
        <section className="bg-gradient-to-r from-royal to-royal-dark text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Find answers to common questions about our platform
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <h3 className="text-lg font-semibold">{faq.question}</h3>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-gray-600 mb-6">
                Can't find the answer you're looking for? Please reach out to our support team.
              </p>
              <a 
                href="mailto:help.unknowniitians@gmail.com"
                className="inline-block bg-royal text-white px-8 py-3 rounded-lg hover:bg-royal-dark transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQ;
