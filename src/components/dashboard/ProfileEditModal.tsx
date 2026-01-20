import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      const fullName = profile.student_name || profile.full_name || "";
      const nameParts = fullName.split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      
      setGender(profile.gender || "Male");
      setPhone(profile.phone || "");
      setEmail(profile.email || "");
      // Note: State and City are not in the profile schema shown previously, 
      // but we include them in the UI as requested.
      setState("Bihar"); 
      setCity("Patna");
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
          // If state/city columns exist in your DB, add them here:
          // state: state,
          // city: city
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile details updated successfully.",
      });
      onProfileUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white border border-[#ddd] shadow-[0_4px_15px_rgba(0,0,0,0.1)] rounded-lg gap-0 font-sans">
        
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-[#f0f0f0] flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-[18px] font-semibold text-[#333]">Edit Details</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-5">
          
          {/* First Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#666] block">First Name</label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#ccc] rounded-md text-sm text-[#444] outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#666] block">Last Name</label>
            <input 
              type="text" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#ccc] rounded-md text-sm text-[#444] outline-none focus:border-[#2563eb]"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-5">
              <span className="text-[15px] font-bold text-[#222]">Gender</span>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setGender('Male')}>
                <div className={`w-[18px] h-[18px] border-2 rounded-full relative flex items-center justify-center ${gender === 'Male' ? 'border-[#2563eb]' : 'border-[#ccc]'}`}>
                  {gender === 'Male' && <div className="w-2.5 h-2.5 bg-[#2563eb] rounded-full" />}
                </div>
                <span className="text-sm text-[#333]">Male</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setGender('Female')}>
                <div className={`w-[18px] h-[18px] border-2 rounded-full relative flex items-center justify-center ${gender === 'Female' ? 'border-[#2563eb]' : 'border-[#ccc]'}`}>
                  {gender === 'Female' && <div className="w-2.5 h-2.5 bg-[#2563eb] rounded-full" />}
                </div>
                <span className="text-sm text-[#333]">Female</span>
              </div>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#666] block">Mobile Number</label>
            <div className="flex items-center border border-[#ccc] rounded-md bg-[#f9f9f9] px-3 overflow-hidden">
              <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#ddd] text-sm text-[#666]">
                <span>IN +91</span>
                <span className="text-[10px]">▼</span>
              </div>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-2.5 py-2.5 text-sm text-[#444]"
              />
              <button type="button" className="text-[13px] font-medium text-[#2563eb] hover:underline whitespace-nowrap">
                Update Number
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#666] block">Email</label>
            <input 
              type="email" 
              value={email}
              readOnly 
              className="w-full px-3 py-2.5 border border-[#ccc] rounded-md text-sm text-[#444] outline-none bg-gray-50 cursor-not-allowed"
            />
          </div>

          {/* State (UI Only) */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#666] block">State</label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger className="w-full px-3 py-2.5 h-auto border border-[#ccc] rounded-md text-sm text-[#444] focus:ring-0 focus:border-[#2563eb]">
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

          {/* City (UI Only) */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#666] block">City</label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-full px-3 py-2.5 h-auto border border-[#ccc] rounded-md text-sm text-[#444] focus:ring-0 focus:border-[#2563eb]">
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

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-2.5 h-auto text-sm font-semibold text-[#2563eb] border border-[#2563eb] hover:bg-blue-50 rounded-md"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 h-auto text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-md border-none"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
