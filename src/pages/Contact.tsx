import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { usePageSEO } from "@/utils/seoManager";

const Contact = () => {
  usePageSEO("Contact Us | Unknown IITians", "/contact");

  // WhatsApp Configuration
  const whatsappNumber = "916297143798";
  const prefilledMessage = encodeURIComponent("Hello Unknown IITians, I have a query regarding your courses.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${prefilledMessage}`;

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Inter',sans-serif]">
      <NavBar />
      
      {/* Page Content with top padding for navbar */}
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <header className="mb-14">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
              Contact Us
            </h1>
            
            <div className="space-y-4 text-sm md:text-[15px] leading-relaxed text-gray-600 max-w-5xl">
              <p>
                This is the <span className="font-semibold text-gray-900">official page of Unknown IITians</span>, 
                where you can share all your queries, feedback, complaints, or any concern you may have about 
                our mentorship programs, courses, and resources.
              </p>
              <p>
                Unknown IITians, a dedicated education platform, is here to help students solve their grievances. 
                <span className="block mt-2 font-medium text-gray-900">
                  Please note: We are currently unavailable on voice calls. All support is provided exclusively via WhatsApp.
                </span>
              </p>
              <p>
                We aim to resolve your queries as quickly as possible. You can chat with us on our official WhatsApp number{" "}
                <span className="font-semibold text-gray-900">+91 62971 43798</span>. 
                If we are busy, we request you to wait for a response; we typically reply within a few hours regarding lectures or course material.
              </p>
              <p>
                In case of any grievance, don't hesitate to get in touch with us on WhatsApp or write to us at{" "}
                <span className="font-semibold text-gray-900">desk@unknowniitians.com</span>.
              </p>
            </div>
          </header>

          {/* Content Grid: Info Left, Map Right */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start border-t border-gray-100 pt-12">
            
            {/* Left Section: Info Panel */}
            <div className="w-full lg:w-1/3 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Unknown IITians</h2>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Headquarters</div>
              </div>
              
              <div className="text-sm md:text-[15px] text-gray-600 leading-relaxed">
                <p>New Delhi,</p>
                <p>Delhi, India</p>
              </div>

              <div className="space-y-6">
                <a 
                  href="mailto:desk@unknowniitians.com" 
                  className="inline-block text-[#1d4ed8] hover:text-blue-700 font-medium text-sm md:text-[15px] transition-colors"
                >
                  desk@unknowniitians.com
                </a>

                <div className="flex flex-col gap-3">
                  {/* WhatsApp Button - Text Only */}
                  <a 
                    href={whatsappLink}
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <Button 
                      className="bg-[#25D366] hover:bg-[#128C7E] text-white font-medium px-8 h-10 text-sm w-full sm:w-auto"
                    >
                      Chat on WhatsApp
                    </Button>
                  </a>

                  {/* Directions Button - Text Only */}
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=New+Delhi" 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <Button 
                      variant="outline" 
                      className="border-[#1d4ed8] text-[#1d4ed8] hover:bg-blue-50 font-medium px-8 h-10 text-sm w-full sm:w-auto"
                    >
                      Get Directions
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Section: Map Panel */}
            <div className="w-full lg:w-2/3 h-[450px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.83923192776!2d77.0688975472578!3d28.52728034389636!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1709280000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Unknown IITians Location - New Delhi"
                className="filter grayscale-[20%] hover:grayscale-0 transition-all duration-500"
              ></iframe>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
