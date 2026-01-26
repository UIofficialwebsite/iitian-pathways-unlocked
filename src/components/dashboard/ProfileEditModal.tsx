import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CountryCode {
  id: string;
  name: string;
  code: string;
  dial_code: string;
  length: number;
}

export function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountryDialCode, setSelectedCountryDialCode] = useState("");
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCountries();
      getProfile();
    }
  }, [isOpen]);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('country_codes')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data) setCountries(data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const getProfile = async () => {
    setFetchingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone_number, country_code')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || "");
        setPhoneNumber(data.phone_number || "");
        setSelectedCountryDialCode(data.country_code || "");
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setFetchingProfile(false);
    }
  };

  const getSelectedCountryInfo = () => {
    return countries.find(c => c.dial_code === selectedCountryDialCode);
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const countryInfo = getSelectedCountryInfo();
    
    // Validation: Check phone number length
    if (countryInfo && phoneNumber.length !== countryInfo.length) {
      toast({
        title: "Invalid Phone Number",
        description: `Phone number for ${countryInfo.name} must be ${countryInfo.length} digits.`,
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
          phone_number: phoneNumber,
          country_code: selectedCountryDialCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
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
    if (countryInfo && value.length > countryInfo.length) {
      return;
    }
    setPhoneNumber(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        {fetchingProfile ? (
          <div className="py-4 text-center">Loading profile...</div>
        ) : (
          <form onSubmit={updateProfile} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-1">
                <Label htmlFor="countryCode">Code</Label>
                <Select
                  value={selectedCountryDialCode}
                  onValueChange={setSelectedCountryDialCode}
                >
                  <SelectTrigger id="countryCode">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.dial_code}>
                        {country.code} ({country.dial_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label htmlFor="phoneNumber">
                  Phone Number 
                  {getSelectedCountryInfo() && <span className="text-xs text-muted-foreground ml-2">(Req: {getSelectedCountryInfo()?.length} digits)</span>}
                </Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder={getSelectedCountryInfo() ? `${'0'.repeat(getSelectedCountryInfo()!.length)}` : "1234567890"}
                  type="tel"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
