import React, { useState } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

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
          <div className="hidden md:flex items-center justify-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-royal transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-royal transition-colors">
              About
            </Link>
            <Link to="/courses" className="text-gray-700 hover:text-royal transition-colors">
              Courses
            </Link>

            {/* Exam Prep Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-royal transition-colors flex items-center">
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

            <Link to="/iitm-bs-tools" className="text-gray-700 hover:text-royal transition-colors">
              IITM BS Tools
            </Link>
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
                <Button variant="signin" className="bg-royal hover:bg-royal-dark text-white">
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
              <Link to="/courses" className="block px-3 py-2 text-gray-700 hover:text-royal">
                Courses
              </Link>
              <Link to="/exam-preparation" className="block px-3 py-2 text-gray-700 hover:text-royal">
                Exam Preparation
              </Link>
              <Link to="/exam-preparation/jee" className="block px-3 py-2 text-gray-700 hover:text-royal ml-4">
                JEE Prep
              </Link>
              <Link to="/exam-preparation/neet" className="block px-3 py-2 text-gray-700 hover:text-royal ml-4">
                NEET Prep
              </Link>
              <Link to="/exam-preparation/iitm-bs" className="block px-3 py-2 text-gray-700 hover:text-royal ml-4">
                IITM BS Prep
              </Link>
               <Link to="/iitm-bs-tools" className="block px-3 py-2 text-gray-700 hover:text-royal">
                IITM BS Tools
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
                  <Button variant="signin" className="w-full bg-royal hover:bg-royal-dark text-white">
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
