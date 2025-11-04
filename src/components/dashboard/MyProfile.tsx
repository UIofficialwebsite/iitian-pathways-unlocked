import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Save, X, User } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types'; // Import types
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select

// Define profile type
type UserProfile = Tables<'profiles'> & {
  gender?: string | null; // Add gender if it's not in your types yet
};

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
    <div className="py-4 border-b border-gray-200">
      <label className="text-sm font-medium text-gray-600">{label}</label>
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
          <p className="text-gray-900">{value || "Not set"}</p>
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
    <div className="py-4 border-b border-gray-200">
      <label className="text-sm font-medium text-gray-600">{label}</label>
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
          <p className="text-gray-900">{value || "Not set"}</p>
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
      const { data, error } = await supabase
        .from('profiles')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data as UserProfile); // Update local state with new profile data
      toast({ title: "Success", description: `${field.replace('_', ' ')} updated.` });
    } catch (error: any)
      toast({ title: "Error", description: `Failed to update ${field}. ${error.message}`, variant: "destructive" });
    }
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <User className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and edit your personal information.</p>
        </div>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <EditableField 
            label="Full Name" 
            value={profile.student_name || profile.full_name} 
            onSave={(value) => handleUpdate('student_name', value)} 
          />
          <div className="py-4 border-b border-gray-200">
            <label className="text-sm font-medium text-gray-600">Email</label>
            <p className="text-gray-900 mt-1">{profile.email}</p>
          </div>
          <EditableField 
            label="Phone" 
            value={profile.phone} 
            onSave={(value) => handleUpdate('phone', value)} 
            type="tel"
          />
          <EditableSelect
            label="Gender"
            value={profile.gender || null}
            onSave={(value) => handleUpdate('gender', value)}
            options={genderOptions}
          />
        </CardContent>
      </Card>

      {/* Academic Program details are now managed in the FocusAreaModal */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Program</CardTitle>
          <CardDescription>
            To edit your focus area, please use the "My Focus Area" button in the sidebar.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="py-4 border-b border-gray-200">
            <label className="text-sm font-medium text-gray-600">Program Type</label>
            <p className="text-gray-900 mt-1">{profile.program_type || "Not set"}</p>
          </div>
          {profile.program_type === 'IITM_BS' && (
            <>
              <div className="py-4 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-600">Branch</label>
                <p className="text-gray-900 mt-1 capitalize">{profile.branch || "Not set"}</p>
              </div>
              <div className="py-4 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-600">Level</label>
                <p className="text-gray-900 mt-1 capitalize">{profile.level || "Not set"}</p>
              </div>
            </>
          )}
          {profile.program_type === 'COMPETITIVE_EXAM' && (
            <>
              <div className="py-4 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-600">Exam Type</label>
                <p className="text-gray-900 mt-1">{profile.exam_type || "Not set"}</p>
              </div>
              <div className="py-4 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-600">Student Status</label>
                <p className="text-gray-900 mt-1">{profile.student_status || "Not set"}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfile;

