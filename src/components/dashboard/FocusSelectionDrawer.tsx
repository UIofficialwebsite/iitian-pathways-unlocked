import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight, GraduationCap, Laptop, UserCheck, Microscope, Circle, ArrowLeft, Briefcase, Calculator, BookOpen, School, Trophy, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

// Exporting interface for use in FocusArea page
export interface FocusOption {
  id: string;
  parent_id: string | null;
  label: string;
  value_to_save: string;
  profile_column_to_update: string;
  icon: string | null;
  display_order: number;
}

interface FocusSelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rootOption: FocusOption | null; 
  allOptions: FocusOption[];
}

const iconMap: { [key: string]: React.ElementType } = {
  GraduationCap, UserCheck, Laptop, Microscope, 
  Briefcase, Calculator, School, Trophy, User, BookOpen,
  default: Circle,
};

const FocusSelectionDrawer: React.FC<FocusSelectionDrawerProps> = ({ 
  isOpen, 
  onClose, 
  rootOption, 
  allOptions 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  
  // Track the path of selected options
  const [selectionPath, setSelectionPath] = useState<FocusOption[]>([]);
  
  // Current parent ID determines which options to show
  const [currentStepParentId, setCurrentStepParentId] = useState<string | null>(null);

  // Initialize when rootOption changes or modal opens
  useEffect(() => {
    if (isOpen && rootOption) {
      setSelectionPath([rootOption]);
      setCurrentStepParentId(rootOption.id);
    }
  }, [isOpen, rootOption]);

  const handleOptionClick = (option: FocusOption) => {
    const newPath = [...selectionPath, option];
    setSelectionPath(newPath);

    // Check if this option has children
    const children = allOptions.filter(o => o.parent_id === option.id);
    
    if (children.length > 0) {
      // Move to next level
      setCurrentStepParentId(option.id);
    } else {
      // Final selection
      handleSave(newPath);
    }
  };

  const handleBack = () => {
    if (selectionPath.length <= 1) {
      // If at root level, close drawer
      onClose();
      return;
    }
    
    const newPath = selectionPath.slice(0, -1);
    setSelectionPath(newPath);
    const lastItem = newPath[newPath.length - 1];
    setCurrentStepParentId(lastItem.id);
  };

  const handleSave = async (path: FocusOption[]) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    const updates: { [key: string]: string | null } = {
      program_type: null,
      branch: null,
      level: null,
      exam_type: null,
      student_status: null,
    };
    
    path.forEach(option => {
      updates[option.profile_column_to_update] = option.value_to_save;
    });

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Success", description: "Focus area updated successfully!" });
      onClose();
      navigate('/dashboard'); 
      
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save selection.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter options for the current view
  const currentOptions = allOptions.filter(o => o.parent_id === currentStepParentId);
  const currentParent = allOptions.find(o => o.id === currentStepParentId);

  // Dynamic Title Logic
  let title = "Select Option";
  let description = "Please choose from the options below.";
  
  if (currentParent) {
    let stepTitle = currentParent.profile_column_to_update
      ? currentParent.profile_column_to_update.replace('_', ' ')
      : 'Next Step';
      
    if (stepTitle === 'program type') stepTitle = 'Program';
    if (stepTitle === 'exam type') stepTitle = 'Exam';
    if (stepTitle === 'student status') stepTitle = 'Current Status';
    
    stepTitle = stepTitle.charAt(0).toUpperCase() + stepTitle.slice(1);
    title = `Select ${stepTitle}`;
    description = `For: ${currentParent.label}`;
  }

  const Content = (
    <div className="w-full h-full flex flex-col font-sans px-4 pb-6">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48 space-y-4 animate-in fade-in">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 font-medium">Setting up your personalized dashboard...</p>
        </div>
      ) : (
        <div className="space-y-3 mt-4">
           {currentOptions.length > 0 ? (
            currentOptions.map((option) => {
              const Icon = iconMap[option.icon || 'default'] || iconMap.default;
              return (
                <Button
                  key={option.id}
                  variant="outline"
                  className="w-full justify-between h-16 text-left text-sm rounded-xl border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group px-4 shadow-sm"
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 text-[15px]">{option.label}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </Button>
              );
            })
          ) : (
            <div className="text-center py-10">
               <p className="text-gray-500">No options found for this selection.</p>
               <Button variant="link" onClick={handleBack}>Go Back</Button>
            </div>
          )}

          <div className="pt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-500 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to previous step
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="rounded-t-[24px] max-h-[85vh] outline-none">
          <DrawerHeader className="text-left px-6 pt-6 pb-2">
            <DrawerTitle className="text-xl font-bold text-gray-900">{title}</DrawerTitle>
            <DrawerDescription className="text-gray-500">{description}</DrawerDescription>
          </DrawerHeader>
          {Content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl bg-white duration-300">
         <div className="px-6 py-6 border-b border-gray-100 bg-white">
            <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
            <DialogDescription className="text-gray-500 mt-1">{description}</DialogDescription>
         </div>
         {Content}
      </DialogContent>
    </Dialog>
  );
};

export default FocusSelectionDrawer;
