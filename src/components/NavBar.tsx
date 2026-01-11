import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Atom, 
  Stethoscope, 
  GraduationCap, 
  BookOpen 
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
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-royal hover:bg-transparent focus:bg-transparent text-base font-medium h-auto p-0 transition-colors">
                    Courses
                  </NavigationMenuTrigger>
                  
                  {/* Dropdown Container: High Z-index, perfectly centered below navbar */}
                  <NavigationMenuContent className="fixed top-16 left-1/2 -translate-x-1/2 z-[110] mt-0 bg-transparent border-none shadow-none">
                    <div className="w-[850px] bg-white border border-gray-200 rounded-md shadow-2xl p-8 transform transition-all">
                       {courseCategories.length === 0 ? (
                         <div className="text-center p-4 text-gray-500">No active batches available.</div>
                       ) : (
                         <div className="grid grid-cols-2 gap-4">
                            {courseCategories.map((category) => {
                              const style = getCategoryStyle(category);
                              const IconComponent = style.icon;
                              return (
                                <NavigationMenuLink key={category} asChild>
                                  <Link 
                                    to={`/courses/category/${style.slug}`}
                                    className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-sm hover:border-black hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                                  >
                                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                      <IconComponent className={`w-8 h-8 ${style.color}`} />
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
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-gray-100 p-0">
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

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sidebar-style */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white z-[90] overflow-y-auto">
            <div className="px-4 py-6 space-y-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="block text-lg font-medium border-b pb-2">Home</Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="block text-lg font-medium border-b pb-2">About</Link>
              
              <div className="space-y-3">
                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Courses</span>
                <div className="grid grid-cols-1 gap-2 pl-2">
                  {courseCategories.map((category) => {
                    const style = getCategoryStyle(category);
                    const IconComponent = style.icon;
                    return (
                      <Link 
                        key={category}
                        to={`/courses/category/${style.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center p-3 rounded-lg bg-gray-50 active:bg-gray-100"
                      >
                        <IconComponent className={`w-6 h-6 mr-3 ${style.color}`} />
                        <span className="font-medium">{category}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link to="/exam-preparation" onClick={() => setIsOpen(false)} className="block text-lg font-medium border-b pb-2">Exam Preparation</Link>
              <Link to="/career" onClick={() => setIsOpen(false)} className="block text-lg font-medium border-b pb-2">Career</Link>
              
              {!user && (
                <Link to="/auth" onClick={() => setIsOpen(false)} className="block pt-4">
                  <Button className="w-full bg-royal text-white py-6 text-lg">Sign In</Button>
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
