import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  const [isPhoneUpdating, setIsPhoneUpdating] = useState(false);
  
  const [email, setEmail] = useState("");
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      const fullName = profile.student_name || profile.full_name || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      
      setGender(profile.gender || "Male");
      
      // Phone Parsing
      const rawPhone = profile.phone || "";
      // Simple parsing logic: if it starts with +91, split it, else default
      if(rawPhone.startsWith("+91")) {
         setCountryCode("+91");
         setLocalPhone(rawPhone.replace("+91", "").trim());
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
  }, [profile, isOpen]);

  // Handle "Edit" -> "Update" toggle logic
  const handlePhoneBtnClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // State 1: Locked -> Unlock it
    if (!isPhoneEditable) {
      setIsPhoneEditable(true);
      setTimeout(() => {
        if (phoneInputRef.current) {
          phoneInputRef.current.focus();
        }
      }, 50);
      return;
    }

    // State 2: Unlocked -> Save (Update) it
    setIsPhoneUpdating(true);
    try {
      const fullPhone = `${countryCode}${localPhone}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({ phone: fullPhone })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Phone Updated",
        description: "Your phone number has been updated successfully.",
      });
      
      onProfileUpdate(); // Refresh parent data
      setIsPhoneEditable(false); // Lock fields again
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPhoneUpdating(false);
    }
  };

  // Main Form Save (Name, Gender, etc.)
  const handleMainSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      // We don't save phone here to avoid conflicts, or we can save it again to be safe.
      // Since phone has its own button, we primarily save Name/Gender here.
      
      const { error } = await supabase
        .from('profiles')
        .update({
          student_name: fullName,
          gender: gender,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your details have been saved.",
      });
      onProfileUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] w-full p-0 overflow-hidden bg-white border border-[#e5e7eb] shadow-xl rounded-[4px] gap-0 font-['Inter',sans-serif]">
        
        <DialogHeader className="px-5 py-3 border-b border-[#f0f0f0] bg-white">
          <DialogTitle className="text-[15px] font-semibold text-[#1a1a1a]">Edit Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleMainSave} className="p-5 space-y-4">
          
          {/* Row 1: Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">First Name</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-2.5 py-1.5 h-9 border border-[#ccc] rounded-[4px] text-[13px] text-[#333] outline-none focus:border-[#2563eb] transition-all placeholder:text-gray-400"
                placeholder="First Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Last Name</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-2.5 py-1.5 h-9 border border-[#ccc] rounded-[4px] text-[13px] text-[#333] outline-none focus:border-[#2563eb] transition-all placeholder:text-gray-400"
                placeholder="Last Name"
              />
            </div>
          </div>

          {/* Row 2: Gender */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide block">Gender</label>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setGender('Male')}>
                <div className={`w-[16px] h-[16px] border rounded-full flex items-center justify-center transition-all ${gender === 'Male' ? 'border-[#2563eb]' : 'border-[#ccc] group-hover:border-[#999]'}`}>
                  {gender === 'Male' && <div className="w-2 h-2 bg-[#2563eb] rounded-full" />}
                </div>
                <span className="text-[13px] text-[#444]">Male</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setGender('Female')}>
                <div className={`w-[16px] h-[16px] border rounded-full flex items-center justify-center transition-all ${gender === 'Female' ? 'border-[#2563eb]' : 'border-[#ccc] group-hover:border-[#999]'}`}>
                  {gender === 'Female' && <div className="w-2 h-2 bg-[#2563eb] rounded-full" />}
                </div>
                <span className="text-[13px] text-[#444]">Female</span>
              </div>
            </div>
          </div>

          {/* Row 3: Mobile Number (Separate Update Logic) */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Mobile Number</label>
            <div className={`flex items-center border rounded-[4px] bg-[#fdfdfd] px-2.5 h-9 overflow-hidden transition-all ${isPhoneEditable ? 'border-[#2563eb] ring-1 ring-[#2563eb]/20' : 'border-[#ccc]'}`}>
              
              {/* Editable Country Code */}
              <div className="flex items-center gap-1 pr-2 border-r border-[#eee] h-full bg-[#f8f8f8] -ml-2.5 pl-2.5 mr-2">
                <input 
                  type="text"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className={`w-[36px] bg-transparent border-none outline-none text-[13px] font-medium text-center p-0 ${!isPhoneEditable ? 'text-[#888] cursor-not-allowed' : 'text-[#555]'}`}
                  maxLength={4}
                  disabled={!isPhoneEditable}
                />
                <span className="text-[9px] text-[#999]">▼</span>
              </div>

              {/* Local Number Input */}
              <input 
                ref={phoneInputRef}
                type="text"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none px-0 text-[13px] h-full ${!isPhoneEditable ? 'text-[#666] cursor-not-allowed' : 'text-[#333]'}`}
                placeholder="1234567890"
                disabled={!isPhoneEditable}
              />
              
              {/* Action Button: Edit -> Update */}
              <button 
                type="button" 
                onClick={handlePhoneBtnClick}
                disabled={isPhoneUpdating}
                className="text-[11px] font-medium text-[#2563eb] hover:underline whitespace-nowrap px-1 cursor-pointer disabled:opacity-50"
              >
                {isPhoneUpdating ? "Updating..." : (isPhoneEditable ? "Update" : "Edit")}
              </button>
            </div>
          </div>

          {/* Row 4: Email */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Email</label>
            <input 
              type="email" 
              value={email}
              readOnly 
              className="w-full px-2.5 py-1.5 h-9 border border-[#eee] rounded-[4px] text-[13px] text-[#666] outline-none bg-[#f9fafb] cursor-not-allowed"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 mt-2 border-t border-[#f5f5f5]">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 h-8 text-[12px] font-semibold text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 rounded-[4px] transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="px-4 h-8 text-[12px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-[4px] border-none shadow-sm transition-all"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
