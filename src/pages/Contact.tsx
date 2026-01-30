import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageSEO } from "@/utils/seoManager";

const Contact = () => {
  usePageSEO("Contact Us | Unknown IITians", "/contact");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      
      {/* Added pt-28 to account for navbar and provide top spacing like other pages */}
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
                We aim to resolve your queries as quickly as possible. You can call on our official Contact No.{" "}
                <span className="font-semibold text-gray-900">+91 62971 43798</span>. 
                If the phone is busy, we might be resolving someone else's queries. We request you to contact us 
                again after 15 minutes so that we can address your query or concern regarding lectures or course material.
              </p>
              <p>
                In case of any grievance, don't hesitate to get in touch with us on our official contact number{" "}
                <span className="font-semibold text-gray-900">+91 62971 43798</span>. Or you can write to us at{" "}
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
                <p>Unit 2401, 24th Floor,</p>
                <p>E-Square Supertech, Plot C2,</p>
                <p>Sector 96, Noida,</p>
                <p>Uttar Pradesh 201303</p>
              </div>

              <div>
                <a 
                  href="mailto:desk@unknowniitians.com" 
                  className="inline-block text-[#1d4ed8] hover:text-blue-700 font-medium text-sm md:text-[15px] mb-6 transition-colors"
                >
                  desk@unknowniitians.com
                </a>

                <div>
                  <a 
                    href="https://maps.google.com/maps?q=E-Square+Supertech,+Noida" 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <Button 
                      variant="outline" 
                      className="border-[#1d4ed8] text-[#1d4ed8] hover:bg-blue-50 font-medium px-6 h-10 text-sm"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Section: Map Panel */}
            <div className="w-full lg:w-2/3 h-[450px] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.6664536248366!2d77.3562629761595!3d28.54974868783451!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5f661a5b81b%3A0xc4825925e0160d78!2sSupertech%20e-Square!5e0!3m2!1sen!2sin!4v1709200000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Unknown IITians Location"
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
