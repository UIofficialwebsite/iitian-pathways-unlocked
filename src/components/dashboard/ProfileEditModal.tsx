import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (profile) {
      const fullName = profile.student_name || profile.full_name || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      
      setGender(profile.gender || "Male");
      setPhone(profile.phone || "");
      setEmail(profile.email || "");
      setState("Bihar"); // Default for now
      setCity("Patna");  // Default for now
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
      {/* Tweaked: max-w-[420px], rounded-[6px] for compact look */}
      <DialogContent className="sm:max-w-[420px] w-full p-0 overflow-hidden bg-white border border-[#ddd] shadow-lg rounded-[6px] gap-0 font-['Inter',sans-serif]">
        
        {/* Compact Header */}
        <DialogHeader className="px-4 py-3 border-b border-[#f0f0f0] flex flex-row items-center justify-between space-y-0 bg-white">
          <DialogTitle className="text-[16px] font-semibold text-[#333]">Edit Details</DialogTitle>
          <button onClick={onClose} className="text-[#888] hover:text-[#333] transition-colors outline-none">
            <X size={18} />
          </button>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          
          {/* Row 1: Name (Split) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">First Name</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-2.5 py-1.5 h-9 border border-[#ccc] rounded-[4px] text-[13px] text-[#333] outline-none focus:border-[#2563eb] transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Last Name</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-2.5 py-1.5 h-9 border border-[#ccc] rounded-[4px] text-[13px] text-[#333] outline-none focus:border-[#2563eb] transition-all"
              />
            </div>
          </div>

          {/* Row 2: Gender (Compact Radio) */}
          <div className="space-y-1">
            <div className="flex items-center gap-6">
              <span className="text-[13px] font-bold text-[#333]">Gender</span>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setGender('Male')}>
                <div className={`w-[16px] h-[16px] border rounded-full flex items-center justify-center transition-all ${gender === 'Male' ? 'border-[#2563eb]' : 'border-[#ccc] group-hover:border-[#999]'}`}>
                  {gender === 'Male' && <div className="w-2.5 h-2.5 bg-[#2563eb] rounded-full" />}
                </div>
                <span className="text-[13px] text-[#444]">Male</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setGender('Female')}>
                <div className={`w-[16px] h-[16px] border rounded-full flex items-center justify-center transition-all ${gender === 'Female' ? 'border-[#2563eb]' : 'border-[#ccc] group-hover:border-[#999]'}`}>
                  {gender === 'Female' && <div className="w-2.5 h-2.5 bg-[#2563eb] rounded-full" />}
                </div>
                <span className="text-[13px] text-[#444]">Female</span>
              </div>
            </div>
          </div>

          {/* Row 3: Mobile Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">Mobile Number</label>
            <div className="flex items-center border border-[#ccc] rounded-[4px] bg-[#fdfdfd] px-2.5 h-9 overflow-hidden transition-all focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb]/20">
              <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#eee] text-[13px] text-[#555] font-medium select-none h-full bg-[#f8f8f8] -ml-2.5 pl-2.5">
                <span>IN +91</span>
                <span className="text-[9px] text-[#999]">▼</span>
              </div>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-2.5 text-[13px] text-[#333] h-full"
              />
              <button type="button" className="text-[11px] font-bold text-[#2563eb] hover:underline whitespace-nowrap px-1">
                Update
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

          {/* Row 5: State & City */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">State</label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="w-full px-2.5 h-9 border border-[#ccc] rounded-[4px] text-[13px] text-[#333] focus:ring-0 focus:border-[#2563eb]">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bihar">Bihar</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="West Bengal">West Bengal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#666] uppercase tracking-wide">City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full px-2.5 h-9 border border-[#ccc] rounded-[4px] text-[13px] text-[#333] focus:ring-0 focus:border-[#2563eb]">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Patna">Patna</SelectItem>
                  <SelectItem value="Gaya">Gaya</SelectItem>
                  <SelectItem value="Muzaffarpur">Muzaffarpur</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-[#f5f5f5]">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-5 h-9 text-[13px] font-semibold text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 rounded-[4px] transition-colors"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="px-5 h-9 text-[13px] font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-[4px] border-none shadow-sm transition-all"
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
