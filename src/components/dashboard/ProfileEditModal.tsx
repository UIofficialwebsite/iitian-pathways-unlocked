
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, BookOpen, GraduationCap } from "lucide-react";

interface UserProfile {
  program_type: string;
  branch?: string;
  level?: string;
  exam_type?: string;
  student_status?: string;
  subjects?: string[];
  student_name?: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [studentName, setStudentName] = useState('');
  const [programType, setProgramType] = useState('');
  const [branch, setBranch] = useState('');
  const [level, setLevel] = useState('');
  const [examType, setExamType] = useState('');
  const [studentStatus, setStudentStatus] = useState('');

  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      setStudentName(profile.student_name || '');
      setProgramType(profile.program_type || '');
      
      // Map database branch values to display values
      if (profile.branch === 'data-science') {
        setBranch('Data Science and Applications');
      } else if (profile.branch === 'electronic-systems') {
        setBranch('Electronic Systems');
      } else {
        setBranch(profile.branch || '');
      }
      
      setLevel(profile.level || '');
      setExamType(profile.exam_type || '');
      setStudentStatus(profile.student_status || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Map display branch values to database values
      let dbBranch = branch;
      if (branch === 'Data Science and Applications') {
        dbBranch = 'data-science';
      } else if (branch === 'Electronic Systems') {
        dbBranch = 'electronic-systems';
      }

      // First, save to updated_profiles for history
      const historyData = {
        user_id: user.id,
        student_name: studentName,
        program_type: programType,
        branch: programType === 'IITM_BS' ? dbBranch : null,
        level: programType === 'IITM_BS' ? level : null,
        exam_type: programType === 'COMPETITIVE_EXAM' ? examType : null,
        student_status: programType === 'COMPETITIVE_EXAM' ? studentStatus : null,
        full_name: studentName,
        email: user.email,
        role: 'student'
      };

      const { error: historyError } = await supabase
        .from('updated_profiles')
        .insert(historyData);

      if (historyError) {
        console.warn('History insert failed:', historyError);
      }

      // Then update the main profiles table
      const updateData: any = {
        student_name: studentName,
        program_type: programType,
      };

      if (programType === 'IITM_BS') {
        updateData.branch = dbBranch;
        updateData.level = level;
        updateData.exam_type = null;
        updateData.student_status = null;
        updateData.subjects = null;
      } else if (programType === 'COMPETITIVE_EXAM') {
        updateData.exam_type = examType;
        updateData.student_status = studentStatus;
        updateData.branch = null;
        updateData.level = null;
        updateData.subjects = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state with display values
      const updatedProfile = {
        ...profile,
        student_name: studentName,
        program_type: programType,
        branch: programType === 'IITM_BS' ? branch : undefined,
        level: programType === 'IITM_BS' ? level : undefined,
        exam_type: programType === 'COMPETITIVE_EXAM' ? examType : undefined,
        student_status: programType === 'COMPETITIVE_EXAM' ? studentStatus : undefined,
      } as UserProfile;
      
      onProfileUpdate(updatedProfile);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="student-name">Full Name</Label>
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="program-type">Program Type</Label>
                <Select value={programType} onValueChange={setProgramType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IITM_BS">IITM BS Degree</SelectItem>
                    <SelectItem value="COMPETITIVE_EXAM">Competitive Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* IITM BS Configuration */}
          {programType === 'IITM_BS' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  IITM BS Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Data Science and Applications">Data Science and Applications</SelectItem>
                      <SelectItem value="Electronic Systems">Electronic Systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualifier">Qualifier</SelectItem>
                      <SelectItem value="foundation">Foundation</SelectItem>
                      <SelectItem value="diploma">Diploma</SelectItem>
                      <SelectItem value="degree">Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitive Exam Configuration */}
          {programType === 'COMPETITIVE_EXAM' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Competitive Exam Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="exam-type">Exam Type</Label>
                  <Select value={examType} onValueChange={setExamType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JEE">JEE</SelectItem>
                      <SelectItem value="NEET">NEET</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="student-status">Student Status</Label>
                  <Select value={studentStatus} onValueChange={setStudentStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class 11">Class 11</SelectItem>
                      <SelectItem value="Class 12">Class 12</SelectItem>
                      <SelectItem value="Dropper">Dropper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;
