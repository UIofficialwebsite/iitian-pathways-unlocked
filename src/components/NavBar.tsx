import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Atom, 
  Stethoscope, 
  GraduationCap, 
  BookOpen,
  Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
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
  const { user, signOut } = useAuth();
  const { courses } = useBackend();

  useEffect(() => {
    const fetchHierarchy = async () => {
      // 1. Fetch all focus options
      const { data: focusOptions } = await supabase
        .from('focus_options')
        .select('id, label, parent_id')
        .order('display_order', { ascending: true });

      if (focusOptions && courses) {
        // 2. Identify categories that actually have courses
        const activeExamCategories = new Set(
          courses.map(c => c.exam_category?.toLowerCase())
        );

        // 3. Filter into Main Categories (parent_id is null)
        const mainCats = focusOptions.filter(opt => !opt.parent_id);
        
        // 4. Build hierarchy and filter by course availability
        const structured = mainCats.map(main => {
          const subs = focusOptions.filter(opt => opt.parent_id === main.id);
          const availableSubs = subs.filter(sub => 
            activeExamCategories.has(sub.label.toLowerCase())
          );

          return {
            ...main,
            subCategories: availableSubs
          } as NavCategory;
        }).filter(main => main.subCategories.length > 0);

        setMenuData(structured);
      }
    };

    fetchHierarchy();
  }, [courses]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Helper to assign icons/slugs
  const getStyle = (label: string) => {
    const normalize = label.toLowerCase();
    if (normalize.includes('jee')) return { icon: Atom, color: "text-[#f39c12]", slug: 'jee' };
    if (normalize.includes('neet')) return { icon: Stethoscope, color: "text-[#e74c3c]", slug: 'neet' };
    if (normalize.includes('iitm')) return { icon: GraduationCap, color: "text-[#2ecc71]", slug: 'iitm-bs' };
    return { icon: BookOpen, color: "text-gray-600", slug: label.toLowerCase().replace(/\s+/g, '-') };
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 relative">
          {/* Logo */}
          <div className="flex items-center absolute left-0">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="/lovable-uploads/UI_logo.png" 
                alt="UI Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Center Navigation Group */}
          <div className="hidden md:flex items-center justify-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-royal transition-colors text-sm font-medium">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-royal transition-colors text-sm font-medium">
              About
            </Link>
            
            {/* Dynamic Courses Multi-Level Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className="bg-transparent text-gray-700 hover:text-royal hover:bg-transparent focus:bg-transparent text-sm font-medium h-auto p-0"
                  >
                    Courses
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[800px] p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
                       {menuData.length === 0 ? (
                         <div className="text-center p-4 text-gray-400 text-sm italic">
                           No courses currently available.
                         </div>
                       ) : (
                         <div className="grid grid-cols-3 gap-8">
                            {menuData.map((main) => (
                              <div key={main.id} className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">
                                  {main.label}
                                </h4>
                                <ul className="space-y-2">
                                  {main.subCategories.map((sub) => {
                                    const style = getStyle(sub.label);
                                    const Icon = style.icon;
                                    return (
                                      <li key={sub.id}>
                                        <NavigationMenuLink asChild>
                                          <Link 
                                            to={`/courses/listing/${style.slug}`}
                                            className="flex items-center group p-2 rounded-lg hover:bg-gray-50 transition-all"
                                          >
                                            <div className={`mr-3 p-1.5 rounded-md bg-gray-50 group-hover:bg-white shadow-sm ${style.color}`}>
                                              <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-royal">
                                              {sub.label}
                                            </span>
                                          </Link>
                                        </NavigationMenuLink>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            ))}
                         </div>
                       )}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-royal transition-colors flex items-center bg-transparent p-0 h-auto font-medium text-sm focus-visible:ring-0">
                  Exam Prep <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl border-gray-100 shadow-xl">
                <DropdownMenuItem asChild><Link to="/exam-preparation">All Exams</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/exam-preparation/jee">JEE Prep</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/exam-preparation/neet">NEET Prep</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/exam-preparation/iitm-bs">IITM BS Prep</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/career" className="text-gray-700 hover:text-royal transition-colors text-sm font-medium">
              Career
            </Link>
          </div>

          {/* User Auth */}
          <div className="hidden md:flex items-center absolute right-0">
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
                <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-2xl border-gray-100" align="end">
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
                <Button className="bg-royal hover:bg-royal-dark text-white rounded-full px-6 shadow-md transition-all hover:scale-105">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center absolute right-0">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-t py-4">
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
                          >
                            <ChevronRight className="w-3 h-3 mr-2 text-gray-300" /> {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/exam-preparation" className="block py-2 text-gray-700 font-medium">Exam Preparation</Link>
              <Link to="/career" className="block py-2 text-gray-700 font-medium">Career</Link>
              {user ? (
                <button onClick={handleSignOut} className="block w-full text-left py-2 text-red-600 font-medium">Sign Out</button>
              ) : (
                <Link to="/auth" className="block py-2"><Button className="w-full bg-royal text-white rounded-full">Sign In</Button></Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
