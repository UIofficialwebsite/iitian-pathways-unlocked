import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  X, 
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

  const examPrepItems = [
    { title: "JEE Preparation", path: "/exam-preparation/jee", icon: Atom, color: "text-[#f39c12]" },
    { title: "NEET Preparation", path: "/exam-preparation/neet", icon: Stethoscope, color: "text-[#e74c3c]" },
    { title: "IITM BS Preparation", path: "/exam-preparation/iitm-bs", icon: GraduationCap, color: "text-[#2ecc71]" }
  ];

  return (
    <>
      <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-[150] h-16 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          {/* Desktop Layout */}
          <div className="hidden md:flex justify-between items-center h-full">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-10 w-auto" />
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-royal transition-colors font-medium font-sans">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-royal transition-colors font-medium font-sans">About</Link>
              
              {/* Courses Menu */}
              <NavigationMenu className="static">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-royal hover:bg-transparent focus:bg-transparent text-base font-medium h-auto p-0 transition-colors font-sans">
                      Courses
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="!fixed !top-16 left-0 right-0 w-full flex justify-center z-[160] !mt-0 bg-transparent border-none shadow-none p-0">
                      <div className="w-[700px] bg-white border border-[#e2e2e2] border-t-0 rounded-b-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] p-5">
                         {courseCategories.length === 0 ? (
                           <div className="text-center p-4 text-gray-500 font-medium font-sans">No active batches available.</div>
                         ) : (
                           <div className="grid grid-cols-2 gap-3">
                              {courseCategories.map((category) => {
                                const style = getCategoryStyle(category);
                                const IconComponent = style.icon;
                                return (
                                  <NavigationMenuLink key={category} asChild>
                                    <Link 
                                      to={`/courses/category/${style.slug}`}
                                      className="flex items-center gap-4 p-4 bg-white border border-[#e2e2e2] rounded cursor-pointer hover:border-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] transition-all duration-200"
                                    >
                                      <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                        <IconComponent className={`w-full h-full ${style.color}`} />
                                      </div>
                                      <span className="text-base font-semibold text-[#1a1a1a] font-sans">{category}</span>
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
              
              {/* Exam Prep Menu */}
              <NavigationMenu className="static">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-royal hover:bg-transparent focus:bg-transparent text-base font-medium h-auto p-0 transition-colors font-sans">
                      Exam Prep
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="!fixed !top-16 left-0 right-0 w-full flex justify-center z-[160] !mt-0 bg-transparent border-none shadow-none p-0">
                      <div className="w-[700px] bg-white border border-[#e2e2e2] border-t-0 rounded-b-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] p-5">
                         <div className="grid grid-cols-2 gap-3">
                            {examPrepItems.map((item) => (
                              <NavigationMenuLink key={item.path} asChild>
                                <Link 
                                  to={item.path}
                                  className="flex items-center gap-4 p-4 bg-white border border-[#e2e2e2] rounded cursor-pointer hover:border-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] transition-all duration-200"
                                >
                                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                    <item.icon className={`w-full h-full ${item.color}`} />
                                  </div>
                                  <span className="text-base font-semibold text-[#1a1a1a] font-sans">{item.title}</span>
                                </Link>
                              </NavigationMenuLink>
                            ))}
                         </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <Link to="/career" className="text-gray-700 hover:text-royal transition-colors font-medium font-sans">Career</Link>
            </div>

            <div className="flex items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-gray-100 p-0 focus-visible:ring-0">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="font-sans">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2 z-[200] bg-white" align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold font-sans">{user.user_metadata?.full_name || 'User'}</span>
                        <span className="text-xs text-muted-foreground font-sans">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="font-sans"><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 font-sans">Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button className="bg-royal hover:bg-royal-dark text-white px-6 font-sans font-medium">Sign In</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Layout: Hamburger Left, Logo Center, Login Right */}
          <div className="md:hidden flex items-center justify-between h-full">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-9 w-auto" />
            </Link>
            
            <div>
              {user ? (
                <Link to="/dashboard">
                  <Avatar className="h-8 w-8 border-2 border-gray-100">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs font-sans">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="bg-royal hover:bg-royal-dark text-white px-4 py-1 h-8 text-sm font-sans font-medium">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slide-in Panel */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[140] bg-black/50" onClick={() => setIsOpen(false)}>
          <div 
            className="fixed top-16 left-0 h-[calc(100vh-64px)] w-72 bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col py-4">
              <Link 
                to="/" 
                className="px-6 py-3 text-gray-800 hover:bg-gray-50 font-medium font-sans text-base"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="px-6 py-3 text-gray-800 hover:bg-gray-50 font-medium font-sans text-base"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              
              {/* Courses Section */}
              <div className="px-6 py-3 text-gray-500 text-xs uppercase tracking-wider font-sans font-semibold">
                Courses
              </div>
              {courseCategories.map((category) => {
                const style = getCategoryStyle(category);
                const IconComponent = style.icon;
                return (
                  <Link 
                    key={category}
                    to={`/courses/category/${style.slug}`}
                    className="px-6 py-3 text-gray-800 hover:bg-gray-50 font-medium font-sans text-base flex items-center gap-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <IconComponent className={`h-5 w-5 ${style.color}`} />
                    {category}
                  </Link>
                );
              })}
              
              {/* Exam Prep Section */}
              <div className="px-6 py-3 text-gray-500 text-xs uppercase tracking-wider font-sans font-semibold mt-2">
                Exam Preparation
              </div>
              {examPrepItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  className="px-6 py-3 text-gray-800 hover:bg-gray-50 font-medium font-sans text-base flex items-center gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  {item.title}
                </Link>
              ))}
              
              <Link 
                to="/career" 
                className="px-6 py-3 text-gray-800 hover:bg-gray-50 font-medium font-sans text-base mt-2"
                onClick={() => setIsOpen(false)}
              >
                Career
              </Link>
              
              {user && (
                <>
                  <div className="border-t border-gray-200 my-3"></div>
                  <Link 
                    to="/dashboard" 
                    className="px-6 py-3 text-gray-800 hover:bg-gray-50 font-medium font-sans text-base"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="px-6 py-3 text-red-600 hover:bg-red-50 font-medium font-sans text-base text-left"
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
