import React, { useState } from "react";
import { Link } from "react-router-dom";
import GoogleAuth from "@/components/auth/GoogleAuth";
import EmailAuth from "@/components/auth/EmailAuth";

const LoginCard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);

  return (
    <div className="bg-white w-full max-w-[480px] rounded-[28px] relative px-6 py-10 text-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all duration-300 mx-auto">
      
      {/* IMAGE SECTION */}
      <div className="mb-4 flex justify-center w-full">
        <img 
          src="https://res.cloudinary.com/dkywjijpv/image/upload/v1768895615/image-removebg-preview_1_1_wvewxg.png" 
          alt="Login Illustration" 
          className="h-[200px] md:h-[280px] w-auto object-contain" 
        />
      </div>

      {/* HEADER SECTION with Pill Icon */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 w-full">
        <h2 className="text-[24px] md:text-[26px] font-bold text-black/80 font-sans leading-tight">
          Sign in / Register to continue
        </h2>
        
        {/* The Pill Icon */}
        <div className="flex items-center justify-center gap-[4px] px-4 py-2 bg-[#FFE082] border-[1.5px] border-[#4a4a4a] rounded-full cursor-default shadow-sm">
            <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
            <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
            <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
        </div>
      </div>

      <div className="space-y-4">
        <GoogleAuth isLoading={isLoading} setIsLoading={setIsLoading} />
        
        {/* OPTIONAL: Show Email Auth on request */}
        {!showEmailAuth ? (
          <button 
            onClick={() => setShowEmailAuth(true)}
            className="text-sm font-semibold text-[#1d4ed8] hover:underline transition-colors"
          >
            Continue with email instead?
          </button>
        ) : (
          <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <EmailAuth isSignUp={false} isLoading={isLoading} setIsLoading={setIsLoading} />
            <button 
              onClick={() => setShowEmailAuth(false)}
              className="mt-4 text-sm text-gray-500 hover:underline transition-colors"
            >
              Back to Google login
            </button>
          </div>
        )}
      </div>

      {/* FOOTER TERMS */}
      <div className="mt-14 text-xs md:text-sm text-[#717171] leading-relaxed">
        By continuing you agree to our <br />
        <Link to="/terms" className="text-[#0284c7] font-semibold hover:underline">Terms of use</Link> & <Link to="/privacy" className="text-[#0284c7] font-semibold hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default LoginCard;
