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

interface CountryCode {
  dial_code: string;
  name: string;
  phone_length: number;
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
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [expectedPhoneLength, setExpectedPhoneLength] = useState(10);
  
  const [email, setEmail] = useState("");
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Fetch country codes when modal opens
  useEffect(() => {
    if (isOpen && countryCodes.length === 0) {
      supabase
        .from('country_codes')
        .select('dial_code, name, phone_length')
        .order('name')
        .then(({ data, error }) => {
          if (!error && data) {
            setCountryCodes(data);
          }
        });
    }
  }, [isOpen, countryCodes.length]);

  useEffect(() => {
    if (isOpen && profile) {
      const fullName = profile.student_name || profile.full_name || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      
      setGender(profile.gender || "Male");
      
      // Use dial_code if available, otherwise try to parse from phone
      if (profile.dial_code) {
        setCountryCode(profile.dial_code);
        setLocalPhone(profile.phone || "");
        // Set expected length based on dial code
        const dialDigits = profile.dial_code.replace('+', '');
        supabase.from('country_codes')
          .select('phone_length')
          .eq('dial_code', dialDigits)
          .maybeSingle()
          .then(({ data }) => {
            if (data) setExpectedPhoneLength(data.phone_length);
          });
      } else {
        // Fallback for old data format
        const rawPhone = profile.phone || "";
        if (rawPhone.includes(" ")) {
          const parts = rawPhone.split(" ");
          setCountryCode(parts[0] || "+91");
          setLocalPhone(parts.slice(1).join(""));
        } else {
          setCountryCode("+91");
          setLocalPhone(rawPhone);
        }
      }
      
      setEmail(profile.email || "");
      setIsPhoneEditable(false);
    }
  }, [isOpen, profile]);

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

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
    const dialDigits = value.replace('+', '');
    const country = countryCodes.find(c => c.dial_code === dialDigits);
    if (country) {
      setExpectedPhoneLength(country.phone_length);
      // Clear phone if it exceeds new length
      if (localPhone.length > country.phone_length) {
        setLocalPhone(localPhone.slice(0, country.phone_length));
      }
    }
  };

  const handleMainSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      
      const { error } = await supabase
        .from('profiles')
        .update({
          student_name: fullName,
          gender: gender,
          dial_code: countryCode,
          phone: localPhone,
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
      <DialogContent className="w-[94vw] max-w-[420px] p-0 overflow-hidden bg-white border border-[#e5e7eb] shadow-xl rounded-xl gap-0 font-['Inter',sans-serif]">
        
        <DialogHeader className="px-4 py-3.5 border-b border-[#f0f0f0] bg-white">
          <DialogTitle className="text-[15px] font-semibold text-[#1a1a1a]">Edit Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleMainSave} className="px-4 py-4 space-y-3.5">
          
          {/* Row 1: Name */}
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
            <div className="flex items-center gap-2">
              <select
                value={countryCode}
                onChange={(e) => handleCountryCodeChange(e.target.value)}
                disabled={!isPhoneEditable}
                className={`h-9 px-2 border border-[#d1d5db] rounded-md text-[13px] bg-white min-w-[120px] ${!isPhoneEditable ? 'text-[#888] cursor-not-allowed bg-[#f9fafb]' : 'text-[#333]'}`}
              >
                {countryCodes.length === 0 ? (
                  <option value={countryCode}>{countryCode}</option>
                ) : (
                  countryCodes.map((c) => (
                    <option key={c.dial_code} value={`+${c.dial_code}`}>
                      +{c.dial_code} {c.name}
                    </option>
                  ))
                )}
              </select>
              
              <input 
                ref={phoneInputRef}
                type="tel"
                value={localPhone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, expectedPhoneLength);
                  setLocalPhone(digitsOnly);
                }}
                className={`flex-1 h-9 px-3 border border-[#d1d5db] rounded-md text-[13px] min-w-0 ${!isPhoneEditable ? 'text-[#666] cursor-not-allowed bg-[#f9fafb]' : 'text-[#333]'}`}
                placeholder={`${'9'.repeat(expectedPhoneLength)}`}
                disabled={!isPhoneEditable}
                maxLength={expectedPhoneLength}
              />
              
              <button 
                type="button" 
                onClick={handlePhoneBtnClick}
                className="text-[11px] font-medium text-[#2563eb] hover:underline whitespace-nowrap px-1 cursor-pointer flex-shrink-0"
              >
                {isPhoneEditable ? "Done" : "Edit"}
              </button>
            </div>
            {isPhoneEditable && (
              <p className="text-[11px] text-gray-500">Enter {expectedPhoneLength} digits for selected country</p>
            )}
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

          {/* Footer */}
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
