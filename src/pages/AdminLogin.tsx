import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";
import NavBar from "@/components/NavBar";
import { usePageSEO, SEO_TITLES } from "@/utils/seoManager";

const AdminLogin = () => {
  usePageSEO(SEO_TITLES.ADMIN_LOGIN, "/admin/login");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });

      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
      
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!authLoading && user && isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">Redirecting...</div>;
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4 pt-24 font-['Inter',sans-serif]">
        
        {/* THE MODAL CARD */}
        <div className="bg-white w-full max-w-[420px] rounded-[28px] relative px-6 py-10 text-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all duration-300">
          
          {/* Admin Icon Area */}
          <div className="mb-8 flex justify-center">
             <div className="w-36 h-36 bg-[#fef3c7] flex items-center justify-center [clip-path:polygon(100%_50%,95.11%_65.45%,80.9%_76.94%,65.45%_85.39%,50%_100%,34.55%_85.39%,19.1%_76.94%,4.89%_65.45%,0%_50%,4.89%_34.55%,19.1%_23.06%,34.55%_14.61%,50%_0%,65.45%_14.61%,80.9%_23.06%,95.11%_34.55%)] transform transition-transform duration-300 hover:scale-105">
              <div className="w-12 h-20 bg-royal border-2 border-[#1a1a1a] rounded-lg relative flex items-center justify-center">
                 <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-xl md:text-[21px] font-bold text-[#1a1a1a] text-left mb-6 leading-tight">
            Admin Access <br /> Sign in to continue
          </h2>

          <div className="space-y-4 text-left">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-royal hover:bg-royal-dark h-11 rounded-xl" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="relative my-4">
               <div className="absolute inset-0 flex items-center"><Separator /></div>
               <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or</span></div>
            </div>

            <Button 
              onClick={handleGoogleLogin}
              variant="outline" 
              className="w-full h-11 rounded-xl border-gray-300"
              disabled={isLoading}
            >
              Sign in with Google
            </Button>
            
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-gray-500 hover:underline">Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
