import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Atom, 
  Stethoscope, 
  GraduationCap, 
  Trophy, 
  BookOpen, 
  Cpu, 
  Calculator, 
  Globe 
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

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { courses } = useBackend();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Dynamically extract unique categories from available courses
  const courseCategories = useMemo(() => {
    const categories = new Set<string>();
    if (courses && courses.length > 0) {
      courses.forEach(course => {
        if (course.exam_category) {
          categories.add(course.exam_category);
        }
      });
    }
    return Array.from(categories).sort();
  }, [courses]);

  // Helper to map dynamic category names to professional icons and colors
  const getCategoryStyle = (category: string) => {
    const normalize = category.toLowerCase();
    
    if (normalize.includes('jee')) {
      return { 
        icon: Atom, 
        color: "text-orange-500", 
        slug: 'jee',
        label: "IIT JEE"
      };
    }
    if (normalize.includes('neet')) {
      return { 
        icon: Stethoscope, 
        color: "text-red-500", 
        slug: 'neet',
        label: "NEET" 
      };
    }
    if (normalize.includes('iitm') || normalize.includes('bs')) {
      return { 
        icon: GraduationCap, 
        color: "text-green-600", 
        slug: 'iitm-bs',
        label: "IITM BS" 
      };
    }
    if (normalize.includes('olympiad')) {
      return { 
        icon: Trophy, 
        color: "text-yellow-600", 
        slug: 'olympiad',
        label: category 
      };
    }
    if (normalize.includes('gate')) {
      return { 
        icon: Calculator, 
        color: "text-yellow-500", 
        slug: 'gate',
        label: "GATE" 
      };
    }
    if (normalize.includes('ese')) {
      return { 
        icon: Cpu, 
        color: "text-blue-500", 
        slug: 'ese',
        label: "ESE" 
      };
    }
    
    // Default fallback
    return { 
      icon: BookOpen, 
      color: "text-gray-600", 
      slug: category.toLowerCase().replace(/\s+/g, '-'),
      label: category 
    };
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
                alt="Unknown IITians Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Center Navigation Group */}
          <div className="hidden md:flex items-center justify-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-royal transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-royal transition-colors">
              About
            </Link>
            
            {/* Dynamic Courses Dropdown (Hover) */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className="bg-transparent text-gray-700 hover:text-royal hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent text-base font-normal h-auto p-0"
                  >
                    Courses
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] p-6 bg-[#f9f9f9] rounded-lg">
                       {courseCategories.length === 0 ? (
                         <div className="text-center p-4 text-gray-500">
                           No active batches currently available.
                         </div>
                       ) : (
                         <div className="grid grid-cols-2 gap-6">
                            {/* Link to All Courses */}
                            <NavigationMenuLink asChild>
                                <Link 
                                  to="/courses"
                                  className="bg-white p-5 rounded-lg flex items-center cursor-pointer border border-black/10 shadow-sm hover:-translate-y-[3px] hover:shadow-md hover:border-black/15 transition-all duration-200 group"
                                >
                                  <div className="w-12 h-12 flex justify-center items-center mr-5 bg-gray-50 rounded-full">
                                    <Globe className="w-6 h-6 text-royal" />
                                  </div>
                                  <div className="text-xl font-medium text-neutral-900">
                                    All Courses
                                  </div>
                                </Link>
                            </NavigationMenuLink>

                            {/* Dynamic Category Cards */}
                            {courseCategories.map((category) => {
                              const style = getCategoryStyle(category);
                              const IconComponent = style.icon;
                              
                              return (
                                <NavigationMenuLink key={category} asChild>
                                  <Link 
                                    to={`/courses?category=${style.slug}`}
                                    className="bg-white p-5 rounded-lg flex items-center cursor-pointer border border-black/10 shadow-sm hover:-translate-y-[3px] hover:shadow-md hover:border-black/15 transition-all duration-200 group"
                                  >
                                    <div className={`w-12 h-12 flex justify-center items-center mr-5 text-3xl ${style.color}`}>
                                      <IconComponent className="w-8 h-8" />
                                    </div>
                                    <div className="text-xl font-medium text-neutral-900">
                                      {style.label}
                                    </div>
                                  </Link>
                                </NavigationMenuLink>
                              );
                            })}
                         </div>
                       )}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Exam Prep Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-royal transition-colors flex items-center bg-transparent hover:bg-transparent p-0 h-auto font-normal text-base">
                  Exam Prep
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link to="/exam-preparation">All Exams</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/exam-preparation/jee">JEE Preparation</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/exam-preparation/neet">NEET Preparation</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/exam-preparation/iitm-bs">IITM BS Preparation</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/career" className="text-gray-700 hover:text-royal transition-colors">
              Career
            </Link>
          </div>

          {/* User Authentication */}
          <div className="hidden md:flex items-center absolute right-0">
            {user ? (
              <div className="flex items-center space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="bg-royal hover:bg-royal-dark text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center absolute right-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-royal focus:outline-none focus:text-royal"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-royal">
                Home
              </Link>
              <Link to="/about" className="block px-3 py-2 text-gray-700 hover:text-royal">
                About
              </Link>
              
              {/* Mobile Courses Section - Dynamic */}
              <div className="block px-3 py-2 text-gray-700 font-medium">
                Courses
              </div>
              <div className="pl-6 space-y-2 mb-2">
                 <Link to="/courses" className="flex items-center text-gray-600 hover:text-royal py-1">
                    <Globe className="w-5 h-5 mr-2" />
                    All Courses
                 </Link>
                 {courseCategories.map((category) => {
                    const style = getCategoryStyle(category);
                    const IconComponent = style.icon;
                    return (
                      <Link 
                        key={category}
                        to={`/courses?category=${style.slug}`}
                        className="flex items-center text-gray-600 hover:text-royal py-1"
                      >
                         <IconComponent className={`w-5 h-5 mr-2 ${style.color}`} />
                         {style.label}
                      </Link>
                    );
                 })}
              </div>

              <Link to="/exam-preparation" className="block px-3 py-2 text-gray-700 hover:text-royal">
                Exam Preparation
              </Link>
              <Link to="/career" className="block px-3 py-2 text-gray-700 hover:text-royal">
                Career
              </Link>
              
              {user ? (
                <>
                  <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-royal">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-royal"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="block px-3 py-2">
                  <Button variant="default" className="w-full bg-royal hover:bg-royal-dark text-white">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
