import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, GraduationCap, BookOpen, School, Trophy, User, ArrowLeft, Briefcase, Calculator, Microscope, Atom } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import FocusSelectionDrawer, { FocusOption } from '@/components/dashboard/FocusSelectionDrawer';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Map icons from your database string to Lucide components
const rootIconMap: { [key: string]: React.ElementType } = {
  GraduationCap: GraduationCap,
  School: School,
  Trophy: Trophy,
  User: User,
  Briefcase: Briefcase,
  Calculator: Calculator,
  Microscope: Microscope,
  Atom: Atom,
  default: BookOpen,
};

const FocusArea = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [allOptions, setAllOptions] = useState<FocusOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedPath, setSelectedPath] = useState<FocusOption[]>([]);
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

  // Popular Options (Level 2) - Filter logic
  const popularKeywords = ['JEE', 'NEET', 'UPSC', 'Data Science', 'Foundation', 'Govt'];
  const popularOptions = allOptions.filter(option => 
    option.parent_id !== null && // Must be child
    popularKeywords.some(keyword => option.label.includes(keyword))
  ).slice(0, 4); // Limit to top 4 for the grid

  // Handlers
  const handleOptionClick = (option: FocusOption, isRoot: boolean) => {
    let path: FocusOption[] = [];

    if (isRoot) {
      path = [option];
    } else {
      // If it's a popular option (Level 2), we need to find its parent to build the path
      const parent = allOptions.find(o => o.id === option.parent_id);
      if (parent) {
        path = [parent, option];
      } else {
        path = [option]; // Fallback
      }
    }

    setSelectedPath(path);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedPath([]), 300);
  };

  // Color palette for All Categories
  const colorPalette = [
    { bg: 'bg-[#e3f2fd]', text: 'text-blue-600' },    // Blue soft
    { bg: 'bg-[#f3e5f5]', text: 'text-purple-600' },  // Purple soft
    { bg: 'bg-[#fff9c4]', text: 'text-yellow-700' },  // Yellow soft
    { bg: 'bg-[#ffebee]', text: 'text-red-600' },     // Red soft
    { bg: 'bg-[#e0f2f1]', text: 'text-teal-600' },    // Teal soft
    { bg: 'bg-[#e8f5e9]', text: 'text-green-600' },   // Green soft
  ];

  // Specific Colors for Popular Grid (matching your HTML)
  const popularColors = ['bg-[#e3f2fd]', 'bg-[#e8f5e9]', 'bg-[#fff9c4]', 'bg-[#ffe0b2]'];
  const popularIcons = ['⚛️', '🔬', '🏛️', '🎖️']; // Fallback emojis matching your HTML

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4 font-['Inter',sans-serif]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
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
         
        {/* Popular Exams Section */}
        {popularOptions.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[1.1rem] font-semibold mb-5 text-[#2d3436]">Popular Exams</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[15px]">
              {popularOptions.map((option, index) => {
                const colorClass = popularColors[index % popularColors.length];
                const emoji = popularIcons[index % popularIcons.length];
                
                return (
                  <div 
                    key={option.id}
                    onClick={() => handleOptionClick(option, false)}
                    className={cn(
                      "flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start p-[15px_20px] rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md text-inherit no-underline text-center sm:text-left gap-2 sm:gap-0",
                      colorClass
                    )}
                  >
                    <div className="w-[32px] h-[32px] sm:mr-[12px] flex items-center justify-center text-xl">
                      {emoji}
                    </div>
                    <span className="font-medium text-[0.95rem]">{option.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

         {/* All Categories Section */}
         <h2 className="text-[1.1rem] font-semibold mb-5 text-[#2d3436]">All Categories</h2>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rootOptions.map((option, index) => {
               // Cycle through colors
               const theme = colorPalette[index % colorPalette.length];
               // Resolve icon
               const IconComponent = rootIconMap[option.icon || 'default'] || rootIconMap.default;

               return (
                 <div
                   key={option.id}
                   onClick={() => handleOptionClick(option, true)}
                   className="flex items-center p-5 border border-[#e0e0e0] rounded-xl bg-white cursor-pointer hover:border-[#aaa] hover:bg-[#fafafa] transition-all duration-200 active:scale-[0.98]"
                 >
                    <div className={cn(
                      "w-[45px] h-[45px] rounded-lg mr-[15px] flex-shrink-0 flex items-center justify-center",
                      theme.bg
                    )}>
                       <IconComponent className={cn("w-6 h-6", theme.text)} />
                    </div>
                    <span className="text-[0.95rem] font-medium text-[#2d3436] line-clamp-2">
                      {option.label}
                    </span>
                 </div>
               );
            })}
         </div>

      </div>

      {/* Drawer Component */}
      <FocusSelectionDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        initialPath={selectedPath}
        allOptions={allOptions}
      />
    </div>
  );
};

export default FocusArea;
