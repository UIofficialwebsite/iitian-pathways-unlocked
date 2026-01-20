import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdate: () => void;
}

const ProfileEditModal = ({ isOpen, onClose, profile, onProfileUpdate }: ProfileEditModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  
  // Phone State
  const [countryCode, setCountryCode] = useState("+91");
  const [localPhone, setLocalPhone] = useState("");
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  
  const [email, setEmail] = useState("");
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && profile) {
      const fullName = profile.student_name || profile.full_name || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      
      setGender(profile.gender || "Male");
      
      const rawPhone = profile.phone || "";
      if(rawPhone.startsWith("+91")) {
         setCountryCode("+91");
         setLocalPhone(rawPhone.replace("+91", "").trim());
      } else if (rawPhone.length > 0 && rawPhone.includes(" ")) {
         const parts = rawPhone.split(" ");
         setCountryCode(parts[0]);
         setLocalPhone(parts.slice(1).join(""));
      } else if (rawPhone.length > 0) {
         setCountryCode("+91"); 
         setLocalPhone(rawPhone);
      } else {
         setCountryCode("+91");
         setLocalPhone("");
      }
      
      setEmail(profile.email || "");
      setIsPhoneEditable(false);
    }
  }, [isOpen]);

  const handlePhoneBtnClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isPhoneEditable) {
      setIsPhoneEditable(true);
      setTimeout(() => {
        if (phoneInputRef.current) phoneInputRef.current.focus();
      }, 50);
    } else {
      setIsPhoneEditable(false);
    }
  };

  const handleMainSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const fullPhone = `${countryCode} ${localPhone}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          student_name: fullName,
          gender: gender,
          phone: fullPhone,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({ title: "Profile Updated", description: "Your details have been saved successfully." });
      onProfileUpdate();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* w-[94vw]: Uses nearly full screen width on mobile with minimal margins
         max-w-[420px]: Caps width on larger screens
      */}
      <DialogContent className="w-[94vw] max-w-[420px] p-0 overflow-hidden bg-white border border-[#e5e7eb] shadow-xl rounded-xl gap-0 font-['Inter',sans-serif]">
        
        <DialogHeader className="px-4 py-3.5 border-b border-[#f0f0f0] bg-white flex flex-row items-center justify-between">
          <DialogTitle className="text-[15px] font-semibold text-[#1a1a1a]">Edit Details</DialogTitle>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors focus:outline-none p-1">
            <X size={18}/>
          </button>
        </DialogHeader>

        {/* Reduced padding for more input space */}
        <form onSubmit={handleMainSave} className="px-4 py-4 space-y-3.5">
          
          {/* Row 1: Name - Stacked Vertical */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#555] uppercase tracking-wide">First Name</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 h-9 border border-[#d1d5db] rounded-md text-[14px] text-[#333] outline-none focus:border-[#2563eb] transition-all placeholder:text-gray-400"
                placeholder="First Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#555] uppercase tracking-wide">Last Name</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 h-9 border border-[#d1d5db] rounded-md text-[14px] text-[#333] outline-none focus:border-[#2563eb] transition-all placeholder:text-gray-400"
                placeholder="Last Name"
              />
            </div>
          </div>

          {/* Row 2: Gender */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#555] uppercase tracking-wide block">Gender</label>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setGender('Male')}>
                <div className={`w-4 h-4 border rounded-full flex items-center justify-center transition-all ${gender === 'Male' ? 'border-[#2563eb]' : 'border-[#ccc] group-hover:border-[#999]'}`}>
                  {gender === 'Male' && <div className="w-2 h-2 bg-[#2563eb] rounded-full" />}
                </div>
                <span className="text-[13px] text-[#444]">Male</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setGender('Female')}>
                <div className={`w-4 h-4 border rounded-full flex items-center justify-center transition-all ${gender === 'Female' ? 'border-[#2563eb]' : 'border-[#ccc] group-hover:border-[#999]'}`}>
                  {gender === 'Female' && <div className="w-2 h-2 bg-[#2563eb] rounded-full" />}
                </div>
                <span className="text-[13px] text-[#444]">Female</span>
              </div>
            </div>
          </div>

          {/* Row 3: Mobile Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#555] uppercase tracking-wide">Mobile Number</label>
            <div className={`flex items-center border rounded-md bg-[#f9fafb] px-2.5 h-9 overflow-hidden transition-all ${isPhoneEditable ? 'border-[#2563eb] ring-1 ring-[#2563eb]/20' : 'border-[#d1d5db]'}`}>
              <div className="flex items-center gap-0.5 pr-2 border-r border-[#e5e7eb] h-full -ml-2.5 pl-2.5 mr-2 bg-gray-50">
                <input 
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className={`w-10 bg-transparent border-none outline-none text-[13px] font-medium text-center p-0 ${!isPhoneEditable ? 'text-[#888] cursor-not-allowed' : 'text-[#555]'}`}
                  maxLength={5}
                  disabled={!isPhoneEditable}
                />
                <span className="text-[9px] text-[#999]">▼</span>
              </div>

              <input 
                ref={phoneInputRef}
                type="text"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none px-0 text-[13px] h-full min-w-0 ${!isPhoneEditable ? 'text-[#666] cursor-not-allowed' : 'text-[#333]'}`}
                placeholder="1234567890"
                disabled={!isPhoneEditable}
              />
              
              <button 
                type="button" 
                onClick={handlePhoneBtnClick}
                className="text-[11px] font-medium text-[#2563eb] hover:underline whitespace-nowrap px-1 cursor-pointer flex-shrink-0"
              >
                {isPhoneEditable ? "Update" : "Edit"}
              </button>
            </div>
          </div>

          {/* Row 4: Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#555] uppercase tracking-wide">Email</label>
            <input 
              type="email" 
              value={email}
              readOnly 
              className="w-full px-3 py-2 h-9 border border-[#e5e7eb] rounded-md text-[13px] text-[#666] outline-none bg-[#f9fafb] cursor-not-allowed"
            />
          </div>

          {/* Footer: Stacked Vertical buttons on mobile */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 mt-1 border-t border-[#f5f5f5]">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-9 text-[12px] font-semibold text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 rounded-md transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading || isPhoneEditable}
              className="w-full sm:w-auto px-4 h-9 text-[12px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-md border-none shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
              Save Changes
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
