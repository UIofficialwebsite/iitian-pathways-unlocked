import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Save, X, User, Camera } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define profile type
type UserProfile = Tables<'profiles'> & {
  gender?: string | null; 
};

// --- PLACEHOLDER AVATARS ---
const MALE_AVATAR = "https://placehold.co/400x400/EBF4FF/1E40AF?text=User&font=inter";
const FEMALE_AVATAR = "https://placehold.co/400x400/FCE7F3/DB2777?text=User&font=inter";
const DEFAULT_AVATAR = "https://placehold.co/400x400/F3F4F6/6B7280?text=User&font=inter";

// Helper component for editable text fields
const EditableField = ({ label, value, onSave, type = 'text' }: { label: string, value: string | null, onSave: (newValue: string) => Promise<void>, type?: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(currentValue);
    setIsLoading(false);
    setIsEditing(false);
  };

  return (
    <div className="py-4">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      {isEditing ? (
        <div className="flex items-center gap-2 mt-1">
          <Input 
            type={type}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="flex-1"
          />
          <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>
            <X className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-900 font-medium">{value || "Not set"}</p>
          <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Helper component for editable select fields
const EditableSelect = ({ label, value, onSave, options }: { label: string, value: string | null, onSave: (newValue: string) => Promise<void>, options: {value: string, label: string}[] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    await onSave(currentValue);
    setIsLoading(false);
    setIsEditing(false);
  };

  return (
    <div className="py-4">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      {isEditing ? (
        <div className="flex items-center gap-2 mt-1">
          <Select value={currentValue} onValueChange={setCurrentValue}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>
            <X className="h-4 w-4" />
          </Button>
          <Button size="icon" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-900 font-medium">{value || "Not set"}</p>
          <Button size="icon" variant="ghost" onClick={() => { setIsEditing(true); setCurrentValue(value || ""); }}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};


// Main Profile Component
const MyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setProfile(data as UserProfile);
      } catch (error: any) {
        toast({ title: "Error", description: "Could not fetch profile.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, toast]);

  const handleUpdate = async (field: keyof UserProfile, value: string) => {
    if (!user || !profile) return;
    try {
      // Use 'gender' as keyof UserProfile for the gender field
      const updateData = { [field]: value, updated_at: new Date().toISOString() };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data as UserProfile); // Update local state with new profile data
      toast({ title: "Success", description: `${String(field).replace('_', ' ')} updated.` });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to update ${String(field)}. ${error.message}`, variant: "destructive" });
    }
  };

  const getAvatarSrc = () => {
    if (profile?.gender === 'Male') return MALE_AVATAR;
    if (profile?.gender === 'Female') return FEMALE_AVATAR;
    return DEFAULT_AVATAR;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-royal" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
          <CardDescription>We couldn't load your profile. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* New Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">View and edit your personal information and academic focus.</p>
      </div>

      {/* New Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar */}
        <div className="lg:col-span-1">
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={getAvatarSrc()} alt={profile.student_name || "User"} />
                <AvatarFallback className="text-4xl">
                  {profile.student_name?.charAt(0).toUpperCase() || <User />}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 bg-white shadow">
                <Camera className="h-5 w-5" />
              </Button>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{profile.student_name || "Update Name"}</h2>
            <p className="text-gray-500">{profile.email}</p>
          </Card>
        </div>

        {/* Right Column: Info Cards */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-gray-200">
              <EditableField 
                label="Full Name" 
                value={profile.student_name || profile.full_name} 
                onSave={(value) => handleUpdate('student_name', value)} 
              />
              <EditableField 
                label="Phone" 
                value={profile.phone} 
                onSave={(value) => handleUpdate('phone', value)} 
                type="tel"
              />
              <EditableSelect
                label="Gender"
                value={profile.gender || null}
                onSave={(value) => handleUpdate('gender' as keyof UserProfile, value)}
                options={genderOptions}
              />
              <div className="py-4">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 font-medium mt-1">{profile.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Academic Program (Read-Only) */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Program</CardTitle>
              <CardDescription>
                To edit your focus area, please use the "My Focus Area" button in the sidebar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="py-2">
                <label className="text-sm font-medium text-gray-500">Program Type</label>
                <p className="text-gray-900 font-medium">{profile.program_type || "Not set"}</p>
              </div>
              {profile.program_type === 'IITM_BS' && (
                <>
                  <div className="py-2">
                    <label className="text-sm font-medium text-gray-500">Branch</label>
                    <p className="text-gray-900 font-medium capitalize">{profile.branch || "Not set"}</p>
                  </div>
                  <div className="py-2">
                    <label className="text-sm font-medium text-gray-500">Level</label>
                    <p className="text-gray-900 font-medium capitalize">{profile.level || "Not set"}</p>
                  </div>
                </>
              )}
              {profile.program_type === 'COMPETITIVE_EXAM' && (
                <>
                  <div className="py-2">
                    <label className="text-sm font-medium text-gray-500">Exam Type</label>
                    <p className="text-gray-900 font-medium">{profile.exam_type || "Not set"}</p>
                  </div>
                  <div className="py-2">
                    <label className="text-sm font-medium text-gray-500">Student Status</label>
                    <p className="text-gray-900 font-medium">{profile.student_status || "Not set"}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

