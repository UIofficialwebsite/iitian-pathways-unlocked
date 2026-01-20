import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Camera, Edit3, Info } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import ProfileEditModal from './ProfileEditModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define profile type
type UserProfile = Tables<'profiles'> & {
  gender?: string | null; 
};

// --- SWAPPED AVATARS (Fixed Gender Mismatch) ---
// Swapped seeds as requested: Male gets 'Aneka', Female gets 'Felix' if they were reversed previously.
const MALE_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"; 
const FEMALE_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

// --- STATIC INFO ROW ---
const ProfileInfoRow = ({ label, value }: { label: string, value: string | null }) => (
  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] py-3 border-b border-gray-50 items-center min-h-[48px]">
    <div className="text-[13px] text-gray-500 font-medium">{label}</div>
    <div className="text-[14px] font-normal text-gray-900 truncate">
      {value || <span className="text-gray-300 italic">Not set</span>}
    </div>
  </div>
);

const MyProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  useEffect(() => {
    fetchProfile();
  }, [user, toast]);

  // --- FIXED AVATAR LOGIC ---
  const getAvatarSrc = () => {
    if (profile?.gender === 'Male') return MALE_AVATAR;
    if (profile?.gender === 'Female') return FEMALE_AVATAR;
    
    // Fallback based on name
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.student_name || 'User'}`;
  };

  // --- UPDATED STATUS TEXT ("Student" instead of "Class") ---
  const getStatusText = () => {
    if (profile?.student_status) return `Student: ${profile.student_status}`;
    return "Student";
  };

  if (loading) return <div className="flex items-center justify-center min-h-[500px]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!profile) return null;

  return (
    <div className="font-['Inter',sans-serif] bg-gray-50/50 min-h-screen py-4 px-3 sm:py-8 sm:px-6">
      
      {/* Edit Modal Component */}
      <ProfileEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        profile={profile}
        onProfileUpdate={fetchProfile}
      />

      <div className="max-w-[1000px] mx-auto bg-white border border-slate-100 rounded-xl grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[80vh] shadow-[0_4px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="p-6 sm:p-8 border-r border-slate-100 text-center flex flex-col items-center bg-white">
          <div className="relative inline-block mb-4 sm:mb-5">
            {/* Avatar Image */}
            <img 
              src={getAvatarSrc()} 
              alt="User avatar" 
              className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full object-cover border border-slate-100 p-1 bg-white shadow-sm"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.student_name || 'User')}&background=random&color=fff&size=128`;
              }}
            />
            <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1.5 rounded-full border-[3px] border-white shadow-sm cursor-pointer flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Camera size={14} />
            </div>
          </div>
          
          <h2 className="text-[17px] sm:text-[18px] font-bold text-gray-900 mb-2 sm:mb-3 tracking-tight leading-snug px-2">
            {profile.student_name || "Welcome User"}
          </h2>
          
          {/* UPDATED: Yellow Tag says "Student" */}
          <div className="bg-yellow-50 text-yellow-800 text-[11px] sm:text-[12px] font-semibold py-1.5 sm:py-2 px-4 rounded-lg w-full max-w-[200px] border border-yellow-100">
            {getStatusText()}
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="p-5 md:p-12 bg-white">
          
          {/* Overview Box */}
          <section className="bg-blue-50/50 rounded-xl p-4 sm:p-5 mb-8 border border-blue-100/50">
            <div className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-4 flex items-center justify-between">
              Level up overview
            </div>
            
            {/* FORCE 2 COLUMNS ON MOBILE */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Card 1: XP */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-100 shadow-sm relative min-h-[80px] flex flex-col justify-between">
                <div className="flex justify-between items-start w-full">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-tight pr-4">
                    Total XP Level
                  </div>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer -mt-1 -mr-1 p-1">
                          <Info className="h-3 w-3 text-gray-400 hover:text-blue-600 transition-colors" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="end" className="max-w-[240px] bg-slate-900 text-white border-none text-[11px] p-3 leading-relaxed z-[50]">
                        <p className="mb-2">Each <span className="text-yellow-400 font-bold">authenticated share</span> (link tracked & opened by &gt;5 unique people) counts as <span className="font-bold">0.5 XP</span>.</p>
                        <p className="opacity-90">Note: Just clicking share doesn't count. We track actual engagement.</p>
                        <div className="mt-2 pt-2 border-t border-slate-700 font-medium text-blue-200">
                          Reward: Top 2 percentile users get FREE course access!
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-[13px] sm:text-[14px] font-medium text-gray-900 mt-1">0 XP</div>
              </div>

              {/* Card 2: Enrollments */}
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-100 shadow-sm relative min-h-[80px] flex flex-col justify-between">
                <div className="flex justify-between items-start w-full">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-tight pr-4">
                    Total Enrollments
                  </div>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer -mt-1 -mr-1 p-1">
                          <Info className="h-3 w-3 text-gray-400 hover:text-blue-600 transition-colors" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="end" className="max-w-[180px] bg-slate-900 text-white border-none text-[11px] p-3 z-[50]">
                        Total number of active courses or batches you have enrolled in.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="text-[13px] sm:text-[14px] font-medium text-gray-900 mt-1">0 Courses</div>
              </div>

            </div>
          </section>

          <h1 className="text-[18px] sm:text-[20px] font-extrabold text-gray-900 mb-6 tracking-tight">Profile detail</h1>

          {/* Identity Information */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[15px] font-bold text-gray-900">Identity information</div>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-blue-600 text-[12px] font-bold flex items-center gap-1.5 hover:text-blue-700 transition-colors"
              >
                <Edit3 size={13} /> Edit profile
              </button>
            </div>

            <div className="w-full">
              <ProfileInfoRow label="Full name" value={profile.student_name || profile.full_name} />
              <ProfileInfoRow label="Mobile number" value={profile.phone} />
              <ProfileInfoRow label="Email address" value={profile.email} />
              <ProfileInfoRow label="Gender" value={profile.gender} />
            </div>
          </section>

          <div className="h-px bg-slate-100 w-full my-8"></div>

          {/* Academic Information */}
          <section>
            <div className="text-[15px] font-bold text-gray-900 mb-4">Academic information</div>
            
            <div className="w-full">
              <ProfileInfoRow 
                label="Program type" 
                value={profile.program_type ? profile.program_type.replace(/_/g, ' ') : "Not set"} 
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
              
              <ProfileInfoRow label="Education board" value="CBSE" />
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};

export default MyProfile;
