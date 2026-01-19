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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import GoogleAuth from "@/components/auth/GoogleAuth";
import { useIsMobile } from "@/hooks/use-mobile";

// --- LOGIN POPUP COMPONENT ---
const LoginPopupContent = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    // [CHANGED] Added overflow-y-auto for zoom safety and h-full to fill the container
    <div className="bg-white w-full h-full flex flex-col font-sans px-4 pb-6 overflow-y-auto no-scrollbar">
      
      {/* Centered Content Block */}
      {/* [CHANGED] min-h-0 allows flex child to shrink properly on zoom */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[480px] mx-auto py-6">
        
        {/* Image Section */}
        <div className="mb-6 flex justify-center w-full shrink-0">
          <img 
            src="https://i.ibb.co/5xS7gRxq/image-removebg-preview-1-1.png" 
            alt="Login Illustration" 
            // [CHANGED] Reduced desktop height (md:h-[220px]) to keep it "less big"
            className="h-[180px] md:h-[220px] w-auto object-contain" 
          />
        </div>

        {/* Heading Row with PILL ICON */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 w-full shrink-0">
            <h2 className="text-[22px] md:text-[26px] font-bold text-black/80 font-sans leading-tight text-center">
              Sign in / Register to continue
            </h2>
            
            {/* The Pill Icon Implementation */}
            <div className="flex items-center justify-center gap-[4px] px-4 py-2 bg-[#FFE082] border-[1.5px] border-[#4a4a4a] rounded-full cursor-default shadow-sm shrink-0">
                <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
                <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
                <div className="w-[6px] h-[6px] bg-white rounded-full"></div>
            </div>
        </div>

        {/* Auth Buttons Area */}
        <div className="w-full space-y-4 px-2 sm:px-4 shrink-0">
          <GoogleAuth isLoading={isLoading} setIsLoading={setIsLoading} />
        </div>
      </div>

      {/* Footer */}
      {/* [CHANGED] Text size adjusted for mobile (text-[10px]) to prevent bad wrapping */}
      <div className="mt-auto pt-4 text-center text-[10px] xs:text-[11px] sm:text-[13px] text-[#717171] leading-tight border-t border-gray-100/50 shrink-0">
        By continuing you agree to our <Link to="/terms" className="text-[#0284c7] font-semibold hover:underline">Terms of use</Link> & <Link to="/privacy" className="text-[#0284c7] font-semibold hover:underline">Privacy Policy</Link>
      </div>
    </div>
  );
};

const NavBar = () => {
  const { user, signOut } = useAuth();
  const { courses } = useBackend();
  const isMobile = useIsMobile();
  
  const [activePane, setActivePane] = useState<"main" | "courses" | "examprep">("main");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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
    { title: "IITM BS", path: "/exam-preparation/iitm-bs", icon: GraduationCap, color: "text-[#2ecc71]" }
  ];

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-[10000] h-16 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        
        {/* --- DESKTOP LAYOUT --- */}
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
                  <NavigationMenuContent className="!fixed !top-16 left-0 right-0 w-full flex justify-center z-[10001] !mt-0 bg-transparent border-none shadow-none p-0">
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
                  <NavigationMenuContent className="!fixed !top-16 left-0 right-0 w-full flex justify-center z-[10001] !mt-0 bg-transparent border-none shadow-none p-0">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-9 w-9 border border-gray-200 cursor-pointer hover:ring-2 hover:ring-[#1d4ed8] transition-all">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="font-bold bg-[#1d4ed8] text-white">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white z-[10002]">
                  <DropdownMenuLabel className="font-normal text-sm text-gray-500 truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer font-medium">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer font-medium">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // RESPONSIVE LOGIN MODAL
              isMobile ? (
                <Drawer open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DrawerTrigger asChild>
                    <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-6 font-sans font-medium">Sign In/Register</Button>
                  </DrawerTrigger>
                  <DrawerContent>
                     {/* Mobile Drawer Content */}
                     <LoginPopupContent />
                  </DrawerContent>
                </Drawer>
              ) : (
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-6 font-sans font-medium">Sign In/Register</Button>
                  </DialogTrigger>
                  <DialogContent 
                    className="data-[state=open]:slide-in-from-bottom-[50%] data-[state=closed]:slide-out-to-bottom-[50%] data-[state=open]:slide-in-from-top-auto data-[state=closed]:slide-out-to-top-auto transition-all duration-500 max-h-[90vh]"
                  >
                    <LoginPopupContent />
                  </DialogContent>
                </Dialog>
              )
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
              
              <SheetContent side="left" className="w-full max-w-none p-0 flex flex-col z-[10001] border-none font-['Inter',sans-serif] bg-white">
                <SheetHeader className="px-5 py-5 flex flex-row items-center justify-between border-b border-[#eeeeee] space-y-0 min-h-[73px] bg-white">
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
                  <SheetClose asChild>
                    <button className="text-black p-1"><X className="h-8 w-8 stroke-[2.5]" /></button>
                  </SheetClose>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-white flex flex-col">
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

                {!user && (
                  <div className="p-6 bg-white border-t border-[#eeeeee] flex justify-center mt-auto">
                    <div className="w-full flex justify-center">
                       <Button 
                         onClick={() => {
                            setIsSheetOpen(false); // Close menu
                            setTimeout(() => setIsLoginOpen(true), 150); // Open login
                         }}
                         className="w-[200px] h-12 bg-[#1d4ed8] hover:bg-[#1d4ed8] text-white rounded-lg text-[16px] font-bold shadow-none"
                       >
                         Login/Register
                       </Button>
                    </div>
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
               <Button 
                 size="sm" 
                 onClick={() => setIsLoginOpen(true)}
                 className="bg-[#1d4ed8] text-white px-4 h-9 text-sm font-bold"
                >
                 Login/Register
               </Button>
            )}
            
            {/* INVISIBLE MOBILE DRAWER (Controlled by State) */}
            {isMobile && (
               <Drawer open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DrawerContent>
                     <LoginPopupContent />
                  </DrawerContent>
               </Drawer>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
