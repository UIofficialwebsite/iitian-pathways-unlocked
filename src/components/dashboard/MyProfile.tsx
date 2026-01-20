import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Camera, Edit3, Save, X, Check } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

// Define profile type
type UserProfile = Tables<'profiles'> & {
  gender?: string | null; 
};

// --- PLACEHOLDER AVATARS ---
const MALE_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";
const FEMALE_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka";
const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=User";

// --- CUSTOM EDITABLE ROW COMPONENT ---
// Matches the "Info Row" design: Label (200px) | Value
const ProfileInfoRow = ({ 
  label, 
  value, 
  onSave, 
  type = 'text', 
  isSelect = false, 
  options = [] 
}: { 
  label: string, 
  value: string | null, 
  onSave?: (newValue: string) => Promise<void>, 
  type?: string,
  isSelect?: boolean,
  options?: {value: string, label: string}[]
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setIsLoading(true);
    await onSave(currentValue);
    setIsLoading(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentValue(value || "");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] py-3 border-b border-gray-50 items-center min-h-[48px] group">
      {/* Label */}
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      
      {/* Value Area */}
      <div className="flex items-center justify-between w-full">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full max-w-md animate-in fade-in duration-200">
            {isSelect ? (
              <Select value={currentValue} onValueChange={setCurrentValue}>
                <SelectTrigger className="h-9 bg-white text-sm">
                  <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input 
                type={type}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="h-9 bg-white text-sm"
              />
            )}
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={handleCancel} disabled={isLoading}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <span className="text-[14px] font-normal text-gray-900 truncate pr-4">
              {value || <span className="text-gray-300 italic">Not set</span>}
            </span>
            {onSave && (
              <button 
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const MyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
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
      const updateData = { [field]: value, updated_at: new Date().toISOString() };
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data as UserProfile);
      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to update. ${error.message}`, variant: "destructive" });
    }
  };

  const getAvatarSrc = () => {
    if (profile?.gender === 'Male') return MALE_AVATAR;
    if (profile?.gender === 'Female') return FEMALE_AVATAR;
    // Use DiceBear with the user's name as a seed for consistent distinct avatars
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.student_name || 'User'}`;
  };

  const getStatusText = () => {
    if (profile?.student_status) return `Status: ${profile.student_status}`;
    if (profile?.level) return `Class: ${profile.level}`;
    return "Student";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="font-['Inter',sans-serif] bg-gray-50/50 min-h-screen py-8 px-4 sm:px-6">
      
      {/* Main Container */}
      <div className="max-w-[1000px] mx-auto bg-white border border-slate-100 rounded-xl grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[80vh] shadow-[0_4px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="p-10 border-r border-slate-100 text-center flex flex-col items-center bg-white">
          <div className="relative inline-block mb-6">
            <img 
              src={getAvatarSrc()} 
              alt="User avatar" 
              className="w-[130px] h-[130px] rounded-full object-cover border border-slate-100 p-1 bg-white shadow-sm"
            />
            {/* Camera Button */}
            <div className="absolute bottom-1.5 right-1.5 bg-blue-600 text-white p-2 rounded-full border-[3px] border-white shadow-sm cursor-pointer flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Camera size={16} />
            </div>
          </div>
          
          <h2 className="text-[19px] font-bold text-gray-900 mb-4 tracking-tight leading-snug">
            {profile.student_name || "Welcome User"}
          </h2>
          
          <div className="bg-yellow-50 text-yellow-800 text-[13px] font-semibold py-2.5 px-4 rounded-lg w-full border border-yellow-100">
            {getStatusText()}
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="p-8 md:p-12 bg-white">
          
          {/* Overview Box */}
          <section className="bg-blue-50/50 rounded-xl p-6 mb-10 border border-blue-100/50">
            <div className="text-[16px] font-bold text-gray-900 mb-4 flex items-center justify-between">
              Level up overview
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total experience points</div>
                <div className="text-[15px] font-normal text-gray-900">0 XP</div>
              </div>
              <div className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Total enrollments</div>
                <div className="text-[15px] font-normal text-gray-900">0 Courses</div>
              </div>
            </div>
          </section>

          <h1 className="text-[22px] font-extrabold text-gray-900 mb-8 tracking-tight">Profile detail</h1>

          {/* Identity Information */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[16px] font-bold text-gray-900">Identity information</div>
              {/* This link is decorative/functional if you want a global edit mode, 
                  but individual row editing is enabled */}
              <button className="text-blue-600 text-[13px] font-bold flex items-center gap-1.5 hover:text-blue-700 transition-colors">
                <Edit3 size={14} /> Edit profile
              </button>
            </div>

            <div className="w-full">
              <ProfileInfoRow 
                label="Full name" 
                value={profile.student_name || profile.full_name} 
                onSave={(val) => handleUpdate('student_name', val)} 
              />
              <ProfileInfoRow 
                label="Mobile number" 
                value={profile.phone} 
                onSave={(val) => handleUpdate('phone', val)} 
                type="tel"
              />
              <ProfileInfoRow 
                label="Email address" 
                value={profile.email} 
                // Email is usually read-only
              />
              <ProfileInfoRow 
                label="Gender" 
                value={profile.gender} 
                onSave={(val) => handleUpdate('gender' as keyof UserProfile, val)}
                isSelect
                options={genderOptions}
              />
            </div>
          </section>

          {/* Divider */}
          <div className="h-px bg-slate-100 w-full my-10"></div>

          {/* Academic Information */}
          <section>
            <div className="text-[16px] font-bold text-gray-900 mb-4">Academic information</div>
            
            <div className="w-full">
              <ProfileInfoRow 
                label="Program type" 
                value={profile.program_type ? profile.program_type.replace(/_/g, ' ') : "Not set"} 
                // Assuming program type is set elsewhere or read-only here
              />
              
              {profile.program_type === 'IITM_BS' ? (
                <>
                  <ProfileInfoRow label="Branch" value={profile.branch} />
                  <ProfileInfoRow label="Current Level" value={profile.level} />
                </>
              ) : (
                <>
                  <ProfileInfoRow label="Current class" value={profile.level} />
                  <ProfileInfoRow label="Target examination" value={profile.exam_type} />
                </>
              )}
              
              {/* Placeholder for Education Board as it wasn't in original data type, 
                  but is in the design requirements */}
              <ProfileInfoRow 
                label="Education board" 
                value="CBSE" 
                // Static for now as requested by design, or add 'board' to DB later
              />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default MyProfile;
