import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, X, ChevronDown, ChevronRight, Atom, Stethoscope, 
  GraduationCap, BookOpen, Cpu, Award, Microscope, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { supabase } from "@/integrations/supabase/client";

interface NavCategory {
  id: string;
  label: string;
  parent_id: string | null;
  subCategories: NavCategory[];
}

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuData, setMenuData] = useState<NavCategory[]>([]);
  const [activeMainId, setActiveMainId] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const { courses } = useBackend();

  useEffect(() => {
    const fetchHierarchy = async () => {
      const { data: focusOptions } = await supabase
        .from('focus_options')
        .select('id, label, parent_id')
        .order('display_order', { ascending: true });

      if (focusOptions && courses) {
        const activeExamCategories = new Set(
          courses.map(c => c.exam_category?.toLowerCase())
        );

        const mainCats = focusOptions.filter(opt => !opt.parent_id);
        
        const structured = mainCats.map(main => {
          const subs = focusOptions.filter(opt => opt.parent_id === main.id);
          const availableSubs = subs.filter(sub => 
            activeExamCategories.has(sub.label.toLowerCase())
          );

          return { ...main, subCategories: availableSubs } as NavCategory;
        }).filter(main => main.subCategories.length > 0);

        setMenuData(structured);
        if (structured.length > 0 && !activeMainId) {
          setActiveMainId(structured[0].id);
        }
      }
    };
    fetchHierarchy();
  }, [courses]);

  const getProIcon = (label: string) => {
    const low = label.toLowerCase();
    if (low.includes('jee')) return <Atom className="w-8 h-8 text-blue-500" />;
    if (low.includes('neet')) return <Stethoscope className="w-8 h-8 text-red-500" />;
    if (low.includes('iitm')) return <GraduationCap className="w-8 h-8 text-emerald-600" />;
    if (low.includes('gate') || low.includes('ese')) return <Cpu className="w-8 h-8 text-amber-600" />;
    if (low.includes('olympiad')) return <Award className="w-8 h-8 text-purple-500" />;
    return <BookOpen className="w-8 h-8 text-slate-400" />;
  };

  const activeMainCategory = menuData.find(m => m.id === activeMainId);

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-50 h-16 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between relative">
        
        <div className="flex items-center absolute left-4">
          <Link to="/"><img src="/lovable-uploads/UI_logo.png" alt="UI Logo" className="h-9 w-auto" /></Link>
        </div>

        <div className="hidden md:flex items-center space-x-8 mx-auto">
          <Link to="/" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">Home</Link>
          <Link to="/about" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">About</Link>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-gray-600 hover:text-black text-sm font-medium h-auto p-0 flex items-center gap-1 focus:bg-transparent">
                  Courses
                </NavigationMenuTrigger>
                <NavigationMenuContent className="left-[-150px] lg:left-[-200px]"> {/* Prevents right-side cutting */}
                  <div className="flex w-[850px] h-[480px] bg-white rounded-md shadow-2xl overflow-hidden border border-gray-100">
                    {/* SIDEBAR */}
                    <aside className="w-[300px] bg-white border-r border-gray-50 overflow-y-auto pt-2">
                      {menuData.map((main) => (
                        <div 
                          key={main.id}
                          onMouseEnter={() => setActiveMainId(main.id)}
                          className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-all ${activeMainId === main.id ? 'bg-[#f5f5f5]' : 'hover:bg-[#fcfcfc]'}`}
                        >
                          <div className="sidebar-info">
                            <h4 className="text-[15px] font-semibold text-[#1a1a1a]">{main.label}</h4>
                            <p className="text-[11px] text-[#666] truncate max-w-[180px] font-normal">
                              {main.subCategories.map(s => s.label).join(', ')}
                            </p>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 ${activeMainId === main.id ? 'text-black' : 'text-gray-300'}`} />
                        </div>
                      ))}
                    </aside>

                    {/* GRID AREA */}
                    <main className="flex-1 bg-[#fcfcfc] p-8 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        {activeMainCategory?.subCategories.map((sub) => (
                          <NavigationMenuLink key={sub.id} asChild>
                            <Link 
                              to={`/courses/listing/${sub.label.toLowerCase().replace(/\s+/g, '-')}`}
                              className="bg-white border border-[#e0e0e0] p-4 rounded-[4px] flex items-center gap-4 hover:border-black hover:shadow-md transition-all group"
                            >
                              <div className="flex-shrink-0 grayscale group-hover:grayscale-0 transition-all">
                                {getProIcon(sub.label)}
                              </div>
                              <span className="text-[15px] font-semibold text-[#111]">{sub.label}</span>
                            </Link>
                          </NavigationMenuLink>
                        ))}
                      </div>
                    </main>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Restored Exam Prep Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-600 hover:text-black text-sm font-medium transition-colors flex items-center gap-1 outline-none">
                Exam Prep <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="rounded-xl border-gray-100 shadow-xl min-w-[180px]">
              <DropdownMenuItem asChild><Link to="/exam-preparation">All Exams</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/exam-preparation/jee">JEE Prep</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/exam-preparation/neet">NEET Prep</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/exam-preparation/iitm-bs">IITM BS Prep</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/career" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">Career</Link>
        </div>

        <div className="hidden md:flex items-center absolute right-4 space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-offset-2 ring-transparent hover:ring-black transition-all">
                  <Avatar className="h-9 w-9 border border-gray-100">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-black text-white">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 rounded-lg shadow-2xl border-gray-100" align="end">
                <DropdownMenuLabel>
                  <p className="text-sm font-bold text-gray-900">{user.user_metadata?.full_name || 'Student'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/dashboard" className="cursor-pointer">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={async () => { await signOut(); window.location.href = '/'; }} className="text-red-600 cursor-pointer">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button className="bg-black hover:bg-gray-800 text-white rounded-[4px] px-6 text-xs font-bold transition-all h-9 tracking-widest">SIGN IN</Button>
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center absolute right-4">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">{isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
        </div>
      </div>

      {/* MOBILE NAV */}
      {isOpen && (
        <div className="md:hidden bg-white border-t py-4 absolute w-full left-0 max-h-[80vh] overflow-y-auto">
          <div className="px-4 space-y-3">
            <Link to="/" className="block py-2 text-gray-700 font-medium border-b border-gray-50">Home</Link>
            <Link to="/about" className="block py-2 text-gray-700 font-medium border-b border-gray-50">About</Link>
            <div className="py-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-3">Courses</p>
              <div className="space-y-4">
                {menuData.map(main => (
                  <div key={main.id} className="space-y-2">
                    <p className="text-[13px] font-bold text-gray-800 px-2">{main.label}</p>
                    <div className="grid grid-cols-1 gap-1 pl-4">
                      {main.subCategories.map(sub => (
                        <Link key={sub.id} to={`/courses/listing/${sub.label.toLowerCase().replace(/\s+/g, '-')}`} className="text-[13px] text-gray-600 flex items-center py-1" onClick={() => setIsOpen(false)}>
                          <ChevronRight className="w-3 h-3 mr-2 text-gray-300" /> {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/exam-preparation" className="block py-2 text-gray-700 font-medium border-b border-gray-50">Exam Prep</Link>
            <Link to="/career" className="block py-2 text-gray-700 font-medium">Career</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
