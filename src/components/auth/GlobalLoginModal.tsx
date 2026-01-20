import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLoginModal } from '@/context/LoginModalContext';
import GoogleAuth from '@/components/auth/GoogleAuth';

const LoginPopupContent: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="bg-white w-full h-full flex flex-col font-sans px-4 pb-6 overflow-y-auto no-scrollbar">
      {/* Centered Content Block */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[480px] mx-auto py-6">
        {/* Image Section */}
        <div className="mb-6 flex justify-center w-full shrink-0">
          <img 
            src="https://res.cloudinary.com/dkywjijpv/image/upload/v1768895615/image-removebg-preview_1_1_wvewxg.png" 
            alt="Login Illustration" 
            className="h-[180px] md:h-[220px] w-auto object-contain" 
          />
        </div>

        {/* Heading Row with PILL ICON */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 w-full shrink-0">
          <h2 className="text-[22px] md:text-[26px] font-bold text-black/80 font-sans leading-tight text-center">
            Sign in / Register to continue
          </h2>
          
          {/* The Pill Icon */}
          <div className="flex items-center justify-center gap-[4px] px-4 py-2 bg-[#FFE082] border-[1.5px] border-[#4a4a4a] rounded-full cursor-default shadow-sm shrink-0">
            <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
            <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
            <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
          </div>
        </div>

        {/* Auth Buttons Area */}
        <div className="w-full space-y-4 px-2 sm:px-4 shrink-0">
          <GoogleAuth 
            isLoading={isLoading} 
            setIsLoading={setIsLoading} 
            onSuccess={onSuccess}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 text-center text-[10px] xs:text-[11px] sm:text-[13px] text-[#717171] leading-tight border-t border-gray-100/50 shrink-0">
        By continuing you agree to our <Link to="/terms" className="text-[#0284c7] font-semibold hover:underline">Terms of use</Link> & <Link to="/privacy" className="text-[#0284c7] font-semibold hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};

const GlobalLoginModal: React.FC = () => {
  const { isOpen, closeLogin } = useLoginModal();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && closeLogin()}>
        <DrawerContent>
          <LoginPopupContent onSuccess={closeLogin} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeLogin()}>
      <DialogContent 
        className="data-[state=open]:slide-in-from-bottom-[50%] data-[state=closed]:slide-out-to-bottom-[50%] data-[state=open]:slide-in-from-top-auto data-[state=closed]:slide-out-to-top-auto transition-all duration-500 max-h-[90vh]"
      >
        <LoginPopupContent onSuccess={closeLogin} />
      </DialogContent>
    </Dialog>
  );
};

export default GlobalLoginModal;
