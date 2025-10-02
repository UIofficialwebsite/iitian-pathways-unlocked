
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
  Loader2
} from "lucide-react";
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

  return (
    <>
      <NavBar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-royal to-royal-dark text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h1 
              className="text-4xl sm:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Rooted in Opportunity, Built for Success
            </motion.h1>
            <motion.p 
              className="text-xl max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Start your career journey with Unknown IITians
            </motion.p>
          </div>
        </section>

        {/* Current Openings Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center justify-center p-2 bg-royal/10 rounded-full mb-4"
              >
                <Briefcase className="h-6 w-6 text-royal" />
              </motion.div>
              <h2 className="text-3xl font-bold">Current Openings</h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
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
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                      <CardHeader className="pb-4 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            <CardDescription className="mt-1">{job.company}</CardDescription>
                          </div>
                          <Badge variant={job.job_type === "Remote" ? "outline" : "secondary"} className="bg-royal/10 text-royal">
                            {job.job_type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 flex-grow">
                        <div className="space-y-4">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{job.location}</span>
                          </div>
                          {job.stipend && (
                            <div className="flex items-center text-sm">
                              <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{job.stipend}</span>
                            </div>
                          )}
                          {job.duration && (
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{job.duration}</span>
                            </div>
                          )}
                          {job.deadline && (
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span>Apply by: {new Date(job.deadline).toLocaleDateString()}</span>
                            </div>
                          )}

                          {job.description && (
                            <div className="pt-2">
                              <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                            </div>
                          )}

                          {job.requirements && job.requirements.length > 0 && (
                            <div className="pt-2">
                              <h4 className="text-sm font-semibold mb-1">Requirements:</h4>
                              <ul className="text-xs text-gray-600 list-disc list-inside">
                                {job.requirements.slice(0, 3).map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t flex justify-end">
                        <Button asChild className="bg-royal hover:bg-royal-dark text-white">
                          <a href={job.application_url || '#'} target="_blank" rel="noopener noreferrer">Apply Now</a>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No open positions at the moment. Please check back later!</p>
              </div>
            )}
            
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">Get notified when new positions open up</p>
              
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h3 className="font-medium mb-4">Subscribe for Job Updates</h3>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <Input 
                    type="email" 
                    placeholder="Enter your email for updates on hirings" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-grow"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-royal hover:bg-royal-dark text-white"
                  >
                    {isSubmitting ? "Subscribing..." : "Subscribe"}
                  </Button>
                </form>
                {subscribeSuccess && (
                  <p className="text-green-600 mt-2 text-sm">Successfully subscribed! You'll receive updates on new opportunities.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Join UI Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-4xl mx-auto"
              >
                <h2 className="text-4xl font-bold mb-6 text-gray-900">
                  Join Unknown IITians!
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Unknown IITians is a platform dedicated to providing high-quality educational content to help students and freshers succeed in their careers. We also offer opportunities for internships and hiring positions directly through our platform. All hirings for Unknown IITians will be posted here, with notifications sent out to those who have filled out the required forms.
                </p>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Once you complete the form, you will receive an email with further details about the interview process and the next steps. Our goal is to help you gain practical experience, develop your skills, and build a strong foundation for your future career.
                </p>
                <Button className="bg-royal hover:bg-royal-dark text-white px-8 py-6 text-lg">
                  Start Your Journey
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Work at UI Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">Why work at Unknown IITians</h2>
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
                  title: "No Middlemen – Direct Access to Opportunities",
                  description: "At Unknown IITians, we don't act as a mediator. You get direct access to internship openings based on your skills and interests. If you have the required skills, you can join and begin your journey without delays.",
                  icon: Users
                },
                {
                  title: "A Stepping Stone to Success",
                  description: "An internship with Unknown IITians is more than just a learning experience; it's a chance to set the foundation for your future career. You'll gain insights into the industry, develop a strong work ethic, and build a network that can help you land your dream job after college.",
                  icon: Briefcase
                },
                {
                  title: "No Experience? No Problem!",
                  description: "You don't need to have extensive experience to get started. We welcome students with basic skills who are eager to learn and grow. The internships we offer are a perfect starting point to build your knowledge and abilities in a professional setting.",
                  icon: User
                },
                {
                  title: "Work on Paid Opportunities After Training",
                  description: "Once you've completed the training and feel confident in your abilities, you can directly apply for paid internships and roles. Unknown IITians helps bridge the gap between learning and earning, ensuring that you can apply your skills in real, paid work environments.",
                  icon: Building
                }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center text-center p-6 rounded-lg transition-all duration-300"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="rounded-full bg-royal/10 p-4 mb-6">
                    <item.icon className="h-8 w-8 text-royal" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Make Remarkable Change */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How do we make remarkable change?</h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600">
                Unknown IITians creates remarkable change in the educational field by offering students the opportunity to earn while they learn. We provide skill-building resources, paid internships, and real-world experiences that empower students to develop their potential, gain practical knowledge, and support themselves financially. Through mentorship and hands-on training, we bridge the gap between education and career success, helping students thrive in both their personal and professional lives.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-royal/5 rounded-full -mt-20 -mr-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-royal/5 rounded-full -mb-16 -ml-16"></div>
              
              <div className="relative">
                <blockquote className="text-xl md:text-2xl text-gray-800 italic font-medium text-center mb-8">
                  "Don't just think about placement; think about building your own empire. Success isn't limited to your degree—it begins with the growth you nurture today. Train yourself, work on your skills, and create something great, because true success comes from starting now, not after your studies."
                </blockquote>
                
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-bold text-lg">Anonymous</p>
                    <p className="text-gray-600">Founder, Unknown IITians</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Employee Verification Section */}
        <section className="py-16 bg-white">
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
              <h2 className="text-3xl font-bold">Employee Verification</h2>
              <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                Verify employment status and role at Unknown IITians
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="shadow-lg border-none">
                <CardHeader className="bg-royal/5">
                  <CardTitle className="text-2xl font-bold">Verification Portal</CardTitle>
                  <CardDescription>
                    Verify credentials for interns and employees who have worked with Unknown IITians
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Tabs 
                    defaultValue="intern" 
                    value={verificationTab}
                    onValueChange={(value) => setVerificationTab(value as "intern" | "employer")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="intern">For Interns</TabsTrigger>
                      <TabsTrigger value="employer">For Employers</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="intern">
                      <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                          <label htmlFor="empId" className="block text-sm font-medium text-gray-700 mb-1">
                            Employee ID
                          </label>
                          <Input 
                            id="empId" 
                            placeholder="Enter your Employee ID (e.g., UI12345)" 
                            value={empId}
                            onChange={(e) => setEmpId(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="empName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <Input 
                            id="empName" 
                            placeholder="Enter your full name as registered" 
                            value={empName}
                            onChange={(e) => setEmpName(e.target.value)}
                            required
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-royal hover:bg-royal-dark"
                          disabled={verifying}
                        >
                          {verifying ? "Verifying..." : "Verify Credentials"}
                        </Button>
                      </form>
                      
                      {verificationResult && (
                        <div className={`mt-6 p-4 rounded-md ${
                          verificationResult.verified 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                        }`}>
                          <div className="flex items-center mb-3">
                            {verificationResult.verified ? (
                              <Check className="h-5 w-5 text-green-500 mr-2" />
                            ) : (
                              <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            <h3 className={`text-sm font-medium ${
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
                            <div className="mt-4 space-y-3">
                              <h4 className="font-semibold text-gray-900 text-sm">Employment Details:</h4>
                              <div className="bg-white rounded-md p-3 border border-gray-200">
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Name:</span>
                                    <span className="text-gray-900">{verificationResult.details.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Employee ID:</span>
                                    <span className="text-gray-900">{verificationResult.details.employeeId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Position:</span>
                                    <span className="text-gray-900">{verificationResult.details.position}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Department:</span>
                                    <span className="text-gray-900">{verificationResult.details.department}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Type:</span>
                                    <span className="text-gray-900 capitalize">{verificationResult.details.employeeType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">Start Date:</span>
                                    <span className="text-gray-900">{verificationResult.details.startDate}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-700">End Date:</span>
                                    <span className="text-gray-900">{verificationResult.details.endDate}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">Status:</span>
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
                        <p className="text-gray-600">
                          For employers looking to verify employment status of a candidate, please email your request to verification@unknowniitians.com with the following details:
                        </p>
                        
                        <ul className="list-disc pl-5 space-y-2 text-gray-600">
                          <li>Your company name and contact details</li>
                          <li>Candidate's name and Employee ID (if available)</li>
                          <li>Purpose of verification</li>
                          <li>Your relation to the candidate</li>
                        </ul>
                        
                        <p className="text-gray-600">
                          We will respond to your request within 2-3 business days.
                        </p>
                        
                        <Button className="w-full bg-royal hover:bg-royal-dark">
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
