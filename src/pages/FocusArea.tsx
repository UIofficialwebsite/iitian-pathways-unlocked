import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import FocusSelectionDrawer, { FocusOption } from '@/components/dashboard/FocusSelectionDrawer';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

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

  // Root Options (Level 1)
  const rootOptions = allOptions.filter(o => o.parent_id === null);

  const handleRootSelect = (option: FocusOption) => {
    setSelectedRootOption(option);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedRootOption(null), 300);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4 font-['Inter',sans-serif]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-900" />
        <p className="text-gray-500 font-medium">Loading your goals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#2d3436] font-['Inter',sans-serif] pb-12">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#eee] px-[5%] py-4 flex items-center h-16 shadow-sm">
         <button 
           onClick={() => navigate(-1)} 
           className="mr-auto text-xl p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors outline-none focus:bg-gray-100"
           aria-label="Go back"
         >
           <ArrowLeft className="w-6 h-6 text-gray-600" />
         </button>
         <h1 className="absolute left-1/2 -translate-x-1/2 text-[1.15rem] sm:text-[1.25rem] font-semibold text-[#2d3436]">
           Select your Goal
         </h1>
      </header>

      {/* Main Container */}
      <div className="max-w-[1100px] mx-auto mt-8 sm:mt-10 px-5">
         
         {/* All Categories Section */}
         <h2 className="text-[1.1rem] font-semibold mb-5 text-[#2d3436]">All Categories</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rootOptions.map((option) => (
               <div
                 key={option.id}
                 onClick={() => handleRootSelect(option)}
                 className="group relative flex items-center justify-between p-6 rounded-xl border border-gray-200 bg-white cursor-pointer transition-all duration-200 hover:border-gray-800 hover:shadow-sm active:scale-[0.99]"
               >
                  <span className="font-semibold text-[16px] text-gray-900 group-hover:text-black">
                    {option.label}
                  </span>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
               </div>
            ))}
         </div>

      </div>

      {/* Drawer Component */}
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
