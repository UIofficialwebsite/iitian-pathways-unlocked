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
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/components/BackendIntegratedWrapper";

const NavBar = () => {
  const { user, signOut } = useAuth();
  const { courses } = useBackend();
  
  // State for mobile drill-down navigation
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

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) setActivePane("main"); // Reset to main list when closed
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-[150] h-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        
        {/* DESKTOP VIEW */}
        <div className="hidden md:flex justify-between items-center h-full">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-10 w-auto" />
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-royal transition-colors font-medium">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-royal transition-colors font-medium">About</Link>
            <Link to="/career" className="text-gray-700 hover:text-royal transition-colors font-medium">Career</Link>
          </div>
          <div className="flex items-center">
            {!user ? (
              <Link to="/auth">
                <Button className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-6 font-sans font-medium">Sign In</Button>
              </Link>
            ) : (
              <Button variant="ghost" onClick={handleSignOut} className="text-red-600 font-sans">Log out</Button>
            )}
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-700 p-0 hover:bg-transparent">
                  <Menu className="h-7 w-7" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="w-full max-w-none p-0 flex flex-col z-[250] border-none font-sans">
                {/* DYNAMIC HEADER: Replaces Logo with Section Name on Drill-down */}
                <SheetHeader className="px-5 py-5 flex flex-row items-center border-b border-[#eeeeee] space-y-0 min-h-[73px]">
                  {activePane === "main" ? (
                    <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-9 w-auto" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <button onClick={() => setActivePane("main")} className="text-[#1d4ed8]">
                        <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
                      </button>
                      <span className="text-[19px] font-bold text-[#1a1a1a]">
                        {activePane === "courses" ? "Courses" : "Exam Preparation"}
                      </span>
                    </div>
                  )}
                  {/* Shadcn's default close 'X' button is handled automatically here */}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-white">
                  {/* --- PANE 1: MAIN MENU --- */}
                  {activePane === "main" && (
                    <div className="flex flex-col animate-in slide-in-from-right duration-200">
                      <Link to="/" className="px-6 py-6 text-[17px] font-semibold text-[#1a1a1a] border-b border-[#f2f2f2]" onClick={() => setIsSheetOpen(false)}>Home</Link>
                      <Link to="/about" className="px-6 py-6 text-[17px] font-semibold text-[#1a1a1a] border-b border-[#f2f2f2]" onClick={() => setIsSheetOpen(false)}>About Us</Link>
                      
                      <button 
                        onClick={() => setActivePane("courses")}
                        className="px-6 py-6 text-[17px] font-semibold text-[#1a1a1a] flex items-center justify-between border-b border-[#f2f2f2] text-left"
                      >
                        Courses <ChevronRight className="h-5 w-5 text-[#444] stroke-[2.5]" />
                      </button>

                      <button 
                        onClick={() => setActivePane("examprep")}
                        className="px-6 py-6 text-[17px] font-semibold text-[#1a1a1a] flex items-center justify-between border-b border-[#f2f2f2] text-left"
                      >
                        Exam Preparation <ChevronRight className="h-5 w-5 text-[#444] stroke-[2.5]" />
                      </button>

                      <Link to="/career" className="px-6 py-6 text-[17px] font-semibold text-[#1a1a1a] border-b border-[#f2f2f2]" onClick={() => setIsSheetOpen(false)}>Career</Link>
                    </div>
                  )}

                  {/* --- PANE 2: COURSES SECTION (Tabs) --- */}
                  {activePane === "courses" && (
                    <div className="flex flex-col animate-in slide-in-from-left duration-200">
                      {courseCategories.map((category) => {
                        const style = getCategoryStyle(category);
                        return (
                          <Link 
                            key={category}
                            to={`/courses/category/${style.slug}`}
                            className="px-6 py-6 text-[17px] font-semibold text-[#1a1a1a] flex items-center gap-4 border-b border-[#f2f2f2]"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            <style.icon className={`h-6 w-6 ${style.color}`} />
                            {category}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* --- PANE 3: EXAM PREP SECTION (Tabs) --- */}
                  {activePane === "examprep" && (
                    <div className="flex flex-col animate-in slide-in-from-left duration-200">
                      {examPrepItems.map((item) => (
                        <Link 
                          key={item.path}
                          to={item.path}
                          className="px-6 py-6 text-[17px] font-semibold text-[#1a1a1a] flex items-center gap-4 border-b border-[#f2f2f2]"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <item.icon className={`h-6 w-6 ${item.color}`} />
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with Deep Blue Button */}
                <footer className="px-5 py-8 bg-white border-t border-[#f2f2f2] mt-auto">
                  {!user ? (
                    <Link to="/auth" onClick={() => setIsSheetOpen(false)}>
                      <Button className="w-full py-7 bg-[#1d4ed8] hover:bg-[#1d4ed8] text-white rounded-xl text-[17px] font-bold shadow-none transition-none font-sans">
                        Login/Register
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      onClick={handleSignOut}
                      className="w-full py-7 bg-[#1d4ed8] hover:bg-[#1d4ed8] text-white rounded-xl text-[17px] font-bold shadow-none transition-none font-sans"
                    >
                      Log out
                    </Button>
                  )}
                </footer>
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
                  <AvatarFallback className="font-sans font-bold">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white px-4 h-9 text-sm font-bold font-sans">
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
