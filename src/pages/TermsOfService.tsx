import React, { useState, useEffect } from 'react';
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useDocumentTitle, SEO_TITLES } from "@/utils/seoManager";

const SECTIONS = [
  { id: 'agreement', title: '1. Agreement' },
  { id: 'description', title: '2. Service Description' },
  { id: 'accounts', title: '3. User Accounts' },
  { id: 'acceptable-use', title: '4. Acceptable Use' },
  { id: 'payment', title: '5. Payments & Refunds' },
  { id: 'ip', title: '6. Intellectual Property' },
  { id: 'privacy', title: '7. Privacy' },
  { id: 'disclaimer', title: '8. Disclaimers' },
  { id: 'verification', title: '9. Employment Verification' },
  { id: 'termination', title: '10. Termination' },
  { id: 'contact', title: '11. Contact Us' },
];

const TermsOfService = () => {
  useDocumentTitle(SEO_TITLES.TERMS_OF_SERVICE);
  const [activeSection, setActiveSection] = useState('agreement');

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">Terms of Service</h1>
            <div className="flex flex-col md:flex-row md:items-center gap-6 text-sm text-gray-500 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></span>
                Effective Date: January 2024
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
                    Please review these terms carefully before using our platform.
                  </p>
                  <a href="mailto:support@unknowniitians.live" className="text-xs font-bold text-gray-900 hover:underline flex items-center gap-1">
                    Contact Legal <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-3xl">
              <div className="prose prose-gray prose-p:text-gray-600 prose-headings:text-gray-900 prose-headings:font-semibold prose-a:text-gray-900 prose-li:text-gray-600 max-w-none space-y-16">
                
                {/* Agreement to Terms */}
                <section id="agreement" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">Agreement to Terms</h2>
                  <p>
                    By accessing and using the Unknown IITians website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                {/* Description of Service */}
                <section id="description" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">Description of Service</h2>
                  <p>Unknown IITians provides educational services including:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li>Online courses and educational content</li>
                    <li>Exam preparation materials for JEE, NEET, and IITM BS</li>
                    <li>Study resources, notes, and practice questions</li>
                    <li>Career guidance and counseling services</li>
                    <li>Employment verification services</li>
                    <li>Community forums and study groups</li>
                  </ul>
                </section>

                {/* User Accounts */}
                <section id="accounts" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">User Accounts and Registration</h2>
                  <p>To access certain features of our services, you must register for an account. You agree to:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li>Provide accurate, current, and complete information during registration</li>
                    <li>Maintain and promptly update your account information</li>
                    <li>Maintain the security of your password and account</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                  </ul>
                </section>

                {/* Acceptable Use */}
                <section id="acceptable-use" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">Acceptable Use Policy</h2>
                  <p>You agree not to use our services to:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon intellectual property rights</li>
                    <li>Transmit harmful, offensive, or inappropriate content</li>
                    <li>Interfere with or disrupt our services or servers</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use our services for commercial purposes without permission</li>
                    <li>Share your account credentials with others</li>
                    <li>Engage in fraudulent or deceptive practices</li>
                  </ul>
                </section>

                {/* Payment Terms */}
                <section id="payment" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">Payment Terms and Refund Policy</h2>
                  
                  <div className="grid md:grid-cols-1 gap-4 not-prose mt-6">
                    <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                      <h4 className="text-gray-900 font-semibold text-sm mb-2">Payment Processing</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">All payments are processed securely through our authorized payment partners. You agree to provide accurate payment information and authorize us to charge the specified amounts.</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                      <h4 className="text-gray-900 font-semibold text-sm mb-2">Course Fees</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">Course fees are clearly stated at the time of enrollment. Prices may change without notice, but changes will not affect existing enrollments.</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                      <h4 className="text-gray-900 font-semibold text-sm mb-2">Refund Policy</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        All sales are final. We do not offer refunds, cancellations, or exchanges for any courses, subscriptions, or services purchased on the platform. Please review your selection carefully before making a payment.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Intellectual Property */}
                <section id="ip" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">Intellectual Property Rights</h2>
                  <p>All content on our platform, including but not limited to text, graphics, logos, videos, and software, is the property of Unknown IITians and is protected by intellectual property laws.</p>
                  
                  <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">License to Use</h3>
                      <p>We grant you a limited, non-exclusive, non-transferable license to access and use our content for personal educational purposes only.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Restrictions</h3>
                      <ul className="list-disc pl-5 space-y-2">
                        <li>You may not reproduce, distribute, or sell our content</li>
                        <li>You may not modify or create derivative works</li>
                        <li>You may not reverse engineer our software</li>
                        <li>You may not share login credentials or course access</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Privacy */}
                <section id="privacy" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">Privacy and Data Protection</h2>
                  <p>
                    Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
                  </p>
                </section>

                {/* Disclaimers */}
                <section id="disclaimer" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">Disclaimers and Limitations of Liability</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Availability</h3>
                      <p>We strive to maintain service availability but do not guarantee uninterrupted access. Services may be temporarily unavailable due to maintenance, updates, or technical issues.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Educational Outcomes</h3>
                      <p>While we provide quality educational content, we do not guarantee specific academic outcomes or exam results. Success depends on individual effort and circumstances.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
                      <p>To the maximum extent permitted by law, Unknown IITians shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>
                    </div>
                  </div>
                </section>

                {/* Employment Verification */}
                <section id="verification" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">Employment Verification Services</h2>
                  <p>Our employment verification services are provided for legitimate verification purposes only. Users of this service agree to:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-4">
                    <li>Use verification services only for lawful purposes</li>
                    <li>Provide accurate information for verification requests</li>
                    <li>Respect the privacy of individuals being verified</li>
                    <li>Not misuse or falsify verification information</li>
                  </ul>
                </section>

                {/* Termination */}
                <section id="termination" className="scroll-mt-32">
                  <h2 className="text-2xl mb-6">Termination</h2>
                  <p>We may terminate or suspend your account and access to our services at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>
                  <p className="mt-4">Effects of Termination:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>Your right to access our services will cease immediately</li>
                    <li>Any outstanding payments become immediately due</li>
                    <li>We may delete your account and associated data</li>
                    <li>Certain provisions of these Terms will survive termination</li>
                  </ul>
                </section>

                {/* Additional Legal Sections Grouped */}
                <section className="scroll-mt-32 space-y-12">
                  <div>
                    <h2 className="text-2xl mb-6">Indemnification</h2>
                    <p>You agree to indemnify, defend, and hold harmless Unknown IITians, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your use of our services or violation of these Terms.</p>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl mb-6">Governing Law and Jurisdiction</h2>
                    <p>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
                  </div>

                  <div>
                    <h2 className="text-2xl mb-6">Changes to Terms</h2>
                    <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after changes are posted constitutes acceptance of the modified Terms.</p>
                  </div>

                  <div>
                    <h2 className="text-2xl mb-6">Severability</h2>
                    <p>If any provision of these Terms is found to be unenforceable or invalid, such provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.</p>
                  </div>
                </section>

                {/* Contact Information */}
                <section id="contact" className="scroll-mt-32 border-t border-gray-200 pt-16">
                  <h2 className="text-2xl mb-6">Contact Information</h2>
                  <p className="mb-6">If you have questions about these Terms of Service, please contact us:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-4 rounded border border-gray-100">
                      <span className="text-gray-400 block mb-1">Email</span>
                      <a href="mailto:support@unknowniitians.live" className="text-gray-900 hover:underline">support@unknowniitians.live</a>
                    </div>
                    {/* Phone Number Section Removed */}
                    <div className="bg-gray-50 p-4 rounded border border-gray-100">
                      <span className="text-gray-400 block mb-1">Address</span>
                      <span className="text-gray-900">New Delhi, India</span>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
