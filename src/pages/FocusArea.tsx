import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, GraduationCap, Layout, BookOpen, ChevronRight, School, Trophy, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import FocusSelectionDrawer from '@/components/dashboard/FocusSelectionDrawer';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface FocusOption {
  id: string;
  parent_id: string | null;
  label: string;
  value_to_save: string;
  profile_column_to_update: string;
  icon: string | null;
  display_order: number;
}

// Icon mapping for root level cards
const rootIconMap: { [key: string]: React.ElementType } = {
  GraduationCap: GraduationCap,
  School: School,
  Trophy: Trophy,
  User: User,
  default: BookOpen,
};

const FocusArea = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [allOptions, setAllOptions] = useState<FocusOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedRootOption, setSelectedRootOption] = useState<FocusOption | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('focus_options' as any)
          .select('*')
          .order('display_order', { ascending: true });
          
        if (error) throw error;
        setAllOptions(data as any);
      } catch (error: any) {
        toast({ title: "Error", description: "Failed to load options.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOptions();
  }, [user, authLoading, navigate, toast]);

  const rootOptions = allOptions.filter(o => o.parent_id === null);

  const handleRootSelect = (option: FocusOption) => {
    setSelectedRootOption(option);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    // Delay clearing the selection slightly to avoid UI flicker during close animation
    setTimeout(() => setSelectedRootOption(null), 300);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading academic programs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center">
      {/* Navbar Minimal */}
      <div className="w-full px-6 py-4 border-b border-gray-100 flex justify-center md:justify-start">
         <img src="/lovable-uploads/logo_ui_new.png" alt="Logo" className="h-8 w-auto" />
      </div>

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-12 md:py-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12 max-w-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-2 shadow-sm">
             <Layout className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Choose your Academic Path
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Select your current program to help us personalize your learning experience with the most relevant content and resources.
          </p>
        </div>

        {/* Main Selection Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rootOptions.map((option) => {
            const Icon = rootIconMap[option.icon || 'default'] || rootIconMap.default;
            
            return (
              <Card 
                key={option.id}
                onClick={() => handleRootSelect(option)}
                className={cn(
                  "relative overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border border-gray-200",
                  "flex flex-col items-center justify-center p-8 text-center h-[280px] rounded-2xl bg-white hover:border-blue-500/30"
                )}
              >
                {/* Background Gradient on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/50 group-hover:to-purple-50/50 transition-all duration-500" />
                
                {/* Icon Circle */}
                <div className="relative z-10 bg-gray-50 group-hover:bg-white group-hover:scale-110 group-hover:shadow-md transition-all duration-300 p-5 rounded-full mb-6">
                  <Icon className="h-10 w-10 text-gray-600 group-hover:text-blue-600 transition-colors" />
                </div>
                
                {/* Text Content */}
                <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {option.label}
                </h3>
                
                <p className="relative z-10 text-sm text-gray-500 px-2 line-clamp-2 group-hover:text-gray-600">
                   Tap to explore branches, subjects, and specialized content.
                </p>

                {/* Call to Action - Slides Up on Hover */}
                <div className="absolute bottom-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                   <span className="text-blue-600 font-semibold text-sm flex items-center bg-blue-50 px-4 py-2 rounded-full">
                      Select Program <ChevronRight className="h-4 w-4 ml-1" />
                   </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Footer Minimal */}
      <div className="w-full py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} UnknownIITians. All rights reserved.
      </div>

      {/* The Drawer/Popup Logic */}
      <FocusSelectionDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        rootOption={selectedRootOption}
        allOptions={allOptions}
      />
    </div>
  );
};

export default FocusArea;
