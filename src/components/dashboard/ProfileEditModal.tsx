import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Tables<'profiles'> | null;
  onProfileUpdate?: () => void;
}

interface CountryCode {
  id: string;
  name: string;
  code: string;
  dial_code: string;
  phone_length: number;
}

export function ProfileEditModal({ isOpen, onClose, profile, onProfileUpdate }: ProfileEditModalProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedDialCode, setSelectedDialCode] = useState("");
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCountries();
      loadProfileData();
    }
  }, [isOpen, profile]);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('country_codes')
        .select('id, name, code, dial_code, phone_length')
        .order('name');
      
      if (error) {
        console.error('Error fetching countries:', error);
        return;
      }
      if (data) setCountries(data as CountryCode[]);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const loadProfileData = async () => {
    setFetchingProfile(true);
    try {
      if (profile) {
        setFullName(profile.full_name || profile.student_name || "");
        setPhoneNumber(profile.phone || "");
        setSelectedDialCode(profile.dial_code || "+91");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, student_name, phone, dial_code')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFullName(data.full_name || data.student_name || "");
          setPhoneNumber(data.phone || "");
          setSelectedDialCode(data.dial_code || "+91");
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setFetchingProfile(false);
    }
  };

  const getSelectedCountryInfo = () => {
    return countries.find(c => c.dial_code === selectedDialCode);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const countryInfo = getSelectedCountryInfo();
    
    // Validation: Check phone number length
    if (phoneNumber && countryInfo && phoneNumber.length !== countryInfo.phone_length) {
      toast({
        title: "Invalid Phone Number",
        description: `Phone number for ${countryInfo.name} must be ${countryInfo.phone_length} digits.`,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          student_name: fullName,
          phone: phoneNumber,
          dial_code: selectedDialCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      onProfileUpdate?.();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
    const countryInfo = getSelectedCountryInfo();
    
    // If country is selected, limit input to that country's allowed length
    if (countryInfo && value.length > countryInfo.phone_length) {
      return;
    }
    setPhoneNumber(value);
  };

  // Format display for dial code dropdown
  const formatDropdownLabel = (country: CountryCode) => {
    return `${country.code} ${country.dial_code}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[94vw] max-w-[420px] px-4 sm:px-6">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {fetchingProfile ? (
          <div className="py-4 text-center">Loading profile...</div>
        ) : (
          <form onSubmit={updateProfile} className="grid gap-3.5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-[11px]">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="text-[13px]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="text-[11px]">
                Phone Number
                {getSelectedCountryInfo() && (
                  <span className="text-muted-foreground ml-2">
                    ({phoneNumber.length}/{getSelectedCountryInfo()?.phone_length} digits)
                  </span>
                )}
              </Label>
              <div className="flex gap-2">
                <div className="w-[110px] shrink-0">
                  <Select
                    value={selectedDialCode}
                    onValueChange={setSelectedDialCode}
                  >
                    <SelectTrigger className="text-[13px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.dial_code}>
                          {formatDropdownLabel(country)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder={getSelectedCountryInfo() ? "0".repeat(getSelectedCountryInfo()!.phone_length) : "1234567890"}
                  type="tel"
                  className="flex-1 text-[13px]"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProfileEditModal;
