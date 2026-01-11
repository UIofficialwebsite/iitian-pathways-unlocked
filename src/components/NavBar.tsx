import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Atom, 
  Stethoscope, 
  GraduationCap, 
  BookOpen,
  ChevronRight
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
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { courses } = useBackend();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

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

  const getCategoryStyle = (category: string) => {
    const normalize = category.toLowerCase();
    if (normalize.includes('jee')) return { icon: Atom, color: "text-[#f39c12]", slug: 'jee' };
    if (normalize.includes('neet')) return { icon: Stethoscope, color: "text-[#e74c3c]", slug: 'neet' };
    if (normalize.includes('iitm') || normalize.includes('bs')) return { icon: GraduationCap, color: "text-[#2ecc71]", slug: 'iitm-bs' };
    return { icon: BookOpen, color: "text-gray-600", slug: category.toLowerCase().replace(/\s+/g, '-') };
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-[100] h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full relative">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="/lovable-uploads/UI_logo.png" 
                alt="Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-royal transition-colors font-medium">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-royal transition-colors font-medium">About</Link>
            
            <NavigationMenu className="static">
              <NavigationMenuList className="static">
                <NavigationMenuItem className="static">
                  <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-royal hover:bg-transparent focus:bg-transparent text-base font-medium h-auto p-0 transition-colors">
                    Courses
                  </NavigationMenuTrigger>
                  
                  {/* Dropdown Box: Centered below navbar, High Z-Index */}
                  <NavigationMenuContent className="fixed top-[64px] left-1/2 -translate-x-1/2 z-[110] bg-transparent border-none shadow-none mt-0">
                    <div className="w-[850px] bg-white border border-[#e2e2e2] rounded-[4px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] p-[28px]">
                       {courseCategories.length === 0 ? (
                         <div className="text-center p-4 text-gray-500 font-medium">No active batches available.</div>
                       ) : (
                         <div className="grid grid-cols-2 gap-[16px]">
                            {courseCategories.map((category) => {
                              const style = getCategoryStyle(category);
                              const IconComponent = style.icon;
                              return (
                                <NavigationMenuLink key={category} asChild>
                                  <Link 
                                    to={`/courses/category/${style.slug}`}
                                    className="flex items-center gap-[16px] p-[16px_20px] bg-white border border-[#e2e2e2] rounded-[4px] cursor-pointer hover:border-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] transition-all duration-200 group"
                                  >
                                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                      <IconComponent className={`w-full h-full ${style.color}`} />
                                    </div>
                                    <span className="text-[17px] font-semibold text-[#1a1a1a]">{category}</span>
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
            
            <Link to="/exam-preparation" className="text-gray-700 hover:text-royal transition-colors font-medium">Exam Prep</Link>
            <Link to="/career" className="text-gray-700 hover:text-royal transition-colors font-medium">Career</Link>
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-gray-100 p-0 focus-visible:ring-0">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.user_metadata?.full_name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="bg-royal hover:bg-royal-dark text-white px-6">Sign In</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2 focus:outline-none">
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Navigation */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white z-[90] overflow-y-auto border-t">
            <div className="px-6 py-8 space-y-6">
              <Link to="/" onClick={() => setIsOpen(false)} className="block text-xl font-semibold text-gray-800">Home</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="block text-xl font-semibold text-gray-800">About</Link>
              
              {/* Mobile Courses with Click-to-Expand Arrow */}
              <div className="space-y-4">
                <button 
                  onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                  className="flex items-center justify-between w-full text-xl font-semibold text-gray-800"
                >
                  Courses
                  <ChevronRight className={`h-6 w-6 transition-transform duration-200 ${mobileCoursesOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {mobileCoursesOpen && (
                  <div className="grid grid-cols-1 gap-3 pl-4">
                    {courseCategories.map((category) => {
                      const style = getCategoryStyle(category);
                      const IconComponent = style.icon;
                      return (
                        <Link 
                          key={category}
                          to={`/courses/category/${style.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center p-4 rounded-xl bg-gray-50 border border-gray-100"
                        >
                          <IconComponent className={`w-7 h-7 mr-4 ${style.color}`} />
                          <span className="font-bold text-gray-900">{category}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link to="/exam-preparation" onClick={() => setIsOpen(false)} className="block text-xl font-semibold text-gray-800">Exam Preparation</Link>
              <Link to="/career" onClick={() => setIsOpen(false)} className="block text-xl font-semibold text-gray-800">Career</Link>
              
              {!user && (
                <Link to="/auth" onClick={() => setIsOpen(false)} className="block pt-6">
                  <Button className="w-full bg-royal text-white py-7 text-xl rounded-xl">Sign In</Button>
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
