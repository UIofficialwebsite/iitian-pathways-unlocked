// src/components/dashboard/MyProfile.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, Save, X, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define profile type
interface UserProfile {
  id: string;
  full_name: string | null;
  student_name: string | null;
  email: string | null;
  program_type: string | null;
  branch: string | null;
  level: string | null;
  exam_type: string | null;
  student_status: string | null;
  // Add any other fields you want to show/edit
}

// Helper component for editable fields
const EditableField = ({ label, value, onSave }: { label: string, value: string | null, onSave: (newValue: string) => Promise<void> }) => {
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

// Main Profile Component
const MyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
        setProfile(data);
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
      
      setProfile(data); // Update local state with new profile data
      toast({ title: "Success", description: `${field.replace('_', ' ')} updated.` });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to update ${field}.`, variant: "destructive" });
    }
  };
  
  // Specific handler for Program Type (which controls other fields)
  const handleProgramTypeUpdate = async (value: string) => {
    if (!user || !profile) return;
    
    // When changing program type, clear the old fields
    const updates: Partial<UserProfile> = {
      program_type: value,
      updated_at: new Date().toISOString(),
      branch: null,
      level: null,
      exam_type: null,
      student_status: null
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      toast({ title: "Success", description: "Program type updated." });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update program type.", variant: "destructive" });
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
          <p className="text-gray-600">View and edit your personal information and preferences.</p>
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
        </CardContent>
      </Card>

      {/* Program Details */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Program</CardTitle>
          <CardDescription>This helps us personalize your content.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Program Type Selector */}
          <div className="py-4 border-b border-gray-200">
            <label className="text-sm font-medium text-gray-600">Program Type</label>
            <Select 
              value={profile.program_type || ""} 
              onValueChange={handleProgramTypeUpdate}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPETITIVE_EXAM">Competitive Exam (JEE, NEET)</SelectItem>
                <SelectItem value="IITM_BS">IITM BS Degree</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* IITM BS Fields */}
          {profile.program_type === 'IITM_BS' && (
            <>
              <div className="py-4 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-600">Branch</label>
                <Select 
                  value={profile.branch || ""} 
                  onValueChange={(value) => handleUpdate('branch', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data-science">Data Science and Applications</SelectItem>
                    <SelectItem value="electronic-systems">Electronic Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="py-4 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-600">Level</label>
                <Select 
                  value={profile.level || ""} 
                  onValueChange={(value) => handleUpdate('level', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="foundation">Foundation</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="degree">Degree</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Competitive Exam Fields */}
          {profile.program_type === 'COMPETITIVE_EXAM' && (
            <>
              <div className="py-4 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-600">Exam Type</label>
                <Select 
                  value={profile.exam_type || ""} 
                  onValueChange={(value) => handleUpdate('exam_type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JEE">JEE</SelectItem>
                    <SelectItem value="NEET">NEET</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="py-4 border-b border-gray-200">
                <label className="text-sm font-medium text-gray-600">Student Status</label>
                <Select 
                  value={profile.student_status || ""} 
                  onValueChange={(value) => handleUpdate('student_status', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class11">Class 11</SelectItem>
                    <SelectItem value="class12">Class 12</SelectItem>
                    <SelectItem value="dropper">Dropper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfile;
