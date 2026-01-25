import React, { useState, useEffect } from 'react';
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useDocumentTitle, SEO_TITLES } from "@/utils/seoManager";

const SECTIONS = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'collection', title: '2. Collection of Info' },
  { id: 'usage', title: '3. Use of Info' },
  { id: 'sharing', title: '4. Sharing of Info' },
  { id: 'safety', title: '5. Information Safety' },
  { id: 'optout', title: '6. Choice/Opt-Out' },
];

const PrivacyPolicy = () => {
  useDocumentTitle(SEO_TITLES.PRIVACY_POLICY);
  const [activeSection, setActiveSection] = useState('introduction');

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for sticky header
      
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 120,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-100">
      <NavBar />

      <main className="pt-32 pb-24 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Page Header */}
          <div className="mb-20 border-b border-gray-200 pb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">Privacy Policy</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-6 text-sm text-gray-500 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="hidden md:inline text-gray-300">|</span>
              <span>Unknown IITians</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-16 relative">
            
            {/* Sidebar Navigation (Sticky) */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-32">
                <nav className="flex flex-col space-y-1">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "text-left px-4 py-2 text-sm transition-colors duration-200 block w-full rounded-md",
                        activeSection === section.id
                          ? "text-gray-900 font-medium bg-gray-100" 
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
                <div className="mt-10 p-6 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    We process data in compliance with global privacy standards.
                  </p>
                  <a href="mailto:support@unknowniitians.live" className="text-xs font-bold text-gray-900 hover:underline flex items-center gap-1">
                    Contact Support <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-3xl">
              <div className="prose prose-gray prose-p:text-gray-600 prose-headings:text-gray-900 prose-headings:font-semibold prose-a:text-gray-900 prose-li:text-gray-600 max-w-none space-y-16">
                
                {/* Introduction */}
                <section id="introduction" className="scroll-mt-32">
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Please read the following Privacy Policy regarding the services made available on <strong className="text-gray-900">www.unknowniitians.live</strong> and its associated platforms (collectively referred to as the "Platform").
                  </p>
                  <p>
                    By accessing or using the Platform, you agree to be bound by the terms of this Privacy Policy. If you do not agree with these terms, please do not use the Platform. By providing your information, you consent to the collection and use of the information you disclose on our Platform in accordance with this Privacy Policy.
                  </p>
                  
                  <div className="bg-gray-50 border border-gray-100 p-6 rounded-lg mt-6">
                    <p className="text-sm text-gray-500">
                      <strong className="text-gray-900">Note:</strong> We may update this Privacy Policy from time to time to reflect changes in our practices. We encourage you to review this page periodically for the latest information on our privacy practices.
                    </p>
                  </div>
                </section>

                {/* 1. Collection */}
                <section id="collection" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">1. Collection of Personally Identifiable Information</h2>
                  
                  <p>
                    We collect certain information about you to help us serve you better. The information collected by us is of the following nature:
                  </p>
                  
                  <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li>Name, Telephone Number, and Email Address</li>
                    <li>Service Address and IP Address</li>
                    <li>Device and Network Information</li>
                    <li>College/Institution Details and Location</li>
                    <li>User uploaded photos and Identification Documents</li>
                    <li>Demographic information such as postcode, preferences, and interests</li>
                  </ul>

                  <div className="mt-8 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1.2 Registration Data</h3>
                      <p>
                        During registration, you may be asked to provide your username, password, email address, academic specialty, year of graduation, and institution name. We store your username, country, and specialty on our secure servers. Your password is cryptographically hashed, and sensitive contact details are encrypted.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1.3 Social Login</h3>
                      <p>
                        If you choose to register using third-party services (e.g., Google or Facebook), you allow us to access your profile information as permitted by that service's policies. Your use of such services is subject to their respective privacy policies.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">1.4 User Responsibility</h3>
                      <p>
                        You are solely responsible for maintaining the strict confidentiality of your account credentials. You agree to notify Unknown IITians immediately of any unauthorized use of your account. We are not liable for any loss arising from your failure to comply with this obligation.
                      </p>
                    </div>
                  </div>
                </section>

                {/* 2. Use of Information */}
                <section id="usage" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">2. Use of Personal Information</h2>
                  <p>
                    The information collected by us is used for various purposes to deliver a seamless experience:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li>Internal record keeping and service improvement.</li>
                    <li>To resolve disputes, detect fraud, and enforce our terms and conditions.</li>
                    <li>To send periodic promotional emails about new batches, special offers, or other information we think you may find interesting.</li>
                    <li>To customize the website according to your interests and preferences.</li>
                    <li>Your IP address is used to help diagnose server problems and administer our Platform.</li>
                  </ul>
                </section>

                {/* 3. Sharing of Information */}
                <section id="sharing" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">3. Sharing of Personal Information</h2>
                  <p className="mb-6">
                    We value your privacy and restrict the sharing of your personal information:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 not-prose">
                    <div className="p-6 rounded-lg border border-gray-100 bg-gray-50">
                      <strong className="text-gray-900 block mb-2 text-sm font-semibold">3.1 Service Providers & Legal</strong>
                      <p className="text-xs text-gray-500 leading-relaxed">We may share your information with payment service providers, regulatory authorities, and third-party agencies if required by law or to respond to legal processes.</p>
                    </div>
                    
                    <div className="p-6 rounded-lg border border-gray-100 bg-gray-50">
                      <strong className="text-gray-900 block mb-2 text-sm font-semibold">3.2 Business Transfers</strong>
                      <p className="text-xs text-gray-500 leading-relaxed">We may share or sell collected information if Unknown IITians merges with or is acquired by another business entity. The new entity will be required to follow this Privacy Policy.</p>
                    </div>

                    <div className="p-6 rounded-lg border border-gray-100 bg-gray-50 md:col-span-2">
                      <strong className="text-gray-900 block mb-2 text-sm font-semibold">3.3 Anonymized Data</strong>
                      <p className="text-xs text-gray-500 leading-relaxed">We do not disclose personal information to advertisers. However, we may share aggregate, anonymized data to help advertisers reach specific target audiences without identifying individuals.</p>
                    </div>
                  </div>
                </section>

                {/* 4. Information Safety */}
                <section id="safety" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">4. Information Safety</h2>
                  <div className="bg-gray-50 border border-gray-100 p-6 rounded-lg">
                    <h4 className="text-gray-900 font-bold text-sm mb-2">Secure Infrastructure</h4>
                    <p className="text-sm text-gray-500">
                      All information is saved and stored on servers secured with advanced encryption protocols, firewalls, and access controls. We adhere to strict industry-standard security guidelines to protect your data against unauthorized access, loss, or misuse.
                    </p>
                  </div>
                </section>

                {/* 5. Choice/Opt-Out */}
                <section id="optout" className="scroll-mt-32 border-t border-gray-200 pt-16">
                  <h2 className="text-2xl mb-6">5. Choice/Opt-Out</h2>
                  <p>
                    We provide all users with the opportunity to opt-out of receiving non-essential (promotional, marketing-related) communications.
                  </p>
                  
                  <div className="mt-6 flex flex-col gap-2 text-sm bg-gray-50 p-6 rounded-lg border border-gray-100">
                    <p className="text-gray-500 mb-2">If you wish to remove your contact information from all lists and newsletters, please contact us at:</p>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 w-16">Email:</span>
                      <a href="mailto:support@unknowniitians.live" className="text-gray-900 hover:underline">support@unknowniitians.live</a>
                    </div>
                  </div>
                </section>

                {/* Footer Legal Note */}
                <div className="pt-10 mt-16">
                   <p className="text-xs text-gray-400">
                     All other terms and conditions applicable under the Terms of Service will be applicable to you and read along with this Privacy Policy.
                   </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
