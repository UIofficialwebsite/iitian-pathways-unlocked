import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
// Uses the Hybrid GoogleAuth component (Client Popup -> Supabase Session)
import GoogleAuth from "@/components/auth/GoogleAuth";
import { useDocumentTitle, SEO_TITLES } from "@/utils/seoManager";

const StudentLogin = () => {
  useDocumentTitle(SEO_TITLES.STUDENT_LOGIN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [examType, setExamType] = useState("");
  const [branch, setBranch] = useState("");
  const [level, setLevel] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper to handle navigation
  const checkProfileAndNavigate = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', userId)
        .single();
      
      const returnUrl = localStorage.getItem('auth_return_url');

      if (!profile || !profile.full_name || !profile.phone) {
        navigate("/profile/complete");
      } else if (returnUrl) {
        localStorage.removeItem('auth_return_url');
        navigate(returnUrl);
      } else {
        navigate("/");
      }
    } catch (error) {
      navigate("/profile/complete");
    }
  };

  // --- HYBRID SUCCESS HANDLER ---
  const onGoogleSuccess = async () => {
    // 1. GoogleAuth has already called signInWithIdToken.
    // 2. We verify the session exists in Supabase.
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // 3. Navigate based on profile status
        await checkProfileAndNavigate(user.id);
    } else {
        // Fallback if something went wrong
        navigate("/");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data: existingUsers, error: checkError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', email.toLowerCase())
          .limit(1);
          
        if (checkError) throw checkError;
        
        if (existingUsers && existingUsers.length > 0) {
          toast({
            title: "Email already registered",
            description: "Please use a different email or login with your existing account",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const userMetadata: any = { exam: examType };
        if (examType === 'IITM-BS') {
          userMetadata.branch = branch;
          userMetadata.level = level;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: userMetadata }
        });
        
        if (error) throw error;

        toast({
          title: "Registration successful!",
          description: "Please check your email for verification.",
        });
        navigate("/profile/complete");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;

        toast({
          title: "Login successful!",
          description: "Welcome back!",
        });
        
        if (data.user) {
          await checkProfileAndNavigate(data.user.id);
        }
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Registration failed" : "Login failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4 pt-24 font-['Inter',sans-serif]">
        
        <div className="bg-white w-full max-w-[420px] rounded-[28px] relative px-6 py-10 text-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all duration-300">
          
          <div className="mb-8 flex justify-center">
            <div className="w-36 h-36 bg-[#fef3c7] flex items-center justify-center [clip-path:polygon(100%_50%,95.11%_65.45%,80.9%_76.94%,65.45%_85.39%,50%_100%,34.55%_85.39%,19.1%_76.94%,4.89%_65.45%,0%_50%,4.89%_34.55%,19.1%_23.06%,34.55%_14.61%,50%_0%,65.45%_14.61%,80.9%_23.06%,95.11%_34.55%)] transform transition-transform duration-300 hover:scale-105">
              <div className="w-12 h-20 bg-white border-2 border-[#1a1a1a] rounded-lg relative flex items-center justify-center">
                <div className="absolute top-1.5 w-4 h-1 bg-[#1a1a1a] rounded-sm" />
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[9px] text-white font-bold">PW</div>
              </div>
            </div>
          </div>

          <h2 className="text-xl md:text-[21px] font-bold text-[#1a1a1a] text-left mb-6 leading-tight">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </h2>

          <div className="space-y-4 text-left">
            
            {/* GOOGLE AUTH CONTAINER */}
            <div className="w-full flex justify-center py-1">
                <GoogleAuth 
                    isLoading={isLoading} 
                    setIsLoading={setIsLoading} 
                    onSuccess={onGoogleSuccess}
                />
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
            
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  className="h-11 rounded-xl"
                />
              </div>

              {isSignUp && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="exam">Preparing for</Label>
                    <Select value={examType} onValueChange={setExamType} required>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select exam type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JEE">JEE (Engineering)</SelectItem>
                        <SelectItem value="NEET">NEET (Medical)</SelectItem>
                        <SelectItem value="IITM-BS">IIT Madras BS Degree</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {examType === 'IITM-BS' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={branch} onValueChange={setBranch} required>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="data-science">BS Data Science</SelectItem>
                            <SelectItem value="electronic-systems">BS Electronic Systems</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level">Level</Label>
                        <Select value={level} onValueChange={setLevel} required>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="qualifier">Qualifier</SelectItem>
                            <SelectItem value="foundation">Foundation</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="degree">Degree</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full bg-royal hover:bg-royal-dark h-11 rounded-xl" disabled={isLoading}>
                {isLoading ? "Processing..." : (isSignUp ? "Sign Up" : "Sign in / Register")}
              </Button>
            </form>
          </div>

          <div className="mt-8 text-sm text-center">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button 
              className="ml-1 text-[#1d4ed8] font-semibold hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>

          <div className="mt-8 text-[13px] text-[#717171] leading-relaxed">
            By continuing you agree to our <br />
            <Link to="/terms" className="text-[#0284c7] font-semibold hover:underline">Terms of use</Link> & <Link to="/privacy" className="text-[#0284c7] font-semibold hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentLogin;
