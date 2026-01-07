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
  Building, 
  Check, 
  FileText,
  Loader2,
  ArrowRight,
  GraduationCap,
  Star,
  Users,
  Briefcase,
  User,
  Award,
  CalendarCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Career = () => {
  const navigate = useNavigate();
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
    navigate('/career/openings');
  };

  return (
    <>
      <NavBar />
      
      <main 
        className="pt-24 pb-20 bg-white min-h-screen text-slate-900"
        style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        
        {/* HERO SECTION - Consistent Width */}
        <section className="w-full mb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-12 lg:gap-24 items-center overflow-hidden relative shadow-sm">
            
            <div className="flex-1 w-full text-left z-10">
              <div className="inline-flex items-center bg-white border border-slate-200 text-slate-600 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium mb-8 tracking-wide shadow-sm">
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

            <motion.div 
              className="flex-1 w-full relative z-10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="w-full h-[300px] md:h-[420px] bg-white border border-slate-200 rounded-xl flex justify-center items-center relative overflow-hidden group shadow-sm">
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

        {/* Join UI Section - Consistent Width */}
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
                <Button onClick={scrollToOpenings} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg shadow-lg">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* WHY JOIN US - Consistent Width & Styling */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header - Left Aligned */}
            <div className="text-left mb-10">
              <h1 className="text-[2.5rem] font-bold text-[#111827] mb-3 tracking-tight">
                Why join us?
              </h1>
              <p className="text-lg text-[#4b5563] max-w-2xl">
                Become a part of the mission to provide high quality affordable education to Bharat!
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Benefit 1 */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors duration-200 flex items-start gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">Role with a purpose</h3>
                  <p className="text-[#4b5563] leading-[1.5] text-sm">
                    An opportunity to enhance the quality of education in Bharat and create a lasting social impact.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-purple-200 transition-colors duration-200 flex items-start gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#f5f3ff] text-[#8b5cf6] flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">Opportunity to the deserving</h3>
                  <p className="text-[#4b5563] leading-[1.5] text-sm">
                    We foster a meritocratic environment where talent is recognized and hard work is rewarded with growth.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-green-200 transition-colors duration-200 flex items-start gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#ecfdf5] text-[#10b981] flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">Collaborative culture</h3>
                  <p className="text-[#4b5563] leading-[1.5] text-sm">
                    Work with an approachable and cooperative team with no hierarchy or airs around designations.
                  </p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 hover:border-orange-200 transition-colors duration-200 flex items-start gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#fffbeb] text-[#f59e0b] flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">Flexible working policy</h3>
                  <p className="text-[#4b5563] leading-[1.5] text-sm">
                    Maintain harmony with flexible working hours and employee-friendly leave policies designed for you.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* TEAM TESTIMONIALS SECTION - Consistent Width */}
        <section className="w-full mb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-[30px] p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-12 lg:gap-20 items-center shadow-sm">
            
            {/* Left Side Content */}
            <div className="flex-1 text-left">
              <div className="text-[80px] text-slate-700 leading-[0.5] mb-4 font-serif">“</div>
              <h2 className="text-[42px] font-bold text-[#1a202c] mb-5 tracking-tight leading-[1.1]">
                Hear from the team!
              </h2>
              <p className="text-lg text-[#64748b] leading-[1.6]">
                Get a sneak-peek into all the magic and professional growth that happens at UI.
              </p>
            </div>

            {/* Right Side Testimonials */}
            <div className="flex-[1.2] flex flex-col gap-6 w-full">
              
              {/* Card 1: Ishika Ray */}
              <div className="relative p-8 md:p-10 rounded-2xl bg-[#fff9f2] overflow-hidden text-left shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
                 <svg className="absolute top-0 right-0 w-[200px] h-[200px] opacity-[0.05] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,20 Q25,10 50,20 T100,20 M0,40 Q25,30 50,40 T100,40 M0,60 Q25,50 50,60 T100,60" fill="none" stroke="#d97706" strokeWidth="1.5"/>
                 </svg>
                 
                 <div className="relative z-10">
                    <h3 className="text-[19px] font-bold text-[#1a202c] mb-0.5">Ishika Ray</h3>
                    <p className="text-[14px] font-medium text-[#94a3b8] uppercase tracking-[0.5px] mb-4">Educator, Mathematics Department</p>
                    <p className="text-[16px] leading-[1.6] text-[#475569]">
                      Amazing. The environment is really understanding. I have worked for several platforms before, but to be very honest, I can say that UI provides a significantly better professional experience to work with.
                    </p>
                 </div>
              </div>

              {/* Card 2: Diya Gehlot */}
              <div className="relative p-8 md:p-10 rounded-2xl bg-[#f7faff] overflow-hidden text-left shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
                 <svg className="absolute top-0 right-0 w-[200px] h-[200px] opacity-[0.05] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,20 Q25,10 50,20 T100,20 M0,40 Q25,30 50,40 T100,40 M0,60 Q25,50 50,60 T100,60" fill="none" stroke="#4f46e5" strokeWidth="1.5"/>
                 </svg>

                 <div className="relative z-10">
                    <h3 className="text-[19px] font-bold text-[#1a202c] mb-0.5">Diya Gehlot</h3>
                    <p className="text-[14px] font-medium text-[#94a3b8] uppercase tracking-[0.5px] mb-4">Educator, Mathematics Department</p>
                    <p className="text-[16px] leading-[1.6] text-[#475569]">
                      Honestly, it was a really great experience. I really enjoyed working here because the workflow is managed so efficiently without unnecessary stress. I've worked on other channels before, but I never received this level of ease and support, and that’s the best part about UI. I also gained new insights from the leadership, which helped me improve my professional skills. The supportive atmosphere made it easy for me to focus and give my best. Overall, it was an amazing experience, and I’m grateful to be part of this team.
                    </p>
                 </div>
              </div>

            </div>
          </div>
        </section>

        {/* Employee Verification Section - Consistent Width */}
        <section className="py-24 bg-white border-t border-slate-200">
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
