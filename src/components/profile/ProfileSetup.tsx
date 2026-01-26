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
  length: number;
}

export const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountryDialCode, setSelectedCountryDialCode] = useState("");
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      const { data, error } = await supabase
        .from('country_codes')
        .select('*')
        .order('name');
      
      if (data) setCountries(data);
      // Set default if exists (e.g., India +91)
      const defaultCountry = data?.find(c => c.code === 'IN');
      if (defaultCountry && !selectedCountryDialCode) {
        setSelectedCountryDialCode(defaultCountry.dial_code);
      }
    };
    
    fetchCountries();
  }, []);

  const getSelectedCountryInfo = () => {
    return countries.find(c => c.dial_code === selectedCountryDialCode);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const countryInfo = getSelectedCountryInfo();
    
    if (countryInfo && value.length > countryInfo.length) {
      return; // Prevent typing more than allowed length
    }
    setPhoneNumber(value);
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
    if (countryInfo && phoneNumber.length !== countryInfo.length) {
      toast({ 
        title: "Invalid Phone Number", 
        description: `Phone number must be exactly ${countryInfo.length} digits`, 
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
          phone_number: phoneNumber,
          country_code: selectedCountryDialCode,
          is_profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Completed",
        description: "Welcome to the platform!",
      });
      navigate("/dashboard");
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
            <div className="w-[140px]">
              <Select
                value={selectedCountryDialCode}
                onValueChange={setSelectedCountryDialCode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.dial_code}>
                      <span className="flex items-center gap-2">
                        <span>{country.code}</span>
                        <span className="text-muted-foreground">{country.dial_code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              type="tel"
              placeholder={getSelectedCountryInfo() ? `${'0'.repeat(getSelectedCountryInfo()!.length)}` : "Mobile Number"}
              value={phoneNumber}
              onChange={handlePhoneChange}
              className="flex-1"
            />
          </div>
          {getSelectedCountryInfo() && (
            <p className="text-xs text-muted-foreground text-right">
              {phoneNumber.length}/{getSelectedCountryInfo()?.length} digits
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
