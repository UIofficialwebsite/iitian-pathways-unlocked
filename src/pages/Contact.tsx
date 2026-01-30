import React from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageSEO } from "@/utils/seoManager";

const Contact = () => {
  usePageSEO("Contact Us | Unknown IITians", "/contact");

  return (
    <div className="min-h-screen flex flex-col bg-white font-['Inter',sans-serif]">
      <NavBar />
      
      <main className="flex-grow pt-24 pb-16 px-6 sm:px-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
            
            <div className="space-y-4 text-[15px] leading-relaxed text-gray-600 max-w-4xl">
              <p>
                This is the <span className="font-bold text-gray-900">official page of Unknown IITians</span>, 
                where you can share all your queries, feedback, complaints, or any concern you may have about 
                our mentorship programs, courses, and resources.
              </p>
              <p>
                Unknown IITians, a dedicated education platform, is here to help students solve their grievances. 
                We aim to resolve your queries as quickly as possible. You can call on our official Contact No.{" "}
                <span className="font-bold text-gray-900">+91 62971 43798</span>. 
                If the phone is busy, we might be resolving someone else's queries. We request you to contact us 
                again after 15 minutes so that we can address your query or concern regarding lectures or course material.
              </p>
              <p>
                In case of any grievance, don't hesitate to get in touch with us on our official contact number{" "}
                <span className="font-bold text-gray-900">+91 62971 43798</span>. Or you can write to us at{" "}
                <span className="font-bold text-gray-900">desk@unknowniitians.com</span>.
              </p>
            </div>
          </header>

          {/* Content Grid: Info Left, Map Right */}
          <div className="flex flex-col md:flex-row gap-10 items-start mt-12">
            
            {/* Left Section: Info Panel */}
            <div className="flex-1 w-full">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Unknown IITians</h2>
              <div className="text-lg font-semibold text-gray-700 mb-5">Headquarters</div>
              
              <div className="text-[15px] text-gray-600 mb-6 leading-relaxed max-w-xs">
                Unit 2401, 24th Floor,<br />
                E-Square Supertech, Plot C2,<br />
                Sector 96, Noida,<br />
                Uttar Pradesh 201303
              </div>

              <a 
                href="mailto:desk@unknowniitians.com" 
                className="block text-[#1d4ed8] hover:text-blue-700 font-medium text-[15px] mb-8 transition-colors"
              >
                desk@unknowniitians.com
              </a>

              <a 
                href="https://www.google.com/maps/search/?api=1&query=Unknown+IITians+Noida" 
                target="_blank" 
                rel="noreferrer"
              >
                <Button 
                  variant="outline" 
                  className="border-[#1d4ed8] text-[#1d4ed8] hover:bg-blue-50 font-medium px-6 py-2 h-auto text-[15px]"
                >
                  <Send className="mr-2 h-4 w-4 rotate-45" />
                  Get Directions
                </Button>
              </a>
            </div>

            {/* Right Section: Map Panel */}
            <div className="flex-[1.2] w-full h-[400px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.666453962626!2d77.35987407550186!3d28.54974867571007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5f6c802271d%3A0xe67c06c544e3a478!2sSupertech%20E%20Square!5e0!3m2!1sen!2sin!4v1709289291932!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Unknown IITians Location"
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
