import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, Server, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-800">
      <NavBar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Policy Content Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            
            {/* Introduction */}
            <section className="mb-10">
              <p className="mb-4 leading-relaxed">
                Please read the following Privacy Policy regarding the services made available on <strong>www.unknowniitians.com</strong> and its associated platforms (collectively referred to as the "Platform").
              </p>
              <p className="mb-4 leading-relaxed">
                By accessing or using the Platform, you agree to be bound by the terms of this Privacy Policy. If you do not agree with these terms, please do not use the Platform. By providing your information, you consent to the collection and use of the information you disclose on our Platform in accordance with this Privacy Policy.
              </p>
              <div className="bg-blue-50 border-l-4 border-royal p-4 mt-6">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> We may update this Privacy Policy from time to time to reflect changes in our practices. We encourage you to review this page periodically for the latest information on our privacy practices.
                </p>
              </div>
            </section>

            <hr className="my-8 border-gray-100" />

            {/* 1. Collection */}
            <section className="mb-10">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-royal/10 flex items-center justify-center mr-3 text-royal">
                  <Eye className="w-4 h-4" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">1. Collection of Personally Identifiable Information</h2>
              </div>
              
              <p className="mb-4 text-gray-600">
                We collect certain information about you to help us serve you better. The information collected by us is of the following nature:
              </p>
              
              <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700 marker:text-royal">
                <li>Name, Telephone Number, and Email Address</li>
                <li>Service Address and IP Address</li>
                <li>Device and Network Information</li>
                <li>College/Institution Details and Location</li>
                <li>User uploaded photos and Identification Documents</li>
                <li>Demographic information such as postcode, preferences, and interests</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">1.2 Registration Data</h3>
              <p className="mb-4 text-gray-600">
                During registration, you may be asked to provide your username, password, email address, academic specialty, year of graduation, and institution name. We store your username, country, and specialty on our secure servers. Your password is cryptographically hashed, and sensitive contact details are encrypted.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">1.3 Social Login</h3>
              <p className="mb-4 text-gray-600">
                If you choose to register using third-party services (e.g., Google or Facebook), you allow us to access your profile information as permitted by that service's policies. Your use of such services is subject to their respective privacy policies.
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">1.4 User Responsibility</h3>
              <p className="mb-4 text-gray-600">
                You are solely responsible for maintaining the strict confidentiality of your account credentials. You agree to notify Unknown IITians immediately of any unauthorized use of your account. We are not liable for any loss arising from your failure to comply with this obligation.
              </p>
            </section>

            {/* 2. Use of Information */}
            <section className="mb-10">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-royal/10 flex items-center justify-center mr-3 text-royal">
                  <Server className="w-4 h-4" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">2. Use of Personal Information</h2>
              </div>
              
              <p className="mb-4 text-gray-600">
                The information collected by us is used for various purposes to deliver a seamless experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-700 marker:text-royal">
                <li>Internal record keeping and service improvement.</li>
                <li>To resolve disputes, detect fraud, and enforce our terms and conditions.</li>
                <li>To send periodic promotional emails about new batches, special offers, or other information we think you may find interesting.</li>
                <li>To customize the website according to your interests and preferences.</li>
                <li>Your IP address is used to help diagnose server problems and administer our Platform.</li>
              </ul>
            </section>

            {/* 3. Sharing of Information */}
            <section className="mb-10">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-royal/10 flex items-center justify-center mr-3 text-royal">
                  <Shield className="w-4 h-4" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">3. Sharing of Personal Information</h2>
              </div>

              <p className="mb-4 text-gray-600">
                We value your privacy and restrict the sharing of your personal information:
              </p>
              
              <div className="space-y-4 text-gray-700">
                <p>
                  <span className="font-semibold text-gray-900">3.1 Service Providers & Legal:</span> We may share your information with payment service providers, regulatory authorities, and third-party agencies if required by law or to respond to legal processes.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">3.2 Business Transfers:</span> We may share or sell collected information if Unknown IITians merges with or is acquired by another business entity. The new entity will be required to follow this Privacy Policy.
                </p>
                <p>
                  <span className="font-semibold text-gray-900">3.3 Anonymized Data:</span> We do not disclose personal information to advertisers. However, we may share aggregate, anonymized data to help advertisers reach specific target audiences without identifying individuals.
                </p>
              </div>
            </section>

            {/* 4. Information Safety */}
            <section className="mb-10">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-royal/10 flex items-center justify-center mr-3 text-royal">
                  <Lock className="w-4 h-4" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">4. Information Safety</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                All information is saved and stored on servers secured with advanced encryption protocols, firewalls, and access controls. We adhere to strict industry-standard security guidelines to protect your data against unauthorized access, loss, or misuse.
              </p>
            </section>

            {/* 5. Choice/Opt-Out */}
            <section>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-royal/10 flex items-center justify-center mr-3 text-royal">
                  <Mail className="w-4 h-4" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">5. Choice/Opt-Out</h2>
              </div>
              <p className="text-gray-600 mb-4">
                We provide all users with the opportunity to opt-out of receiving non-essential (promotional, marketing-related) communications.
              </p>
              <p className="text-gray-600">
                If you wish to remove your contact information from all lists and newsletters, please contact us at:
                <br />
                <a href="mailto:support@unknowniitians.com" className="text-royal font-medium hover:underline mt-2 inline-block">
                  support@unknowniitians.com
                </a>
              </p>
            </section>

          </div>
          
          <div className="mt-8 text-center text-sm text-gray-500">
             All other terms and conditions applicable under the Terms of Service will be applicable to you and read along with this Privacy Policy.
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
