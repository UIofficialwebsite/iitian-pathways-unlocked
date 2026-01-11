import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  X, 
  Atom, 
  Stethoscope, 
  GraduationCap, 
  BookOpen,
  ChevronRight,
  ArrowLeft
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/components/BackendIntegratedWrapper";

const NavBar = () => {
  const { user, signOut } = useAuth();
  const { courses } = useBackend();
  
  // Mobile state management
  const [activePane, setActivePane] = useState<"main" | "courses" | "examprep">("main");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
    if (normalize.includes('jee')) return { icon: Atom, color: "text-[#3B82F6]", slug: 'jee' };
    if (normalize.includes('neet')) return { icon: Stethoscope, color: "text-[#EF4444]", slug: 'neet' };
    if (normalize.includes('iitm') || normalize.includes('bs')) return { icon: GraduationCap, color: "text-[#2ecc71]", slug: 'iitm-bs' };
    return { icon: BookOpen, color: "text-gray-600", slug: category.toLowerCase().replace(/\s+/g, '-') };
  };

  const examPrepItems = [
    { title: "IIT JEE", path: "/exam-preparation/jee", icon: Atom, color: "text-[#3B82F6]" },
    { title: "NEET", path: "/exam-preparation/neet", icon: Stethoscope, color: "text-[#EF4444]" },
    { title: "ESE", path: "/exam-preparation/ese", icon: GraduationCap, color: "text-[#F59E0B]" },
    { title: "GATE", path: "/exam-preparation/gate", icon: Atom, color: "text-[#FCD34D]" },
    { title: "AE/JE", path: "/exam-preparation/ae-je", icon: BookOpen, color: "text-[#3B82F6]" },
    { title: "Olympiad", path: "/exam-preparation/olympiad", icon: GraduationCap, color: "text-[#FBBF24]" }
  ];

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-[150] h-16 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        
        {/* --- DESKTOP LAYOUT (STAYS EXACTLY AS BEFORE) --- */}
        <div className="hidden md:flex justify-between items-center h-full">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-royal transition-colors font-medium font-sans">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-royal transition-colors font-medium font-sans">About</Link>
            
            <NavigationMenu className="static">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-gray-700 hover:text-royal hover:bg-transparent focus:bg-transparent text-base font-medium h-auto p-0 transition-colors font-sans">
                    Courses
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="!fixed !top-16 left-0 right-0 w-full flex justify-center z-[160] !mt-0 bg-transparent border-none shadow-none p-0">
                    <div className="w-[700px] bg-white border border-[#e2e2e2] border-t-0 rounded-b-xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] p-5">
                       <div className="grid grid-cols-2 gap-3">
                          {courseCategories.map((category) => {
                            const style = getCategoryStyle(category);
                            const IconComponent = style.icon;
                            return (
                              <NavigationMenuLink key={category} asChild>
                                <Link to={`/courses/category/${style.slug}`} className="flex items-center gap-4 p-4 bg-white border border-[#e2e2e2] rounded cursor-pointer hover:border-black transition-all">
                                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                    <IconComponent className={`w-full h-full ${style.color}`} />
                                  </div>
                                  <span className="text-base font-semibold text-[#1a1a1a] font-sans">{category}</span>
                                </Link>
                              </NavigationMenuLink>
                            );
                          })}
                       </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
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
                              <Link to={item.path} className="flex items-center gap-4 p-4 bg-white border border-[#e2e2e2] rounded cursor-pointer hover:border-black transition-all">
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
              <Button variant="ghost" onClick={handleSignOut} className="text-red-600 font-sans font-medium">Log out</Button>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-6 font-sans font-medium">Sign In</Button>
              </Link>
            )}
          </div>
        </div>

        {/* --- MOBILE LAYOUT --- */}
        <div className="md:hidden flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if(!open) setActivePane("main"); }}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent">
                  <Menu className="h-7 w-7 text-black" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="w-full max-w-none p-0 flex flex-col z-[250] border-none font-['Inter',sans-serif] bg-white">
                {/* Mobile Header: Logo or Title Replacement */}
                <SheetHeader className="px-5 py-5 flex flex-row items-center border-b border-[#eeeeee] space-y-0 min-h-[73px] bg-white">
                  <div className="flex items-center gap-4">
                    {activePane === "main" ? (
                      <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-9 w-auto" />
                    ) : (
                      <div className="flex items-center gap-3">
                        <button onClick={() => setActivePane("main")} className="text-black">
                          <ArrowLeft className="h-7 w-7 stroke-[2.5]" />
                        </button>
                        <span className="text-[19px] font-bold text-[#1a1a1a]">
                          {activePane === "courses" ? "Courses" : "Exam Preparation"}
                        </span>
                      </div>
                    )}
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                  {/* Pane: Main Navigation List */}
                  {activePane === "main" && (
                    <div className="flex flex-col animate-in slide-in-from-right duration-200">
                      <Link to="/" className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] border-b border-[#f0f0f0]" onClick={() => setIsSheetOpen(false)}>Home</Link>
                      <Link to="/about" className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] border-b border-[#f0f0f0]" onClick={() => setIsSheetOpen(false)}>About Us</Link>
                      <button onClick={() => setActivePane("courses")} className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] flex items-center justify-between border-b border-[#f0f0f0] text-left">
                        All Courses <ChevronRight className="h-4 w-4 text-[#333]" />
                      </button>
                      <button onClick={() => setActivePane("examprep")} className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] flex items-center justify-between border-b border-[#f0f0f0] text-left">
                        Exam Preparation <ChevronRight className="h-4 w-4 text-[#333]" />
                      </button>
                      <Link to="/career" className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] border-b border-[#f0f0f0]" onClick={() => setIsSheetOpen(false)}>Career</Link>
                    </div>
                  )}

                  {/* Pane: Sub-menus (2-Column Rectangular Tabs) */}
                  {(activePane === "courses" || activePane === "examprep") && (
                    <div className="p-5 grid grid-cols-2 gap-4 animate-in slide-in-from-left duration-200">
                      {(activePane === "courses" ? courseCategories : examPrepItems).map((item: any) => {
                        const style = activePane === "courses" ? getCategoryStyle(item) : item;
                        const label = activePane === "courses" ? item : item.title;
                        const path = activePane === "courses" ? `/courses/category/${style.slug}` : item.path;
                        return (
                          <Link key={label} to={path} className="flex items-center gap-3 px-3 py-4 bg-white border border-[#e2e2e2] rounded-[4px] hover:border-black transition-all" onClick={() => setIsSheetOpen(false)}>
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                              <style.icon className={`w-full h-full ${style.color || 'text-black'}`} />
                            </div>
                            <span className="text-[14px] font-semibold text-[#1a1a1a] leading-tight">{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Mobile Bottom Section: Middle Aligned Login/Register */}
                {!user && (
                  <div className="p-6 bg-white border-t border-[#eeeeee] flex justify-center mt-auto">
                    <Link to="/auth" className="w-full flex justify-center" onClick={() => setIsSheetOpen(false)}>
                      <Button className="w-[200px] h-12 bg-[#1d4ed8] hover:bg-[#1d4ed8] text-white rounded-lg text-[16px] font-bold shadow-none">
                        Login/Register
                      </Button>
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>
            
            <Link to="/"><img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-9 w-auto" /></Link>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <Link to="/dashboard">
                <Avatar className="h-9 w-9 border border-gray-100">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="font-bold">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-[#1d4ed8] text-white px-4 h-9 text-sm font-bold">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
