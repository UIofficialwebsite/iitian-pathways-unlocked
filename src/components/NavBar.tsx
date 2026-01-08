import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
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

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  // Inject FontAwesome for the specific icons requested
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Data for the Courses Dropdown Grid
  const courseCards = [
    {
      label: "IIT JEE",
      iconClass: "fa-solid fa-atom",
      colorClass: "text-[#f39c12]", // Orange/Yellow
      link: "/courses?category=jee"
    },
    {
      label: "NEET",
      iconClass: "fa-solid fa-hand-holding-medical",
      colorClass: "text-[#e74c3c]", // Red
      link: "/courses?category=neet"
    },
    {
      label: "ESE",
      iconClass: "fa-solid fa-helmet-safety",
      colorClass: "text-[#3498db]", // Blue
      link: "/courses?category=ese"
    },
    {
      label: "GATE",
      iconClass: "fa-solid fa-lightbulb",
      colorClass: "text-[#f1c40f]", // Yellow
      link: "/courses?category=gate"
    },
    {
      label: "AE/JE",
      iconClass: "fa-solid fa-laptop-code",
      colorClass: "text-[#2ecc71]", // Green
      link: "/courses?category=ae-je"
    },
    {
      label: "Olympiad",
      iconClass: "fa-solid fa-award",
      colorClass: "text-[#e67e22]", // Orange
      link: "/courses?category=olympiad"
    }
  ];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 relative">
          {/* Logo - positioned on the left side of center group */}
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
            
            {/* Courses Navigation Menu (Hover Trigger) */}
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
                       <div className="grid grid-cols-2 gap-6">
                          {courseCards.map((card, index) => (
                            <NavigationMenuLink key={index} asChild>
                              <Link 
                                to={card.link}
                                className="bg-white p-5 rounded-lg flex items-center cursor-pointer border border-black/10 shadow-sm hover:-translate-y-[3px] hover:shadow-md hover:border-black/15 transition-all duration-200 group"
                              >
                                <div className={`w-12 h-12 flex justify-center items-center mr-5 text-3xl ${card.colorClass}`}>
                                  <i className={card.iconClass}></i>
                                </div>
                                <div className="text-xl font-medium text-neutral-900">
                                  {card.label}
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          ))}
                       </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Exam Prep Dropdown (Standard Click) */}
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

          {/* User Authentication - positioned on the right side */}
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
              
              {/* Mobile Courses Section */}
              <div className="block px-3 py-2 text-gray-700 font-medium">
                Courses
              </div>
              <div className="pl-6 space-y-2 mb-2">
                {courseCards.map((card) => (
                  <Link 
                    key={card.label}
                    to={card.link}
                    className="flex items-center text-gray-600 hover:text-royal py-1"
                  >
                     <i className={`${card.iconClass} w-6 text-center mr-2 ${card.colorClass}`}></i>
                     {card.label}
                  </Link>
                ))}
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
