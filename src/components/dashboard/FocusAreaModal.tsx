import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowRight, ChevronRight, GraduationCap, Laptop, UserCheck, Microscope } from 'lucide-react';

// Define profile type
interface UserProfile {
  id: string;
  program_type: string | null;
  branch?: string | null;
  level?: string | null;
  exam_type?: string | null;
  student_status?: string | null;
  [key: string]: any; // Allow other properties
}

interface FocusAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

type Step = 'initial' | 'competitive_exam' | 'iitm_bs';

const FocusAreaModal: React.FC<FocusAreaModalProps> = ({ isOpen, onClose, profile, onProfileUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // State for selections
  const [programType, setProgramType] = useState(profile?.program_type || '');
  const [examType, setExamType] = useState(profile?.exam_type || '');
  const [studentStatus, setStudentStatus] = useState(profile?.student_status || '');
  const [branch, setBranch] = useState(profile?.branch || '');
  const [level, setLevel] = useState(profile?.level || '');
  
  // State for UI flow
  const [step, setStep] = useState<Step>('initial');

  // Reset local state when modal opens or profile changes
  useEffect(() => {
    if (isOpen) {
      setProgramType(profile?.program_type || '');
      setExamType(profile?.exam_type || '');
      setStudentStatus(profile?.student_status || '');
      setBranch(profile?.branch || '');
      setLevel(profile?.level || '');
      setStep('initial');
    }
  }, [isOpen, profile]);

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    const updates: Partial<UserProfile> = {
      program_type: programType,
      exam_type: programType === 'COMPETITIVE_EXAM' ? examType : null,
      student_status: programType === 'COMPETITIVE_EXAM' ? studentStatus : null,
      branch: programType === 'IITM_BS' ? branch : null,
      level: programType === 'IITM_BS' ? level : null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      onProfileUpdate(data); // Update parent state
      toast({ title: "Success", description: "Your focus area has been updated." });
      onClose();

    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update profile.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInitialStep = () => (
    <>
      <DialogDescription>
        Select your academic program to get personalized content.
      </DialogDescription>
      <div className="space-y-4 pt-4">
        <Button
          variant={programType === 'IITM_BS' ? "default" : "outline"}
          className="w-full justify-between h-16 text-left"
          onClick={() => {
            setProgramType('IITM_BS');
            setStep('iitm_bs');
          }}
        >
          <div className="flex items-center">
            <GraduationCap className="h-6 w-6 mr-3" />
            <div>
              <p className="font-semibold">IITM BS Degree</p>
              <p className="text-xs">Data Science or Electronic Systems</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 animate-bounce-horizontal" />
        </Button>
        <Button
          variant={programType === 'COMPETITIVE_EXAM' ? "default" : "outline"}
          className="w-full justify-between h-16 text-left"
          onClick={() => {
            setProgramType('COMPETITIVE_EXAM');
            setStep('competitive_exam');
          }}
        >
          <div className="flex items-center">
            <UserCheck className="h-6 w-6 mr-3" />
            <div>
              <p className="font-semibold">Competitive Exam</p>
              <p className="text-xs">JEE, NEET, etc.</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 animate-bounce-horizontal" />
        </Button>
      </div>
    </>
  );

  const renderCompetitiveExamStep = () => (
    <>
      <DialogDescription>
        Select your exam and standard.
      </DialogDescription>
      <div className="space-y-4 pt-4">
        <Select value={examType} onValueChange={setExamType}>
          <SelectTrigger>
            <SelectValue placeholder="Select your Exam" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="JEE"><div className="flex items-center">JEE</div></SelectItem>
            <SelectItem value="NEET"><div className="flex items-center">NEET</div></SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={studentStatus} onValueChange={setStudentStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select your Standard" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="class11">Class 11</SelectItem>
            <SelectItem value="class12">Class 12</SelectItem>
            <SelectItem value="dropper">Dropper</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setStep('initial')}>Back</Button>
          <Button onClick={handleSave} disabled={isLoading || !examType || !studentStatus}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );

  const renderIITMBSStep = () => (
    <>
      <DialogDescription>
        Select your branch and level.
      </DialogDescription>
      <div className="space-y-4 pt-4">
        <Select value={branch} onValueChange={setBranch}>
          <SelectTrigger>
            <SelectValue placeholder="Select your Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="data-science">
              <div className="flex items-center gap-2"><Laptop className="h-4 w-4" /> Data Science</div>
            </SelectItem>
            <SelectItem value="electronic-systems">
              <div className="flex items-center gap-2"><Microscope className="h-4 w-4" /> Electronic Systems</div>
            </SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger>
            <SelectValue placeholder="Select your Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="foundation">Foundation</SelectItem>
            <SelectItem value="diploma">Diploma</SelectItem>
            <SelectItem value="degree">Degree</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setStep('initial')}>Back</Button>
          <Button onClick={handleSave} disabled={isLoading || !branch || !level}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose your focus area</DialogTitle>
        </DialogHeader>
        {step === 'initial' && renderInitialStep()}
        {step === 'competitive_exam' && renderCompetitiveExamStep()}
        {step === 'iitm_bs' && renderIITMBSStep()}
      </DialogContent>
    </Dialog>
  );
};

export default FocusAreaModal;
