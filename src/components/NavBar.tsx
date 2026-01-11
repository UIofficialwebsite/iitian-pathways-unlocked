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
  
  // State for mobile multi-pane navigation
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

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) setActivePane("main");
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-[150] h-16 font-['Inter',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        
        {/* DESKTOP VIEW */}
        <div className="hidden md:flex justify-between items-center h-full">
          <Link to="/" className="flex-shrink-0">
            <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-[#1a1a1a] hover:text-[#1d4ed8] font-medium">Home</Link>
            <Link to="/about" className="text-[#1a1a1a] hover:text-[#1d4ed8] font-medium">About</Link>
            <Link to="/career" className="text-[#1a1a1a] hover:text-[#1d4ed8] font-medium">Career</Link>
          </div>
          <div className="flex items-center">
            {!user ? (
              <Link to="/auth">
                <Button className="bg-[#1d4ed8] text-white px-6 font-semibold rounded-lg">Sign In</Button>
              </Link>
            ) : (
              <Button variant="ghost" onClick={handleSignOut} className="text-red-600 font-medium">Log out</Button>
            )}
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent">
                  <Menu className="h-7 w-7 text-black" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="w-full max-w-none p-0 flex flex-col z-[250] border-none font-['Inter',sans-serif] bg-white">
                {/* HEADER: Dynamic Section Name Replacement */}
                <SheetHeader className="px-5 py-5 flex flex-row items-center justify-between border-b border-[#eeeeee] space-y-0 min-h-[73px]">
                  <div className="flex items-center gap-4">
                    {activePane === "main" ? (
                      <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-9 w-auto" />
                    ) : (
                      <>
                        <button onClick={() => setActivePane("main")} className="text-black">
                          <ArrowLeft className="h-7 w-7 stroke-[2.5]" />
                        </button>
                        <span className="text-[19px] font-bold text-[#1a1a1a]">
                          {activePane === "courses" ? "Courses" : "Exam Preparation"}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* LARGE CLOSE ICON - Correctly aligned */}
                  <SheetClose asChild>
                    <button className="text-black outline-none p-1">
                      <X className="h-8 w-8 stroke-[2.5]" />
                    </button>
                  </SheetClose>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                  {/* MAIN NAVIGATION LIST */}
                  {activePane === "main" && (
                    <div className="flex flex-col animate-in slide-in-from-right duration-200">
                      <Link to="/" className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] border-b border-[#f0f0f0]" onClick={() => setIsSheetOpen(false)}>Home</Link>
                      <Link to="/about" className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] border-b border-[#f0f0f0]" onClick={() => setIsSheetOpen(false)}>About Us</Link>
                      
                      <button 
                        onClick={() => setActivePane("courses")} 
                        className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] flex items-center justify-between border-b border-[#f0f0f0] text-left"
                      >
                        All Courses <ChevronRight className="h-4 w-4 text-[#333] stroke-[2.5]" />
                      </button>

                      <button 
                        onClick={() => setActivePane("examprep")} 
                        className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] flex items-center justify-between border-b border-[#f0f0f0] text-left"
                      >
                        Exam Preparation <ChevronRight className="h-4 w-4 text-[#333] stroke-[2.5]" />
                      </button>

                      <Link to="/career" className="px-5 py-5 text-[16px] font-medium text-[#1a1a1a] border-b border-[#f0f0f0]" onClick={() => setIsSheetOpen(false)}>Career</Link>
                      
                      {/* LOGIN/REGISTER BUTTON - Integrated into main list and centered */}
                      {!user && (
                        <div className="px-5 py-8 mt-auto flex justify-center">
                          <Link to="/auth" onClick={() => setIsSheetOpen(false)} className="w-full flex justify-center">
                            <Button className="w-[200px] h-12 bg-[#1d4ed8] hover:bg-[#1d4ed8] text-white rounded-lg text-[16px] font-bold shadow-none border-none">
                              Login/Register
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUB-MENU TABS - White background with rectangular grid */}
                  {(activePane === "courses" || activePane === "examprep") && (
                    <div className="p-5 grid grid-cols-2 gap-4 animate-in slide-in-from-left duration-200">
                      {(activePane === "courses" ? courseCategories : examPrepItems).map((item: any) => {
                        const style = activePane === "courses" ? getCategoryStyle(item) : item;
                        const label = activePane === "courses" ? item : item.title;
                        const path = activePane === "courses" ? `/courses/category/${style.slug}` : style.path;
                        const IconComponent = style.icon;

                        return (
                          <Link 
                            key={label}
                            to={path}
                            className="flex items-center gap-4 px-4 py-4 bg-white border border-[#e2e2e2] rounded-[4px] hover:border-black transition-all"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                              <IconComponent className={`w-full h-full ${style.color || 'text-black'}`} />
                            </div>
                            <span className="text-[15px] font-semibold text-[#1a1a1a] leading-tight">{label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/">
              <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-9 w-auto" />
            </Link>
          </div>
          
          <div>
            {user ? (
              <Link to="/dashboard">
                <Avatar className="h-9 w-9 border border-gray-100">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="font-bold">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-[#1d4ed8] text-white px-4 h-9 text-sm font-bold">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
