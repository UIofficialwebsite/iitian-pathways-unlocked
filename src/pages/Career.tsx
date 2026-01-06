import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import EmailPopup from "@/components/EmailPopup";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Briefcase, 
  Check, 
  FileText,
  Search,
  ChevronDown,
  Plus,
  Bookmark,
  Loader2,
  Clock,
  ArrowLeft,
  Filter
} from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Career = () => {
  const { jobs, contentLoading } = useBackend();
  const [showJobBoard, setShowJobBoard] = useState(false);

  // --- Data Preparation ---
  // Filter and map jobs from the backend
  const openings = jobs.filter(job => job.is_active).map(job => ({
    ...job,
    requirements: Array.isArray(job.requirements) ? job.requirements : 
                 typeof job.requirements === 'string' ? [job.requirements] : [],
    skills: Array.isArray(job.skills) ? job.skills :
           typeof job.skills === 'string' ? [job.skills] : []
  }));

  // --- Verification State Logic ---
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
      setVerificationResult({ verified: false, message: "Please enter both employee ID and name." });
      toast({ title: "Incomplete Information", description: "Please enter both employee ID and name.", variant: "destructive" });
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
        setVerificationResult({ verified: false, message: "Error occurred. Please try again later." });
        toast({ title: "Verification Error", description: error.message, variant: "destructive" });
      } else if (!data) {
        setVerificationResult({ verified: false, message: "No records found for the provided ID and name combination." });
        toast({ title: "Verification Failed", description: "We couldn't find a match for your credentials.", variant: "destructive" });
      } else {
        let statusText = data.status === 'active' ? "Active" : data.status === 'completed' ? "Completed" : "Terminated";
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
            status: statusText,
          }
        });
        toast({ title: "Verification Successful", description: "Record matched in employee database.", variant: "default" });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult({ verified: false, message: "An unexpected error occurred." });
    }
    setVerifying(false);
  };

  return (
    <>
      <NavBar />
      
      <main className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-16">
        <AnimatePresence mode="wait">
          {!showJobBoard ? (
            /* --- INITIAL VIEW: TRIGGER BLOCK --- */
            <motion.div 
              key="trigger-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-[85vh] flex flex-col justify-center items-center px-4"
            >
              {/* The Round Rectangular Block */}
              <div 
                onClick={() => setShowJobBoard(true)}
                className="group relative w-full max-w-[400px] h-[250px] bg-white rounded-[32px] shadow-xl hover:shadow-2xl cursor-pointer border border-slate-100 flex flex-col items-center justify-center transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Subtle Gradient Background Blob */}
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-5 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">View Opportunities</h2>
                  <p className="text-slate-500 font-medium group-hover:text-blue-600 transition-colors">
                    Explore active listings
                  </p>
                </div>

                {/* Arrow Hint */}
                <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-blue-500">
                   <ChevronDown className="w-5 h-5 animate-bounce" />
                </div>
              </div>

              {/* Employee Verification Section (Passed via Props) */}
              <div className="mt-20 w-full max-w-4xl opacity-80 hover:opacity-100 transition-opacity">
                 <EmployeeVerificationSection 
                   verificationTab={verificationTab} 
                   setVerificationTab={setVerificationTab}
                   handleVerify={handleVerify}
                   empId={empId} setEmpId={setEmpId}
                   empName={empName} setEmpName={setEmpName}
                   verifying={verifying}
                   verificationResult={verificationResult}
                 />
              </div>
            </motion.div>
          ) : (
            /* --- SUB PAGE: JOB BOARD INTERFACE --- */
            <motion.div 
              key="board-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white min-h-screen pb-20"
            >
              {/* Back Button */}
              <div className="fixed top-24 left-6 z-50">
                <Button 
                   variant="outline" 
                   onClick={() => setShowJobBoard(false)}
                   className="bg-white/90 backdrop-blur shadow-sm hover:bg-slate-100 border-slate-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </div>

              {/* Header Background */}
              <div className="h-[240px] w-full bg-[linear-gradient(135deg,#f0f4c3_0%,#d1e3ff_50%,#f3e5f5_100%)] relative overflow-hidden" />

              <div className="max-w-[1100px] mx-auto px-4 sm:px-6 relative z-10 -mt-16">
                
                {/* Search Bar */}
                <div className="relative w-full mb-10 shadow-lg rounded-xl">
                  <input 
                    type="text" 
                    className="w-full py-5 pl-6 pr-14 bg-white border border-slate-200 rounded-xl text-[16px] outline-none focus:ring-4 focus:ring-blue-100/50 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                    placeholder="Search by role, department or location"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                </div>

                {/* Results Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h1 className="text-3xl font-semibold text-slate-800 tracking-tight">
                    {openings.length} {openings.length === 1 ? 'Open job' : 'Open jobs'} available
                  </h1>
                  
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                    Newest First
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">
                  
                  {/* Sidebar Filters */}
                  <div className="hidden lg:block space-y-4">
                    <div className="flex items-center gap-2 mb-2 text-slate-500 font-semibold text-sm uppercase tracking-wider">
                      <Filter className="w-4 h-4" /> Filters
                    </div>
                    
                    {['Department', 'Location', 'Job Type'].map((filter) => (
                      <div key={filter} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group">
                        <span className="text-[15px] text-slate-700 font-medium">{filter}</span>
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                      </div>
                    ))}
                  </div>

                  {/* Job Listings Content */}
                  <div className="space-y-6">
                    {contentLoading ? (
                       <div className="flex justify-center py-20">
                         <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                       </div>
                    ) : openings.length > 0 ? (
                      openings.map((job) => (
                        <div
                          key={job.id}
                          className="group bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                                  {job.title}
                                </h3>
                                {job.is_featured && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide mb-2">
                                        Featured
                                    </span>
                                )}
                            </div>
                            <div className="hidden sm:flex gap-3">
                                <Button 
                                  onClick={() => window.open(job.application_url, '_blank')}
                                  className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 font-medium px-5"
                                >
                                  View and Apply
                                </Button>
                                <button className="p-2.5 rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-colors">
                                  <Bookmark className="w-5 h-5" />
                                </button>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mb-6 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-slate-400" />
                              <span>{job.job_type}</span>
                            </div>
                            {job.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>{job.duration}</span>
                              </div>
                            )}
                          </div>

                          {job.stipend && (
                            <div className="mb-6 inline-block bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                                <span className="text-slate-900 font-semibold text-sm">💰 {job.stipend}</span>
                            </div>
                          )}

                          <div className="sm:hidden flex gap-3 mt-4">
                            <Button 
                              onClick={() => window.open(job.application_url, '_blank')}
                              className="w-full bg-blue-600 text-white hover:bg-blue-700"
                            >
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No active openings</h3>
                        <p className="text-slate-500">Check back later for new opportunities.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
      <EmailPopup />
    </>
  );
};

// --- Extracted Component for Cleanliness ---
const EmployeeVerificationSection = ({ 
    verificationTab, setVerificationTab, handleVerify, empId, setEmpId, empName, setEmpName, verifying, verificationResult 
}: any) => {
    return (
        <section className="py-12 border-t border-slate-200/60 mt-12 mx-4 sm:mx-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <Card className="shadow-sm border-slate-200 bg-white">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-6 pt-6">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <CardTitle className="text-xl font-bold text-slate-800">Employee Verification</CardTitle>
                  </div>
                  <CardDescription className="text-center text-slate-500">
                    Verify status for Unknown IITians staff and interns
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-6">
                  <Tabs 
                    defaultValue="intern" 
                    value={verificationTab}
                    onValueChange={(value) => setVerificationTab(value as "intern" | "employer")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-lg">
                      <TabsTrigger value="intern" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">For Interns</TabsTrigger>
                      <TabsTrigger value="employer" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">For Employers</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="intern">
                      <form onSubmit={handleVerify} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Employee ID</label>
                            <Input value={empId} onChange={(e) => setEmpId(e.target.value)} placeholder="e.g., UI12345" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <Input value={empName} onChange={(e) => setEmpName(e.target.value)} placeholder="Name as registered" required />
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={verifying}>
                          {verifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Verify Credentials"}
                        </Button>
                      </form>
                      
                      {verificationResult && (
                        <div className={`mt-6 p-4 rounded-lg border text-sm ${verificationResult.verified ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                          <div className="flex items-start gap-2">
                            {verificationResult.verified ? <Check className="h-5 w-5 text-green-600 shrink-0" /> : <span className="h-5 w-5 flex items-center justify-center bg-red-100 text-red-600 rounded-full font-bold text-xs shrink-0">!</span>}
                            <div>
                                <p className="font-semibold mb-1">{verificationResult.verified ? 'Verification Successful' : 'Verification Failed'}</p>
                                <p>{verificationResult.message}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="employer">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                        Official verification requests must be sent to <span className="font-semibold">verification@unknowniitians.com</span>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
    );
}

export default Career;
