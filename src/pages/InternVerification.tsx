import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  Clock, 
  HelpCircle, 
  Mail, 
  Search,
  ShieldCheck,
  Building2
} from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePageSEO, SEO_TITLES } from "@/utils/seoManager";

const InternVerification = () => {
  usePageSEO(SEO_TITLES.INTERN_VERIFICATION, "/intern-verification");
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [verificationResult, setVerificationResult] = useState<null | { verified: boolean, message: string, details?: any }>(null);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!employeeId || !name) {
      setVerificationResult({
        verified: false,
        message: "Please enter both employee ID and name."
      });
      toast({
        title: "Incomplete Information",
        description: "Please enter both employee ID and name.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("employee_code", employeeId)
        .eq("full_name", name)
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
          message: "Record matched successfully.",
          details: {
            name: data.full_name,
            employeeId: data.employee_code,
            position: data.position,
            department: data.department,
            employeeType: data.employee_type,
            startDate: data.start_date ? new Date(data.start_date).toLocaleDateString() : "N/A",
            endDate: data.end_date ? new Date(data.end_date).toLocaleDateString() : "N/A",
            status: statusText,
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
    
    setLoading(false);
  };

  const handleDownloadCertificate = () => {
    if (verificationResult?.details?.verificationCertificateUrl) {
      window.open(verificationResult.details.verificationCertificateUrl, '_blank');
    } else {
      toast({
        title: "Certificate Not Available",
        description: "Verification certificate not yet generated.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col font-['Inter',sans-serif]">
      <NavBar />
      
      {/* Main Content Wrapper */}
      <main className="flex-grow pt-28 pb-20 px-6 sm:px-10 lg:px-16 w-full max-w-[1600px] mx-auto">
        
        {/* Top Hero Section: Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">
          
          {/* Left Column: Heading & Intro (Keeping space from edge via container padding) */}
          <div className="space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official Verification Portal
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 leading-tight tracking-tight">
              Internship & <br/>
              <span className="text-blue-900">Employment Check</span>
            </h1>
            
            <p className="text-slate-600 text-lg leading-relaxed">
              Welcome to the official Unknown IITians verification system. 
              Securely validate the employment history and internship completion status of our alumni and current team members.
            </p>

            <div className="flex items-center gap-6 pt-4 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Unknown IITians Official</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Real-time Database</span>
              </div>
            </div>
          </div>

          {/* Right Column: Verification Form Block */}
          <div className="w-full max-w-md ml-auto lg:mr-auto">
            <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 p-8 rounded-xl">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Validate Credentials
                </h2>
                <p className="text-slate-500 text-sm mt-1">Enter details exactly as per certificate.</p>
              </div>
              
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="employee-id" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Intern ID / Employee Code
                  </label>
                  <Input
                    id="employee-id"
                    placeholder="e.g., INT12345"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="w-full p-3 h-12 bg-slate-50 border-slate-200 focus:border-blue-900 focus:bg-white rounded-lg focus:ring-0 text-base transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="employee-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Legal Name
                  </label>
                  <Input
                    id="employee-name"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 h-12 bg-slate-50 border-slate-200 focus:border-blue-900 focus:bg-white rounded-lg focus:ring-0 text-base transition-all"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-blue-900 text-white font-bold py-6 text-sm uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-slate-900/20 mt-2"
                >
                  {loading ? "Verifying..." : "Search Records"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Results Section (Appears after Landing/Form area) */}
        <div className="mb-20">
          {verificationResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
              <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-xl font-bold text-slate-900">Search Results</h2>
                  {verificationResult.verified ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4" /> Record Found
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
                      <XCircle className="w-4 h-4" /> No Match
                    </span>
                  )}
                </div>

                <div className="p-8">
                  {verificationResult.verified ? (
                    <>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4 font-bold tracking-wider">Candidate Name</th>
                              <th className="px-6 py-4 font-bold tracking-wider">ID Number</th>
                              <th className="px-6 py-4 font-bold tracking-wider">Department</th>
                              <th className="px-6 py-4 font-bold tracking-wider">Duration</th>
                              <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            <tr className="bg-white">
                              <td className="px-6 py-4 font-semibold text-slate-900">{verificationResult.details.name}</td>
                              <td className="px-6 py-4 font-mono text-slate-600">{verificationResult.details.employeeId}</td>
                              <td className="px-6 py-4 text-slate-600">{verificationResult.details.department}</td>
                              <td className="px-6 py-4 text-slate-600">
                                {verificationResult.details.startDate} — {verificationResult.details.endDate}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                                  verificationResult.details.status === 'Active' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : verificationResult.details.status === 'Completed'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                  {verificationResult.details.status}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-8 flex justify-end gap-4">
                        <Button 
                          variant="outline" 
                          onClick={() => window.print()}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          Print Details
                        </Button>
                        <Button 
                          onClick={handleDownloadCertificate}
                          className="bg-slate-900 text-white hover:bg-slate-800 font-medium"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Official Certificate
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-6 flex items-start gap-4 max-w-3xl mx-auto">
                      <XCircle className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-red-900 font-bold mb-1">We couldn't find a record</h3>
                        <p className="text-red-700 text-sm leading-relaxed">
                          {verificationResult.message} This implies the Employee ID or Name provided does not match our active database. Please verify the spelling or contact HR for assistance.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAQs Section (At the bottom) */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500">Common queries regarding the verification process</p>
          </div>
          
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
              <AccordionTrigger className="text-sm md:text-base font-semibold text-blue-900 px-6 py-4 hover:no-underline hover:text-blue-800 text-left">
                How fast is the verification process?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-slate-700 leading-relaxed">
                The database is queried in real-time. Results are displayed instantly upon form submission. You do not need to wait for manual approval.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
              <AccordionTrigger className="text-sm md:text-base font-semibold text-blue-900 px-6 py-4 hover:no-underline hover:text-blue-800 text-left">
                My ID is not working, what should I do?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-slate-700 leading-relaxed">
                Ensure the ID matches the format on your offer letter or certificate (e.g., UI12345 or INT001). If the issue persists, the record might be archived or incorrect.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3" className="bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
              <AccordionTrigger className="text-sm md:text-base font-semibold text-blue-900 px-6 py-4 hover:no-underline hover:text-blue-800 text-left">
                Who do I contact for discrepancies?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-slate-700 leading-relaxed">
                If you believe a record is missing or incorrect, please contact our Human Resources department immediately at <a href="mailto:hr@unknowniitians.com" className="text-blue-700 underline font-medium">hr@unknowniitians.com</a>.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
              <AccordionTrigger className="text-sm md:text-base font-semibold text-blue-900 px-6 py-4 hover:no-underline hover:text-blue-800 text-left">
                Can I verify former employees here?
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5 text-slate-700 leading-relaxed">
                Yes, this portal maintains records for both active and past employees/interns. Status will be shown as 'Completed' or 'Terminated' for former members.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default InternVerification;
