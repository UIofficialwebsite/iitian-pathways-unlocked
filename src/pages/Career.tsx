import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  User, 
  Building, 
  Check, 
  Users, 
  Star, 
  FileText,
  Loader2,
  ArrowRight
} from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Career = () => {
  const { jobs, contentLoading } = useBackend();

  // Filter active jobs with real-time updates - Fix JSON handling
  const openings = jobs.filter(job => job.is_active).map(job => ({
    ...job,
    // Ensure requirements is always an array
    requirements: Array.isArray(job.requirements) ? job.requirements : 
                 typeof job.requirements === 'string' ? [job.requirements] : [],
    // Ensure skills is always an array  
    skills: Array.isArray(job.skills) ? job.skills :
           typeof job.skills === 'string' ? [job.skills] : []
  }));

  // Career email subscription form
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email) {
      setIsSubmitting(true);
      const emailFieldId = "entry.1179165163";
      
      const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLScvl-2m-e6VBprNctakB4a8kzEvaOZCdN-LxTxJ2qGGOKTzZA/formResponse";
      const formUrl = `${baseUrl}?${emailFieldId}=${encodeURIComponent(email)}`;
      
      fetch(formUrl, {
        method: 'POST',
        mode: 'no-cors'
      })
      .then(() => {
        setEmail('');
        setSubscribeSuccess(true);
        setTimeout(() => setSubscribeSuccess(false), 3000);
      })
      .catch(() => {
        alert('An error occurred. Please try again.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
    }
  };

  const [verificationTab, setVerificationTab] = useState<"intern" | "employer">("intern");
  const [empId, setEmpId] = useState("");
  const [empName, setEmpName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<null | { verified: boolean, message: string, details?: any }>(null);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    if (!empId || !empName) {
      setVerificationResult({
        verified: false,
        message: "Please enter both employee ID and name."
      });
      toast({
        title: "Incomplete Information",
        description: "Please enter both employee ID and name.",
        variant: "destructive",
      });
      setVerifying(false);
      return;
    }

    try {
      // Query employee by code and full name
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("employee_code", empId)
        .eq("full_name", empName)
        .maybeSingle();

      if (error) {
        setVerificationResult({
          verified: false,
          message: "Error occurred. Please try again later."
        });
        toast({ title: "Verification Error", description: error.message, variant: "destructive" });
      } else if (!data) {
        setVerificationResult({
          verified: false,
          message: "No records found for the provided ID and name combination."
        });
        toast({
          title: "Verification Failed",
          description: "We couldn't find a match for your credentials.",
          variant: "destructive",
        });
      } else {
        // Show current status and details
        let statusText = "";
        if (data.status === 'active') {
          statusText = "Active";
        } else if (data.status === 'completed') {
          statusText = "Completed";
        } else {
          statusText = "Terminated";
        }

        setVerificationResult({
          verified: true,
          message: data.status === 'active' 
            ? `${data.employee_type === 'intern' ? 'Intern' : 'Employee'} record found. The ${data.employee_type} is currently ACTIVE.` 
            : `${data.employee_type === 'intern' ? 'Intern' : 'Employee'} record found. The ${data.employee_type} status is ${statusText.toUpperCase()}.`,
          details: {
            name: data.full_name,
            employeeId: data.employee_code,
            position: data.position,
            department: data.department,
            employeeType: data.employee_type,
            startDate: data.start_date ? new Date(data.start_date).toLocaleDateString() : "N/A",
            endDate: data.end_date ? new Date(data.end_date).toLocaleDateString() : "N/A",
            status: statusText,
            isActive: data.is_active,
            verificationCertificateUrl: data.verification_certificate_url
          }
        });
        toast({
          title: "Verification Successful",
          description: "Record matched in employee database.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({
        verified: false,
        message: "An unexpected error occurred. Please try again."
      });
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
    
    setVerifying(false);
  };

  const scrollToOpenings = () => {
    const element = document.getElementById("openings");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <NavBar />
      
      <main className="pt-20 bg-white">
        {/* REDESIGNED HERO SECTION */}
        <section className="py-16 lg:py-24 flex justify-center items-center min-h-[85vh] bg-white text-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
            
            {/* Content Side (Left) */}
            <div className="flex-1 w-full md:min-w-[450px] text-left">
              {/* Notice Badge */}
              <div className="inline-flex items-center bg-slate-50 border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium mb-8 tracking-wide">
                <Check className="w-3.5 h-3.5 mr-2 opacity-70" />
                Corporate Announcement — Q1 2026
              </div>

              {/* Headline */}
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.15] mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Architecting the infrastructure of global learning
              </motion.h1>

              {/* Description */}
              <motion.p 
                className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                We are scaling our engineering and product teams to build mission-critical tools for the next generation of educators.
              </motion.p>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button 
                  onClick={scrollToOpenings}
                  className="bg-slate-900 hover:bg-blue-800 text-white px-7 py-6 h-auto rounded-md font-semibold text-base shadow-sm transition-all duration-200"
                >
                  View career opportunities
                </Button>
              </motion.div>
            </div>

            {/* Illustration Side (Right) */}
            <motion.div 
              className="flex-1 w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-full h-[300px] md:h-[420px] bg-slate-50 border border-slate-200 rounded-xl flex justify-center items-center relative overflow-hidden group">
                {/* Background Decoration */}
                <div className="absolute inset-0 w-[150%] h-[150%] -left-1/4 -top-1/4 bg-[radial-gradient(circle_at_70%_30%,rgba(30,64,175,0.03)_0%,transparent_50%)]" />
                
                {/* Visual Placeholder Content */}
                <div className="z-10 text-center">
                    <span className="text-slate-400 text-xs sm:text-sm font-bold uppercase tracking-[2px] block mb-2">
                        Visual Assets Frame
                    </span>
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <Building className="w-8 h-8" />
                    </div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* Current Openings Section */}
        <section id="openings" className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center p-2 bg-royal/10 rounded-full mb-4"
              >
                <Briefcase className="h-6 w-6 text-royal" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-900">Current Openings</h2>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                Explore our latest opportunities and find the perfect role to kickstart or advance your career
              </p>
            </div>

            {contentLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-royal" />
              </div>
            ) : openings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {openings.map((job) => (
                  <motion.div 
                    key={job.id}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col bg-white">
                      <CardHeader className="pb-4 border-b border-slate-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-slate-900">{job.title}</CardTitle>
                            <CardDescription className="mt-1 text-slate-500">{job.company}</CardDescription>
                          </div>
                          <Badge variant={job.job_type === "Remote" ? "outline" : "secondary"} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200">
                            {job.job_type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 flex-grow">
                        <div className="space-y-4">
                          <div className="flex items-center text-sm text-slate-600">
                            <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                            <span>{job.location}</span>
                          </div>
                          {job.stipend && (
                            <div className="flex items-center text-sm text-slate-600">
                              <Briefcase className="h-4 w-4 mr-2 text-slate-400" />
                              <span>{job.stipend}</span>
                            </div>
                          )}
                          {job.duration && (
                            <div className="flex items-center text-sm text-slate-600">
                              <Clock className="h-4 w-4 mr-2 text-slate-400" />
                              <span>{job.duration}</span>
                            </div>
                          )}
                          {job.deadline && (
                            <div className="flex items-center text-sm text-slate-600">
                              <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                              <span>Apply by: {new Date(job.deadline).toLocaleDateString()}</span>
                            </div>
                          )}

                          {job.description && (
                            <div className="pt-2">
                              <p className="text-sm text-slate-600 mb-2 line-clamp-3">{job.description}</p>
                            </div>
                          )}

                          {job.requirements && job.requirements.length > 0 && (
                            <div className="pt-2">
                              <h4 className="text-xs font-semibold text-slate-900 mb-1 uppercase tracking-wide">Requirements:</h4>
                              <ul className="text-xs text-slate-600 list-disc list-inside">
                                {job.requirements.slice(0, 3).map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t border-slate-100 flex justify-between bg-slate-50/50">
                        <ShareButton
                          url={`${window.location.origin}/career?job=${job.id}`}
                          title={job.title}
                          description={`${job.company} - ${job.location}`}
                        />
                        <Button asChild className="bg-slate-900 hover:bg-blue-800 text-white">
                          <a href={job.application_url || '#'} target="_blank" rel="noopener noreferrer">Apply Now</a>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-lg text-slate-600">No open positions at the moment. Please check back later!</p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <p className="text-slate-600 mb-4">Get notified when new positions open up</p>
              
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="font-medium text-slate-900 mb-4">Subscribe for Job Updates</h3>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-grow border-slate-300 focus:ring-slate-400"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </Button>
                </form>
                {subscribeSuccess && (
                  <p className="text-green-600 mt-2 text-sm">Successfully subscribed!</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Join UI Section */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-4xl mx-auto"
              >
                <h2 className="text-4xl font-bold mb-6 text-slate-900">
                  Join Unknown IITians!
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Unknown IITians is a platform dedicated to providing high-quality educational content to help students and freshers succeed in their careers. We also offer opportunities for internships and hiring positions directly through our platform. All hirings for Unknown IITians will be posted here, with notifications sent out to those who have filled out the required forms.
                </p>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Once you complete the form, you will receive an email with further details about the interview process and the next steps. Our goal is to help you gain practical experience, develop your skills, and build a strong foundation for your future career.
                </p>
                <Button onClick={scrollToOpenings} className="bg-royal hover:bg-royal-dark text-white px-8 py-6 text-lg shadow-lg shadow-royal/20">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Work at UI Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">Why work at Unknown IITians</h2>
              <p className="mt-4 text-xl text-royal font-semibold">
                Earn Today, Build Tomorrow, Succeed Forever
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[
                {
                  title: "A Platform for Growth",
                  description: "Our company is built on helping individuals discover and unlock their full potential. Working with us means you'll be part of a community that values personal development, career advancement, and success.",
                  icon: GraduationCap
                },
                {
                  title: "Earn While You Learn",
                  description: "College students often look for ways to manage their expenses, and our internships offer the perfect solution. You can earn money while gaining hands-on experience and making progress toward your career goals.",
                  icon: Star
                },
                {
                  title: "No Middlemen",
                  description: "At Unknown IITians, we don't act as a mediator. You get direct access to internship openings based on your skills and interests. If you have the required skills, you can join and begin your journey without delays.",
                  icon: Users
                },
                {
                  title: "A Stepping Stone",
                  description: "An internship with Unknown IITians is more than just a learning experience; it's a chance to set the foundation for your future career. You'll gain insights into the industry, develop a strong work ethic, and build a network.",
                  icon: Briefcase
                },
                {
                  title: "No Experience? No Problem!",
                  description: "You don't need to have extensive experience to get started. We welcome students with basic skills who are eager to learn and grow. The internships we offer are a perfect starting point to build your knowledge.",
                  icon: User
                },
                {
                  title: "Paid Opportunities",
                  description: "Once you've completed the training and feel confident in your abilities, you can directly apply for paid internships and roles. Unknown IITians helps bridge the gap between learning and earning.",
                  icon: Building
                }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center text-center p-8 rounded-xl bg-slate-50 border border-slate-100 hover:border-royal/20 hover:shadow-lg transition-all duration-300"
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="rounded-full bg-white p-4 mb-6 shadow-sm border border-slate-100">
                    <item.icon className="h-8 w-8 text-royal" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Make Remarkable Change */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-slate-900">How do we make remarkable change?</h2>
              <p className="max-w-3xl mx-auto text-lg text-slate-600">
                Unknown IITians creates remarkable change in the educational field by offering students the opportunity to earn while they learn. We provide skill-building resources, paid internships, and real-world experiences that empower students.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-14 relative overflow-hidden border border-slate-200">
              <div className="absolute top-0 right-0 w-64 h-64 bg-royal/5 rounded-full -mt-32 -mr-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-royal/5 rounded-full -mb-32 -ml-32 blur-3xl"></div>
              
              <div className="relative">
                <blockquote className="text-xl md:text-2xl text-slate-800 italic font-medium text-center mb-8 leading-relaxed">
                  "Don't just think about placement; think about building your own empire. Success isn't limited to your degree—it begins with the growth you nurture today. Train yourself, work on your skills, and create something great, because true success comes from starting now, not after your studies."
                </blockquote>
                
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-bold text-lg text-slate-900">Anonymous</p>
                    <p className="text-slate-500">Founder, Unknown IITians</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Employee Verification Section */}
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center p-2 bg-royal/10 rounded-full mb-4"
              >
                <FileText className="h-6 w-6 text-royal" />
              </motion.div>
              <h2 className="text-3xl font-bold text-slate-900">Employee Verification</h2>
              <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                Verify employment status and role at Unknown IITians
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="shadow-xl border border-slate-200">
                <CardHeader className="bg-slate-50 border-b border-slate-200">
                  <CardTitle className="text-2xl font-bold text-slate-900">Verification Portal</CardTitle>
                  <CardDescription className="text-slate-500">
                    Verify credentials for interns and employees who have worked with Unknown IITians
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <Tabs 
                    defaultValue="intern" 
                    value={verificationTab}
                    onValueChange={(value) => setVerificationTab(value as "intern" | "employer")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1">
                      <TabsTrigger value="intern" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">For Interns</TabsTrigger>
                      <TabsTrigger value="employer" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">For Employers</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="intern">
                      <form onSubmit={handleVerify} className="space-y-5">
                        <div className="space-y-2">
                          <label htmlFor="empId" className="block text-sm font-medium text-slate-700">
                            Employee ID
                          </label>
                          <Input 
                            id="empId" 
                            placeholder="Enter your Employee ID (e.g., UI12345)" 
                            value={empId}
                            onChange={(e) => setEmpId(e.target.value)}
                            required
                            className="border-slate-300 focus:ring-royal focus:border-royal"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="empName" className="block text-sm font-medium text-slate-700">
                            Full Name
                          </label>
                          <Input 
                            id="empName" 
                            placeholder="Enter your full name as registered" 
                            value={empName}
                            onChange={(e) => setEmpName(e.target.value)}
                            required
                            className="border-slate-300 focus:ring-royal focus:border-royal"
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-royal hover:bg-royal-dark text-white py-6"
                          disabled={verifying}
                        >
                          {verifying ? "Verifying..." : "Verify Credentials"}
                        </Button>
                      </form>
                      
                      {verificationResult && (
                        <div className={`mt-8 p-5 rounded-lg border ${
                          verificationResult.verified 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center mb-3">
                            {verificationResult.verified ? (
                              <Check className="h-5 w-5 text-green-600 mr-2" />
                            ) : (
                              <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            <h3 className={`text-sm font-semibold ${
                              verificationResult.verified ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {verificationResult.verified ? 'Verification Successful' : 'Verification Failed'}
                            </h3>
                          </div>
                          
                          <p className={`text-sm ${
                            verificationResult.verified ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {verificationResult.message}
                          </p>
                          
                          {verificationResult.verified && verificationResult.details && (
                            <div className="mt-5 space-y-3">
                              <h4 className="font-semibold text-slate-900 text-sm">Employment Details:</h4>
                              <div className="bg-white rounded-md p-4 border border-green-100 shadow-sm">
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-slate-600">Name:</span>
                                    <span className="text-slate-900 font-medium">{verificationResult.details.name}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-slate-600">Employee ID:</span>
                                    <span className="text-slate-900 font-mono">{verificationResult.details.employeeId}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-slate-600">Position:</span>
                                    <span className="text-slate-900">{verificationResult.details.position}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-gray-100 pb-2">
                                    <span className="font-medium text-slate-600">Department:</span>
                                    <span className="text-slate-900">{verificationResult.details.department}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-slate-600">Status:</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      verificationResult.details.status === 'Active'
                                        ? 'bg-green-100 text-green-800'
                                        : verificationResult.details.status === 'Completed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {verificationResult.details.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="employer">
                      <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                          <p className="text-blue-800 text-sm">
                            For employers looking to verify employment status of a candidate, please email your request to verification@unknowniitians.com
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-slate-900">Required Information:</h4>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                            <li>Your company name and contact details</li>
                            <li>Candidate's name and Employee ID (if available)</li>
                            <li>Purpose of verification</li>
                            <li>Your relation to the candidate</li>
                            </ul>
                        </div>
                        
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                          Contact Verification Team
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <EmailPopup />
    </>
  );
};

export default Career;
