import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CountryCode {
  id: string;
  name: string;
  code: string;
  dial_code: string;
  phone_length: number;
}

interface ProfileSetupProps {
  onComplete?: () => void;
}

export const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedDialCode, setSelectedDialCode] = useState("+91");
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('country_codes')
        .select('id, name, code, dial_code, phone_length')
        .order('name');
      
      if (data) setCountries(data as CountryCode[]);
      
      // Set default (India +91)
      const defaultCountry = data?.find((c: any) => c.code === 'IN');
      if (defaultCountry && !selectedDialCode) {
        setSelectedDialCode(defaultCountry.dial_code);
      }
    };
    
    fetchCountries();
  }, []);

  const getSelectedCountryInfo = () => {
    return countries.find(c => c.dial_code === selectedDialCode);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const countryInfo = getSelectedCountryInfo();
    
    if (countryInfo && value.length > countryInfo.phone_length) {
      return; // Prevent typing more than allowed length
    }
    setPhoneNumber(value);
  };

  // Format display for dial code dropdown
  const formatDropdownLabel = (country: CountryCode) => {
    return `${country.code} ${country.dial_code}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    const countryInfo = getSelectedCountryInfo();

    // Validation
    if (!fullName.trim()) {
      toast({ title: "Error", description: "Full Name is required", variant: "destructive" });
      setLoading(false);
      return;
    }
    if (phoneNumber && countryInfo && phoneNumber.length !== countryInfo.phone_length) {
      toast({ 
        title: "Invalid Phone Number", 
        description: `Phone number must be exactly ${countryInfo.phone_length} digits`, 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          student_name: fullName,
          phone: phoneNumber,
          dial_code: selectedDialCode,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Completed",
        description: "Welcome to the platform!",
      });
      
      if (onComplete) {
        onComplete();
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-8 p-8 bg-card rounded-xl shadow-lg border">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Complete Your Profile</h2>
        <p className="text-muted-foreground mt-2">Please provide your details to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <div className="flex gap-2">
            <div className="w-[120px] shrink-0">
              <Select
                value={selectedDialCode}
                onValueChange={setSelectedDialCode}
              >
                <SelectTrigger>
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
              type="tel"
              placeholder={getSelectedCountryInfo() ? "0".repeat(getSelectedCountryInfo()!.phone_length) : "Mobile Number"}
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="flex-1"
            />
          </div>
          {getSelectedCountryInfo() && (
            <p className="text-xs text-muted-foreground text-right">
              {phoneNumber.length}/{getSelectedCountryInfo()?.phone_length} digits
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Complete Setup"}
        </Button>
      </form>
    </div>
  );
};

export default ProfileSetup;
