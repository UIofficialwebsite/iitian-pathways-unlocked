import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, ChevronRight, GraduationCap, Laptop, UserCheck, Microscope, Circle } from 'lucide-react';
// We no longer import the constants file

// Define the shape of the options we fetch
interface FocusOption {
  id: string;
  parent_id: string | null;
  label: string;
  value_to_save: string;
  profile_column_to_update: string;
  icon: string | null;
  display_order: number;
}

// Define profile type
interface UserProfile {
  id: string;
  program_type: string | null;
  branch?: string | null;
  level?: string | null;
  exam_type?: string | null;
  student_status?: string | null;
  [key: string]: any;
}

interface FocusAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

// Map icon strings from database to actual components
const iconMap: { [key: string]: React.ElementType } = {
  GraduationCap: GraduationCap,
  UserCheck: UserCheck,
  Laptop: Laptop,
  Microscope: Microscope,
  default: Circle,
};

const FocusAreaModal: React.FC<FocusAreaModalProps> = ({ isOpen, onClose, profile, onProfileUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingOptions, setIsFetchingOptions] = useState(true);
  
  // State for all options fetched from DB
  const [allOptions, setAllOptions] = useState<FocusOption[]>([]);
  
  // State for tracking the user's path through the tree
  const [selectionPath, setSelectionPath] = useState<FocusOption[]>([]);
  
  // The ID of the current parent (null = root)
  const [currentStepParentId, setCurrentStepParentId] = useState<string | null>(null);

  // This effect runs when the modal opens to fetch all options
  useEffect(() => {
    if (isOpen) {
      setIsFetchingOptions(true);
      setCurrentStepParentId(null); // Always start at the root
      setSelectionPath([]); // Clear path

      const fetchOptions = async () => {
        try {
          const { data, error } = await supabase
            .from('focus_options' as any)
            .select('*')
            .order('display_order', { ascending: true });
            
          if (error) throw error;
          setAllOptions(data as any);
        } catch (error: any) {
          toast({ title: "Error", description: "Could not load program options.", variant: "destructive" });
        } finally {
          setIsFetchingOptions(false);
        }
      };
      
      fetchOptions();
    }
  }, [isOpen, toast]);
  
  // This function is called when a user clicks an option
  const handleOptionClick = (option: FocusOption) => {
    // Find the depth of the clicked item to replace the correct part of the path
    const parentIndex = selectionPath.findIndex(p => p.id === option.parent_id);
    const newPath = [...selectionPath.slice(0, parentIndex + 1), option];
    setSelectionPath(newPath);

    // Check if this option has children
    const children = allOptions.filter(o => o.parent_id === option.id);
    
    if (children.length > 0) {
      // If yes, move to the next step
      setCurrentStepParentId(option.id);
    } else {
      // If no, this is the final selection, save it.
      handleSave(newPath);
    }
  };

  // This function builds the 'updates' object dynamically
  const handleSave = async (path: FocusOption[]) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    
    // Start with all relevant fields cleared
    const updates: { [key: string]: string | null } = {
      program_type: null,
      branch: null,
      level: null,
      exam_type: null,
      student_status: null,
    };
    
    // Add the new values from the user's path
    path.forEach(option => {
      updates[option.profile_column_to_update] = option.value_to_save;
    });

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

  // Get the options for the current step
  const currentOptions = allOptions.filter(o => o.parent_id === currentStepParentId);
  
  // Get the title/description for the current step
  const currentParent = allOptions.find(o => o.id === currentStepParentId);
  let title = "Choose your focus area";
  let description = "Select your academic program to get personalized content.";
  if (currentParent) {
    // A bit of logic to make the title user-friendly
    let stepTitle = currentParent.profile_column_to_update.replace('_', ' ');
    if (stepTitle === 'program type') stepTitle = 'program';
    if (stepTitle === 'exam type') stepTitle = 'exam';
    if (stepTitle === 'student status') stepTitle = 'standard';

    title = `Select ${stepTitle}`; // e.g., "Select branch"
    description = `You selected: ${selectionPath.map(p => p.label).join(' > ')}`;
  }

  // Check if the user has a value selected at this step
  const selectedValue = selectionPath.find(p => p.parent_id === currentStepParentId)?.value_to_save;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isFetchingOptions || isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {currentOptions.length > 0 ? (
              currentOptions.map(option => {
                const Icon = iconMap[option.icon || 'default'] || iconMap.default;
                return (
                  <Button
                    key={option.id}
                    variant={selectedValue === option.value_to_save ? "default" : "outline"}
                    className="w-full justify-between h-16 text-left"
                    onClick={() => handleOptionClick(option)}
                  >
                    <div className="flex items-center">
                      <Icon className="h-6 w-6 mr-3" />
                      <div>
                        <p className="font-semibold">{option.label}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 group-hover:animate-bounce-horizontal" />
                  </Button>
                );
              })
            ) : (
              <p className="text-center text-gray-500">No options available for this selection.</p>
            )}

            {/* Back Button */}
            {currentStepParentId !== null && (
              <Button
                variant="ghost"
                onClick={() => {
                  const newPath = [...selectionPath.slice(0, -1)];
                  setSelectionPath(newPath);
                  setCurrentStepParentId(newPath.length > 0 ? newPath[newPath.length - 1].parent_id : null);
                }}
              >
                Back
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FocusAreaModal;

