import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, X, ChevronDown, ChevronRight, Atom, Stethoscope, 
  GraduationCap, BookOpen, Layout, Cpu, Globe, Award, Microscope
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

  // 1. DYNAMIC HIERARCHY FETCHING & FILTERING
  useEffect(() => {
    const fetchHierarchy = async () => {
      // Fetch all focus options to build the tree
      const { data: focusOptions } = await supabase
        .from('focus_options')
        .select('id, label, parent_id')
        .order('display_order', { ascending: true });

      if (focusOptions && courses) {
        // Identify categories that actually have active courses
        const activeExamCategories = new Set(
          courses.map(c => c.exam_category?.toLowerCase())
        );

        // Filter into Main Categories (parent_id is null)
        const mainCats = focusOptions.filter(opt => !opt.parent_id);
        
        // Build hierarchy and show only sub-categories with available courses
        const structured = mainCats.map(main => {
          const subs = focusOptions.filter(opt => opt.parent_id === main.id);
          const availableSubs = subs.filter(sub => 
            activeExamCategories.has(sub.label.toLowerCase())
          );

          return {
            ...main,
            subCategories: availableSubs
          } as NavCategory;
        }).filter(main => main.subCategories.length > 0); // Only show main categories with active subs

        setMenuData(structured);
        // Default to the first main category as active in the sidebar
        if (structured.length > 0 && !activeMainId) {
          setActiveMainId(structured[0].id);
        }
      }
    };

    fetchHierarchy();
  }, [courses]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Professional Icon Mapping Helper
  const getProfessionalIcon = (label: string) => {
    const normalize = label.toLowerCase();
    if (normalize.includes('jee')) return <Atom className="w-8 h-8 text-blue-500" />;
    if (normalize.includes('neet')) return <Stethoscope className="w-8 h-8 text-red-500" />;
    if (normalize.includes('gate') || normalize.includes('ese')) return <Cpu className="w-8 h-8 text-amber-600" />;
    if (normalize.includes('iitm') || normalize.includes('bs')) return <GraduationCap className="w-8 h-8 text-emerald-600" />;
    if (normalize.includes('olympiad')) return <Award className="w-8 h-8 text-purple-500" />;
    if (normalize.includes('science')) return <Microscope className="w-8 h-8 text-cyan-600" />;
    return <BookOpen className="w-8 h-8 text-slate-500" />;
  };

  const activeMainCategory = menuData.find(m => m.id === activeMainId);

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between relative">
        
        {/* Logo */}
        <div className="flex items-center absolute left-4">
          <Link to="/">
            <img src="/lovable-uploads/UI_logo.png" alt="UI Logo" className="h-9 w-auto" />
          </Link>
        </div>

        {/* Center Navigation group */}
        <div className="hidden md:flex items-center space-x-8 mx-auto font-['Inter',sans-serif]">
          <Link to="/" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">Home</Link>
          <Link to="/about" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">About</Link>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-gray-600 hover:text-black text-sm font-medium h-auto p-0 flex items-center gap-1">
                  Courses
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex w-[900px] h-[500px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-100">
                    {/* SIDEBAR (Main Categories) */}
                    <aside className="w-[320px] bg-white border-r border-gray-50 overflow-y-auto">
                      {menuData.map((main) => (
                        <div 
                          key={main.id}
                          onMouseEnter={() => setActiveMainId(main.id)}
                          className={`flex items-center justify-between px-6 py-5 cursor-pointer transition-colors ${activeMainId === main.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
                        >
                          <div className="sidebar-info">
                            <h4 className="text-[15px] font-semibold text-gray-900">{main.label}</h4>
                            <p className="text-[11px] text-gray-500 truncate max-w-[200px] mt-0.5 font-normal">
                              {main.subCategories.map(s => s.label).join(', ')}
                            </p>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-colors ${activeMainId === main.id ? 'text-blue-600' : 'text-gray-300'}`} />
                        </div>
                      ))}
                    </aside>

                    {/* GRID CONTENT (Available Sub-Categories) */}
                    <main className="flex-1 bg-[#fcfcfc] p-8 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        {activeMainCategory?.subCategories.map((sub) => (
                          <NavigationMenuLink key={sub.id} asChild>
                            <Link 
                              to={`/courses/listing/${sub.label.toLowerCase().replace(/\s+/g, '-')}`}
                              className="bg-white border border-gray-100 p-5 rounded-[4px] flex items-center gap-5 hover:border-black hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                            >
                              <div className="flex-shrink-0">
                                {getProfessionalIcon(sub.label)}
                              </div>
                              <span className="text-[16px] font-bold text-gray-900">{sub.label}</span>
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

          <Link to="/career" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">Career</Link>
        </div>

        {/* User Auth Section */}
        <div className="hidden md:flex items-center absolute right-4 space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-offset-2 ring-transparent hover:ring-royal transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-royal text-white">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-2xl border border-gray-100" align="end">
                <DropdownMenuLabel>
                  <p className="text-sm font-bold text-gray-900">{user.user_metadata?.full_name || 'Student'}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/dashboard" className="cursor-pointer">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button className="bg-black hover:bg-gray-800 text-white rounded-sm px-6 text-xs font-bold transition-all h-9">
                SIGN IN
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center absolute right-4">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t py-4 absolute w-full left-0 font-['Inter',sans-serif]">
          <div className="px-4 space-y-2">
            <Link to="/" className="block py-2 text-gray-700 font-medium">Home</Link>
            <Link to="/about" className="block py-2 text-gray-700 font-medium">About</Link>
            
            <div className="py-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Courses</p>
              <div className="pl-2 space-y-4">
                {menuData.map(main => (
                  <div key={main.id} className="space-y-2">
                    <p className="text-sm font-bold text-gray-800">{main.label}</p>
                    <div className="grid grid-cols-1 gap-2 pl-2">
                      {main.subCategories.map(sub => (
                        <Link 
                          key={sub.id} 
                          to={`/courses/listing/${sub.label.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-sm text-gray-600 flex items-center"
                          onClick={() => setIsOpen(false)}
                        >
                          <ChevronRight className="w-3 h-3 mr-2 text-gray-300" /> {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/career" className="block py-2 text-gray-700 font-medium">Career</Link>
            {user ? (
              <button onClick={handleSignOut} className="block w-full text-left py-2 text-red-600 font-medium">Sign Out</button>
            ) : (
              <Link to="/auth" className="block py-2"><Button className="w-full bg-black text-white h-10">SIGN IN</Button></Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
