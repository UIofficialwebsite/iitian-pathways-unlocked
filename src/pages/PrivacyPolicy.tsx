import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <NavBar />

      <main className="pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-16 border-b border-gray-100 pb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Main Content - Clean Text Layout */}
          <div className="space-y-16">
            
            {/* Introduction */}
            <section className="text-lg text-gray-600 leading-relaxed space-y-6">
              <p>
                Please read the following Privacy Policy regarding the services made available on <strong className="text-gray-900">www.unknowniitians.com</strong> and its associated platforms (collectively referred to as the "Platform").
              </p>
              <p>
                By accessing or using the Platform, you agree to be bound by the terms of this Privacy Policy. If you do not agree with these terms, please do not use the Platform. By providing your information, you consent to the collection and use of the information you disclose on our Platform in accordance with this Privacy Policy.
              </p>
              <div className="bg-gray-50 border-l-4 border-gray-900 p-6 my-8">
                <p className="text-base text-gray-700">
                  <strong>Note:</strong> We may update this Privacy Policy from time to time to reflect changes in our practices. We encourage you to review this page periodically for the latest information on our privacy practices.
                </p>
              </div>
            </section>

            {/* 1. Collection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Collection of Personally Identifiable Information</h2>
              
              <div className="text-gray-600 space-y-8 leading-relaxed">
                <p>
                  We collect certain information about you to help us serve you better. The information collected by us is of the following nature:
                </p>
                
                <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
                  <li>Name, Telephone Number, and Email Address</li>
                  <li>Service Address and IP Address</li>
                  <li>Device and Network Information</li>
                  <li>College/Institution Details and Location</li>
                  <li>User uploaded photos and Identification Documents</li>
                  <li>Demographic information such as postcode, preferences, and interests</li>
                </ul>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">1.2 Registration Data</h3>
                  <p>
                    During registration, you may be asked to provide your username, password, email address, academic specialty, year of graduation, and institution name. We store your username, country, and specialty on our secure servers. Your password is cryptographically hashed, and sensitive contact details are encrypted.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">1.3 Social Login</h3>
                  <p>
                    If you choose to register using third-party services (e.g., Google or Facebook), you allow us to access your profile information as permitted by that service's policies. Your use of such services is subject to their respective privacy policies.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">1.4 User Responsibility</h3>
                  <p>
                    You are solely responsible for maintaining the strict confidentiality of your account credentials. You agree to notify Unknown IITians immediately of any unauthorized use of your account. We are not liable for any loss arising from your failure to comply with this obligation.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Use of Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Use of Personal Information</h2>
              <div className="text-gray-600 space-y-6 leading-relaxed">
                <p>
                  The information collected by us is used for various purposes to deliver a seamless experience:
                </p>
                <ul className="list-disc pl-5 space-y-2 marker:text-gray-400">
                  <li>Internal record keeping and service improvement.</li>
                  <li>To resolve disputes, detect fraud, and enforce our terms and conditions.</li>
                  <li>To send periodic promotional emails about new batches, special offers, or other information we think you may find interesting.</li>
                  <li>To customize the website according to your interests and preferences.</li>
                  <li>Your IP address is used to help diagnose server problems and administer our Platform.</li>
                </ul>
              </div>
            </section>

            {/* 3. Sharing of Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Sharing of Personal Information</h2>
              <div className="text-gray-600 space-y-6 leading-relaxed">
                <p>
                  We value your privacy and restrict the sharing of your personal information:
                </p>
                <div className="space-y-6 pl-4 border-l-2 border-gray-100">
                  <div>
                    <strong className="text-gray-900 block mb-1">3.1 Service Providers & Legal</strong>
                    <p>We may share your information with payment service providers, regulatory authorities, and third-party agencies if required by law or to respond to legal processes.</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 block mb-1">3.2 Business Transfers</strong>
                    <p>We may share or sell collected information if Unknown IITians merges with or is acquired by another business entity. The new entity will be required to follow this Privacy Policy.</p>
                  </div>
                  <div>
                    <strong className="text-gray-900 block mb-1">3.3 Anonymized Data</strong>
                    <p>We do not disclose personal information to advertisers. However, we may share aggregate, anonymized data to help advertisers reach specific target audiences without identifying individuals.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Information Safety */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Information Safety</h2>
              <p className="text-gray-600 leading-relaxed">
                All information is saved and stored on servers secured with advanced encryption protocols, firewalls, and access controls. We adhere to strict industry-standard security guidelines to protect your data against unauthorized access, loss, or misuse.
              </p>
            </section>

            {/* 5. Choice/Opt-Out */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Choice/Opt-Out</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                <p>
                  We provide all users with the opportunity to opt-out of receiving non-essential (promotional, marketing-related) communications.
                </p>
                <p>
                  If you wish to remove your contact information from all lists and newsletters, please contact us at:
                </p>
                <a href="mailto:support@unknowniitians.com" className="text-royal font-medium hover:underline inline-block mt-2">
                  support@unknowniitians.com
                </a>
              </div>
            </section>

            {/* Footer Legal Note */}
            <div className="pt-10 border-t border-gray-100 mt-10">
               <p className="text-sm text-gray-400">
                 All other terms and conditions applicable under the Terms of Service will be applicable to you and read along with this Privacy Policy.
               </p>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
