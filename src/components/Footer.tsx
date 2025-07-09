import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Youtube, Linkedin, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/lovable-uploads/UI_logo.png"
                alt="Unknown IITians"
                className="h-12 w-12 filter brightness-100 invert"
              />
              <span className="text-xl font-semibold text-white">Unknown IITians</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              We believe every learner deserves the freedom to shape their own journey. Our platform supports diverse paths by offering resources that prioritize clarity, real-world relevance, and individual choice over rigid systems.
            </p>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Let's get social :</h4>
              <div className="flex space-x-5">
                <a 
                  href="https://www.youtube.com/@UnknownIITians" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png" 
                    alt="YouTube" 
                    className="w-8 h-8 object-contain"
                  />
                </a>
                <a 
                  href="https://linkedin.com/company/unknown-iitians/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" 
                    alt="LinkedIn" 
                    className="w-8 h-8 object-contain"
                  />
                </a>
                <a 
                  href="https://www.instagram.com/unknown_iitians/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" 
                    alt="Instagram" 
                    className="w-8 h-8 object-contain"
                  />
                </a>
                <a 
                  href="https://whatsapp.com/channel/0029VayHsVwIiRorIdVX9n1l" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                    alt="WhatsApp" 
                    className="w-8 h-8 object-contain"
                  />
                </a>
                <a 
                  href="https://t.me/bsdatascience_iitm" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" 
                    alt="Telegram" 
                    className="w-8 h-8 object-contain"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/exam-preparation" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Exam Preparation
                </Link>
              </li>
              <li>
                <Link to="/career" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Career
                </Link>
              </li>
              <li>
                <Link to="/intern-verification" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Intern Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-royal flex-shrink-0" />
                <span className="text-gray-300 text-sm">support@unknowniitians.live</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-royal flex-shrink-0" />
                <span className="text-gray-300 text-sm"> To be updated soon</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-royal flex-shrink-0 mt-1" />
                <span className="text-gray-300 text-sm">
                  New Delhi, Delhi, India <br />
                </span>
              </div>
            </div>

            {/* Compact Newsletter Section */}
            <div className="pt-4 border-t border-gray-700">
              <h4 className="text-sm font-medium mb-2 text-white">Stay Updated</h4>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 text-sm h-8"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-royal hover:bg-royal-dark text-xs h-8"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 Unknown IITians. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms
              </Link>
              <a href="mailto:contact@unknowniitians.com" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
