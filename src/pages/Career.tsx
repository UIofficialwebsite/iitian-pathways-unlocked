import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Briefcase, 
  Building, 
  Check, 
  FileText,
  Search,
  ChevronDown,
  Plus,
  Bookmark,
  Loader2
} from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Career = () => {
  const { jobs, contentLoading } = useBackend();

  // Filter active jobs
  const openings = jobs.filter(job => job.is_active).map(job => ({
    ...job,
    requirements: Array.isArray(job.requirements) ? job.requirements : 
                 typeof job.requirements === 'string' ? [job.requirements] : [],
    skills: Array.isArray(job.skills) ? job.skills :
           typeof job.skills === 'string' ? [job.skills] : []
  }));

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
      
      <main className="pt-20 bg-white min-h-screen font-sans text-slate-900">
        
        {/* HERO SECTION - Corporate Announcement Style */}
        <section className="py-16 lg:py-24 flex justify-center items-center bg-white text-slate-900 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
            
            {/* Content Side */}
            <div className="flex-1 w-full md:min-w-[450px] text-left">
              <div className="inline-flex items-center bg-slate-50 border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium mb-8 tracking-wide">
                <Check className="w-3.5 h-3.5 mr-2 opacity-70" />
                Corporate Announcement — Q1 2026
              </div>

              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.15] mb-6 tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Architecting the infrastructure of global learning
              </motion.h1>

              <motion.p 
                className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                We are scaling our engineering and product teams to build mission-critical tools for the next generation of educators.
              </motion.p>

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

            {/* Illustration Side */}
            <motion.div 
              className="flex-1 w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-full h-[300px] md:h-[420px] bg-slate-50 border border-slate-200 rounded-xl flex justify-center items-center relative overflow-hidden group">
                <div className="absolute inset-0 w-[150%] h-[150%] -left-1/4 -top-1/4 bg-[radial-gradient(circle_at_70%_30%,rgba(30,64,175,0.03)_0%,transparent_50%)]" />
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

        {/* NEW JOB BOARD INTERFACE SECTION */}
        <section id="openings" className="bg-white pb-24">
          
          {/* Abstract Header Background */}
          <div className="h-[200px] w-full bg-gradient-to-br from-[#f0f4c3] via-[#d1e3ff] to-[#f3e5f5] relative overflow-hidden">
             {/* Optional decorative shapes could go here if implemented with SVG/CSS */}
          </div>

          {/* Main Content Container (Overlapping Header) */}
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 relative z-10 -mt-10">
            
            {/* Search Bar */}
            <div className="relative w-full mb-10 shadow-sm">
              <input 
                type="text" 
                className="w-full py-4 pl-5 pr-14 border border-slate-200 rounded-lg text-[15px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-slate-700 placeholder:text-slate-400"
                placeholder="Search by role, department or location"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
            </div>

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl font-medium text-slate-800">
                {openings.length} {openings.length === 1 ? 'Open job' : 'Open jobs'} available
              </h2>
              
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
                Newest First
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
              
              {/* Sidebar Filters */}
              <div className="hidden lg:block space-y-4">
                <p className="text-sm font-semibold text-slate-600 mb-4">Filters</p>
                
                <div className="bg-white border border-slate-200 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-200 transition-colors group">
                  <span className="text-sm text-slate-700 font-medium">Department</span>
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:border-blue-200 transition-colors group">
                  <span className="text-sm text-slate-700 font-medium">Location</span>
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </div>
              </div>

              {/* Job Listings Content */}
              <div className="space-y-5">
                {contentLoading ? (
                   <div className="flex justify-center items-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                     <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                   </div>
                ) : openings.length > 0 ? (
                  openings.map((job) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                    >
                      <h3 className="text-xl font-medium text-slate-900 mb-3">{job.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 opacity-70" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 opacity-70" />
                          <span>{job.job_type || 'Full Time'}</span>
                        </div>
                        {job.company && (
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 opacity-70" />
                            <span>{job.company}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <Button 
                          asChild
                          className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 font-medium px-6 py-2 h-auto rounded-md transition-all duration-200"
                        >
                          <a href={job.application_url || '#'} target="_blank" rel="noopener noreferrer">
                            View and Apply
                          </a>
                        </Button>
                        <button className="p-2.5 rounded-md border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all">
                          <Bookmark className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No open positions found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Employee Verification Section */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-2 bg-white border border-slate-200 rounded-full mb-4 shadow-sm">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Employee Verification</h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                Verify employment status and role at Unknown IITians
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="shadow-lg border-0 bg-white overflow-hidden ring-1 ring-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8 pt-8">
                  <CardTitle className="text-2xl font-bold text-slate-900 text-center">Verification Portal</CardTitle>
                  <CardDescription className="text-center text-slate-500 mt-2">
                    Enter credentials to verify intern or employee records
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 px-8 pb-8">
                  <Tabs 
                    defaultValue="intern" 
                    value={verificationTab}
                    onValueChange={(value) => setVerificationTab(value as "intern" | "employer")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-lg">
                      <TabsTrigger 
                        value="intern" 
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                      >
                        For Interns
                      </TabsTrigger>
                      <TabsTrigger 
                        value="employer" 
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all"
                      >
                        For Employers
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="intern" className="focus-visible:outline-none">
                      <form onSubmit={handleVerify} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label htmlFor="empId" className="block text-sm font-medium text-slate-700">
                              Employee ID
                            </label>
                            <Input 
                              id="empId" 
                              placeholder="e.g., UI12345" 
                              value={empId}
                              onChange={(e) => setEmpId(e.target.value)}
                              required
                              className="border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label htmlFor="empName" className="block text-sm font-medium text-slate-700">
                              Full Name
                            </label>
                            <Input 
                              id="empName" 
                              placeholder="Name as registered" 
                              value={empName}
                              onChange={(e) => setEmpName(e.target.value)}
                              required
                              className="border-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            />
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-slate-900 hover:bg-blue-800 text-white py-6 mt-2"
                          disabled={verifying}
                        >
                          {verifying ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                            </>
                          ) : "Verify Credentials"}
                        </Button>
                      </form>
                      
                      {verificationResult && (
                        <div className={`mt-8 p-5 rounded-lg border ${
                          verificationResult.verified 
                            ? 'bg-green-50/50 border-green-200' 
                            : 'bg-red-50/50 border-red-200'
                        }`}>
                          <div className="flex items-center mb-2">
                            {verificationResult.verified ? (
                              <Check className="h-5 w-5 text-green-600 mr-2" />
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
                                <span className="text-red-500 font-bold text-xs">!</span>
                              </div>
                            )}
                            <h3 className={`text-sm font-semibold ${
                              verificationResult.verified ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {verificationResult.verified ? 'Verification Successful' : 'Verification Failed'}
                            </h3>
                          </div>
                          
                          <p className={`text-sm mb-4 ${
                            verificationResult.verified ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {verificationResult.message}
                          </p>
                          
                          {verificationResult.verified && verificationResult.details && (
                            <div className="bg-white rounded-md p-4 border border-green-100 shadow-sm text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Name:</span>
                                <span className="text-slate-900 font-medium">{verificationResult.details.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">ID:</span>
                                <span className="text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{verificationResult.details.employeeId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Position:</span>
                                <span className="text-slate-900">{verificationResult.details.position}</span>
                              </div>
                              <div className="flex justify-between border-t border-slate-100 pt-2 mt-2">
                                <span className="text-slate-500">Status:</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  verificationResult.details.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {verificationResult.details.status}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="employer" className="focus-visible:outline-none">
                      <div className="space-y-6 pt-2">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                          <p className="text-blue-800 text-sm leading-relaxed">
                            For employers looking to verify employment status of a candidate, please email your official request to <span className="font-semibold">verification@unknowniitians.com</span>
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900">Required Information:</h4>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600 marker:text-blue-400">
                              <li>Your company name and contact details</li>
                              <li>Candidate's name and Employee ID (if available)</li>
                              <li>Purpose of verification</li>
                              <li>Your professional relation to the candidate</li>
                            </ul>
                        </div>
                        
                        <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 mt-2">
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
