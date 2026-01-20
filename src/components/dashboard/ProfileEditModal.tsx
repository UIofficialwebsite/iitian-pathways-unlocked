import React, { useState, useEffect } from "react";
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
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (profile) {
      const fullName = profile.student_name || profile.full_name || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      
      setGender(profile.gender || "Male");
      
      // Default to +91 if phone is empty, otherwise show existing phone
      setPhone(profile.phone || "+91 ");
      
      setEmail(profile.email || "");
    }
  }, [profile, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();

      const { error } = await supabase
        .from('profiles')
        .update({
          student_name: fullName,
          phone: phone,
          gender: gender,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
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
        
        {/* Header */}
        <DialogHeader className="px-5 py-3 border-b border-[#f0f0f0] bg-white">
          <DialogTitle className="text-[15px] font-semibold text-[#1a1a1a]">Edit Details</DialogTitle>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          {/* Row 1: Name (Split) */}
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

          {/* Row 2: Gender (Compact Radio) */}
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

          {/* Row 3: Mobile Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Mobile Number</label>
            <div className="flex items-center border border-[#ccc] rounded-[4px] bg-[#fdfdfd] px-2.5 h-9 overflow-hidden transition-all focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]/20">
              {/* Removed the 'IN' prefix block. The input now contains the code. */}
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-0 text-[13px] text-[#333] h-full font-medium"
                placeholder="+91 9876543210"
              />
              <button type="button" className="text-[11px] font-bold text-[#2563eb] hover:underline whitespace-nowrap px-1">
                Update Number
              </button>
            </div>
          </div>

          {/* Row 4: Email (Read-only) */}
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
