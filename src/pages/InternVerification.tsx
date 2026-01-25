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
  ChevronDown,
  Search
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

const InternVerification = () => {
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
      
      {/* Centered Main Content Wrapper */}
      <main className="flex-grow flex flex-col items-center pt-28 pb-20 px-4 sm:px-6">
        <div className="w-full max-w-5xl space-y-8">
          
          {/* Professional Header - Centered */}
          <div className="text-center space-y-3 pb-4">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              Internship Verification Center
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Official verification portal for Unknown IITians. Enter credentials below to validate internship or employment status.
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 items-start">
            
            {/* Left Column: Verification Form */}
            <div className="bg-white border border-slate-200 shadow-sm p-8 h-full">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-slate-400" />
                  Validate Credentials
                </h2>
              </div>
              
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="employee-id" className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Intern ID Number
                  </label>
                  <Input
                    id="employee-id"
                    placeholder="e.g., INT12345"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="w-full p-3 h-12 bg-slate-50 border-slate-200 focus:border-slate-900 focus:bg-white rounded-none focus:ring-0 text-base transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="employee-name" className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Full Name
                  </label>
                  <Input
                    id="employee-name"
                    placeholder="Enter full name as per records"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 h-12 bg-slate-50 border-slate-200 focus:border-slate-900 focus:bg-white rounded-none focus:ring-0 text-base transition-all"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 text-sm uppercase tracking-widest rounded-none transition-colors mt-4"
                >
                  {loading ? "Verifying..." : "Search Records"}
                </Button>
              </form>
            </div>

            {/* Right Column: FAQ/Support */}
            <div className="bg-white border border-slate-200 shadow-sm p-8 h-full">
               <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                  Common Questions
                </h2>
              </div>
              
              <Accordion type="single" collapsible className="w-full space-y-4">
                <AccordionItem value="item-1" className="border border-slate-100 px-4 rounded-none bg-slate-50/50">
                  <AccordionTrigger className="hover:no-underline py-3 text-slate-800 font-medium text-sm">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Verification Speed
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-sm pb-3 pl-7">
                    The database is queried in real-time. Results are displayed instantly upon submission.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border border-slate-100 px-4 rounded-none bg-slate-50/50">
                  <AccordionTrigger className="hover:no-underline py-3 text-slate-800 font-medium text-sm">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-4 h-4 text-slate-400" />
                      Invalid ID?
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-sm pb-3 pl-7">
                    Ensure the ID matches the format on your offer letter (e.g., UI12345 or INT001).
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="border border-slate-100 px-4 rounded-none bg-slate-50/50">
                  <AccordionTrigger className="hover:no-underline py-3 text-slate-800 font-medium text-sm">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-slate-400" />
                      Support Contact
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 text-sm pb-3 pl-7">
                    For discrepancies, please contact HR at <a href="mailto:hr@unknowniitians.com" className="text-blue-700 underline">hr@unknowniitians.com</a>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white border border-slate-200 shadow-sm p-8 min-h-[160px]">
            <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
              Search Results
            </h2>

            {verificationResult ? (
              verificationResult.verified ? (
                // Success State - Professional Table
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="border border-slate-200 overflow-hidden">
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
                        <tr className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">{verificationResult.details.name}</td>
                          <td className="px-6 py-4 font-mono text-slate-600">{verificationResult.details.employeeId}</td>
                          <td className="px-6 py-4 text-slate-600">{verificationResult.details.department}</td>
                          <td className="px-6 py-4 text-slate-600">
                            {verificationResult.details.startDate} — {verificationResult.details.endDate}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-bold uppercase tracking-wide ${
                              verificationResult.details.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : verificationResult.details.status === 'Completed'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {verificationResult.details.status === 'Active' && <CheckCircle className="w-3 h-3 mr-1.5" />}
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
                      className="rounded-none border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Print Details
                    </Button>
                    <Button 
                      onClick={handleDownloadCertificate}
                      className="rounded-none bg-slate-900 text-white hover:bg-slate-800 font-medium"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Official Certificate
                    </Button>
                  </div>
                </div>
              ) : (
                // Error State - Professional Alert
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 bg-red-50 border border-red-100 p-6 flex items-start gap-4">
                  <XCircle className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-red-900 font-bold mb-1">No Record Found</h3>
                    <p className="text-red-700 text-sm">
                      {verificationResult.message} Please verify the Employee ID and Name spelling and try again.
                    </p>
                  </div>
                </div>
              )
            ) : (
              // Empty State
              <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200">
                <p className="text-slate-400 text-sm">
                  Search results will appear here after verification.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InternVerification;
