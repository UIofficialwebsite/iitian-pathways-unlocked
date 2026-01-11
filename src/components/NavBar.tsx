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
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/components/BackendIntegratedWrapper";

const NavBar = () => {
  const { user, signOut } = useAuth();
  const { courses } = useBackend();
  
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
    { title: "JEE Prep", path: "/exam-preparation/jee", icon: Atom, color: "text-[#f39c12]" },
    { title: "NEET Prep", path: "/exam-preparation/neet", icon: Stethoscope, color: "text-[#e74c3c]" },
    { title: "IITM BS", path: "/exam-preparation/iitm-bs", icon: GraduationCap, color: "text-[#2ecc71]" }
  ];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-[150] h-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        
        {/* DESKTOP VIEW */}
        <div className="hidden md:flex justify-between items-center h-full">
          <Link to="/" className="flex-shrink-0">
            <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-royal font-medium">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-royal font-medium">About</Link>
            <Link to="/career" className="text-gray-700 hover:text-royal font-medium">Career</Link>
          </div>
          <div className="flex items-center">
            {!user ? (
              <Link to="/auth"><Button className="bg-[#1d4ed8] text-white px-6">Sign In</Button></Link>
            ) : (
              <Button variant="ghost" onClick={handleSignOut} className="text-red-600">Log out</Button>
            )}
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <Sheet open={isSheetOpen} onOpenChange={(open) => { setIsSheetOpen(open); if(!open) setActivePane("main"); }}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-0 hover:bg-transparent"><Menu className="h-7 w-7" /></Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="w-full max-w-none p-0 flex flex-col z-[250] border-none font-sans">
                {/* DYNAMIC HEADER */}
                <SheetHeader className="px-5 py-5 flex flex-row items-center border-b border-[#eeeeee] space-y-0 min-h-[73px]">
                  {activePane === "main" ? (
                    <img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-9 w-auto" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setActivePane("main")} className="text-black">
                        <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
                      </button>
                      <span className="text-[19px] font-bold text-black">
                        {activePane === "courses" ? "Courses" : "Exam Prep"}
                      </span>
                    </div>
                  )}
                  {/* Shadcn default close 'X' is automatically in the top-right and properly sized */}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto bg-white">
                  {/* MAIN MENU PANE */}
                  {activePane === "main" && (
                    <div className="flex flex-col animate-in slide-in-from-right duration-200">
                      <Link to="/" className="px-6 py-6 text-[17px] font-semibold border-b border-[#f2f2f2]" onClick={() => setIsSheetOpen(false)}>Home</Link>
                      <Link to="/about" className="px-6 py-6 text-[17px] font-semibold border-b border-[#f2f2f2]" onClick={() => setIsSheetOpen(false)}>About Us</Link>
                      
                      <button onClick={() => setActivePane("courses")} className="px-6 py-6 text-[17px] font-semibold flex items-center justify-between border-b border-[#f2f2f2]">
                        Courses <ChevronRight className="h-5 w-5 text-[#444] stroke-[2.5]" />
                      </button>

                      <button onClick={() => setActivePane("examprep")} className="px-6 py-6 text-[17px] font-semibold flex items-center justify-between border-b border-[#f2f2f2]">
                        Exam Preparation <ChevronRight className="h-5 w-5 text-[#444] stroke-[2.5]" />
                      </button>

                      <Link to="/career" className="px-6 py-6 text-[17px] font-semibold border-b border-[#f2f2f2]" onClick={() => setIsSheetOpen(false)}>Career</Link>
                      
                      {/* LOGIN/REGISTER BUTTON INSIDE SCROLLABLE LIST */}
                      {!user && (
                        <div className="p-6">
                          <Drawer>
                            <DrawerTrigger asChild>
                              <Button className="w-[200px] h-12 bg-[#1d4ed8] text-white rounded-xl text-base font-bold shadow-none">
                                Login/Register
                              </Button>
                            </DrawerTrigger>
                            <DrawerContent className="rounded-t-[32px] border-t-0 p-0 overflow-hidden">
                              <div className="bg-white p-6 pb-12">
                                <DrawerHeader className="p-0 mb-6">
                                  <DrawerTitle className="text-2xl font-bold">Welcome Back</DrawerTitle>
                                </DrawerHeader>
                                {/* Login Form / Options would go here */}
                                <div className="space-y-4">
                                   <Link to="/auth" onClick={() => setIsSheetOpen(false)}>
                                      <Button className="w-full h-14 bg-[#1d4ed8] text-white rounded-2xl text-lg font-bold">Continue to Sign In</Button>
                                   </Link>
                                </div>
                              </div>
                            </DrawerContent>
                          </Drawer>
                        </div>
                      )}
                    </div>
                  )}

                  {/* COURSES GRID PANE (2-column layout) */}
                  {activePane === "courses" && (
                    <div className="p-4 grid grid-cols-2 gap-3 animate-in slide-in-from-left duration-200">
                      {courseCategories.map((category) => {
                        const style = getCategoryStyle(category);
                        return (
                          <Link 
                            key={category}
                            to={`/courses/category/${style.slug}`}
                            className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-[#e2e2e2] rounded-xl text-center"
                            onClick={() => setIsSheetOpen(false)}
                          >
                            <style.icon className={`h-8 w-8 ${style.color}`} />
                            <span className="text-sm font-bold text-[#1a1a1a]">{category}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* EXAM PREP GRID PANE */}
                  {activePane === "examprep" && (
                    <div className="p-4 grid grid-cols-2 gap-3 animate-in slide-in-from-left duration-200">
                      {examPrepItems.map((item) => (
                        <Link 
                          key={item.path}
                          to={item.path}
                          className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-[#e2e2e2] rounded-xl text-center"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <item.icon className={`h-8 w-8 ${item.color}`} />
                          <span className="text-sm font-bold text-[#1a1a1a]">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/"><img src="/lovable-uploads/UI_logo.png" alt="Logo" className="h-9 w-auto" /></Link>
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
              <Link to="/auth"><Button size="sm" className="bg-[#1d4ed8] text-white px-4 h-9 text-sm font-bold">Login</Button></Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
