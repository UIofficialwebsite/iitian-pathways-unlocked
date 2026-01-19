import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, LogIn, User, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmailAuth from "@/components/auth/EmailAuth";
import GoogleAuth from "@/components/auth/GoogleAuth";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Job Portal", path: "/career-opportunities" },
    { name: "Contact", path: "/#contact" },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Helper component for the Login Modal Content
  const LoginPopupContent = () => (
    <div className="flex flex-col gap-6 py-2 px-2">
      <div className="flex flex-col space-y-2 text-center">
        {/* Hidden Title for Accessibility/Screen Readers */}
        <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900">
          Welcome Back
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500">
          Enter your email to sign in to your account
        </DialogDescription>
      </div>

      <div className="grid gap-6">
        <GoogleAuth />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        <EmailAuth />
      </div>

      <p className="px-8 text-center text-xs text-gray-500 mt-4">
        By clicking continue, you agree to our{" "}
        <Link 
          to="/terms" 
          onClick={() => setIsLoginModalOpen(false)} 
          className="underline underline-offset-4 hover:text-royal text-gray-700"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link 
          to="/privacy-policy" 
          onClick={() => setIsLoginModalOpen(false)} 
          className="underline underline-offset-4 hover:text-royal text-gray-700"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-[5000] border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LOGO SECTION --- */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
            <div className="relative overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105">
              <img 
                src="/lovable-uploads/UI_logo.png" 
                alt="Logo" 
                className="h-9 w-auto md:h-10 object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg md:text-xl tracking-tight text-royal leading-none group-hover:text-royal-light transition-colors">
                IITIANS PATHWAY
              </span>
              <span className="text-[10px] md:text-[11px] font-medium text-gray-500 tracking-wider uppercase">
                Unlock Your Potential
              </span>
            </div>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 
                  ${location.pathname === link.path 
                    ? "text-royal bg-royal/5 font-semibold" 
                    : "text-gray-600 hover:text-royal hover:bg-gray-50"
                  }`}
              >
                {link.name}
              </Link>
            ))}

            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-10 w-10 rounded-full border border-gray-200 hover:border-royal/30 transition-all focus:ring-2 focus:ring-royal/20"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-royal/10 text-royal font-bold">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 p-2">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-900">My Account</p>
                        <p className="text-xs leading-none text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem 
                      onClick={() => navigate("/dashboard")}
                      className="cursor-pointer gap-2 focus:bg-royal/5 focus:text-royal"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate("/dashboard/profile")}
                      className="cursor-pointer gap-2 focus:bg-royal/5 focus:text-royal"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-royal hover:bg-royal-light text-white px-6 py-2 shadow-sm hover:shadow-md transition-all duration-200 font-semibold"
                    >
                      Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[420px] bg-white p-0 gap-0 overflow-hidden rounded-xl border-none shadow-2xl">
                     {/* Decorative Header Bar */}
                     <div className="h-2 w-full bg-gradient-to-r from-royal via-purple-600 to-royal-light" />
                     <div className="p-6 md:p-8">
                        <LoginPopupContent />
                     </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* --- MOBILE MENU BUTTON --- */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-royal hover:bg-royal/5 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-lg animate-in slide-in-from-top-5 duration-200 z-40">
          <div className="px-4 py-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-royal bg-royal/5"
                    : "text-gray-600 hover:text-royal hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="pt-4 mt-4 border-t border-gray-100">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 mb-4">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-royal/10 text-royal font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">My Account</span>
                      <span className="text-xs text-gray-500 truncate max-w-[200px]">{user.email}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 h-11 text-gray-700 border-gray-200"
                    onClick={() => {
                      navigate("/dashboard");
                      setIsOpen(false);
                    }}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2 h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Button>
                </div>
              ) : (
                // For Mobile, we usually redirect to page rather than popup for better UX,
                // but you can use the Dialog here too if preferred. 
                // Currently set to redirect to standard /login page for mobile simplicity.
                <Button 
                  className="w-full bg-royal hover:bg-royal-light text-white h-11 font-semibold text-base shadow-sm"
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                >
                  Log In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
