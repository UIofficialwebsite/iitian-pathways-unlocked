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
  ChevronDown 
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
    <div className="bg-white min-h-screen flex flex-col font-['Inter',sans-serif]">
      <NavBar />
      
      {/* Full width container with minimal padding (px-4 or px-6).
        Removed max-w constraint to use full screen.
      */}
      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 w-full">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* Using serif font for the professional heading look */}
          <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-3 tracking-tight">
            Internship Verification Center
          </h1>
          <p className="text-slate-500 text-lg">
            Official platform to check completion and roles.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Left: Check Details Form */}
          <div className="bg-white border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Check Details
            </h2>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="employee-id" className="block text-sm font-medium text-slate-600">
                  Intern ID Number
                </label>
                <Input
                  id="employee-id"
                  placeholder="e.g., INT12345"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  className="w-full p-3 h-12 border-slate-300 focus:border-slate-900 rounded-none focus:ring-0 text-base shadow-none"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="employee-name" className="block text-sm font-medium text-slate-600">
                  Full Name
                </label>
                <Input
                  id="employee-name"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full p-3 h-12 border-slate-300 focus:border-slate-900 rounded-none focus:ring-0 text-base shadow-none"
                />
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-6 text-sm uppercase tracking-wider rounded-none transition-colors mt-2"
              >
                {loading ? "Searching..." : "Search Records"}
              </Button>
            </form>
          </div>

          {/* Right: Common Questions */}
          <div className="bg-white border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Common Questions
            </h2>
            
            <Accordion type="single" collapsible className="w-full space-y-3">
              <AccordionItem value="item-1" className="border border-slate-200 px-4 py-2 rounded-none data-[state=open]:bg-slate-50">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                    <Clock className="w-4 h-4 text-slate-500" />
                    How fast is this?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 pt-2 pb-2 pl-7 text-sm">
                  Results show up instantly after you click search.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border border-slate-200 px-4 py-2 rounded-none data-[state=open]:bg-slate-50">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    ID not working?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 pt-2 pb-2 pl-7 text-sm">
                  Double-check your certificate for the correct ID format.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border border-slate-200 px-4 py-2 rounded-none data-[state=open]:bg-slate-50">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                    <Mail className="w-4 h-4 text-slate-500" />
                    Need more help?
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 pt-2 pb-2 pl-7 text-sm">
                  Email us at <span className="text-slate-900 font-medium">hr@unknowniitians.com</span>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Results Section - Full Width */}
        <div className="bg-white border border-slate-200 p-8 min-h-[200px]">
          <h2 className="text-xl font-bold text-slate-900 mb-8">
            Information Found
          </h2>

          {verificationResult ? (
            verificationResult.verified ? (
              // Success State - Table
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-200">
                        <th className="py-4 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="py-4 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID Number</th>
                        <th className="py-4 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                        <th className="py-4 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Work Period</th>
                        <th className="py-4 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-4 px-4 font-semibold text-slate-900">{verificationResult.details.name}</td>
                        <td className="py-4 px-4 text-slate-600">{verificationResult.details.employeeId}</td>
                        <td className="py-4 px-4 text-slate-600">{verificationResult.details.department}</td>
                        <td className="py-4 px-4 text-slate-600">
                          {verificationResult.details.startDate} — {verificationResult.details.endDate}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-bold text-sm ${
                            verificationResult.details.status === 'Active' ? 'text-green-600' :
                            verificationResult.details.status === 'Completed' ? 'text-blue-600' :
                            'text-red-600'
                          }`}>
                            {verificationResult.details.status === 'Active' ? 'ACTIVE' : 
                             verificationResult.details.status === 'Completed' ? 'VERIFIED' : 
                             verificationResult.details.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadCertificate}
                    className="rounded-none border-slate-900 text-slate-900 font-semibold hover:bg-slate-50 uppercase text-xs tracking-wider"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            ) : (
              // Error State - Red Banner
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="bg-red-600 text-white p-3 font-semibold text-sm uppercase flex items-center gap-3 mb-4 rounded-none">
                  <XCircle className="w-5 h-5" />
                  No Record Found
                </div>
                <p className="text-slate-500 text-sm">
                  {verificationResult.message} Please verify the Employee ID and Name and try again.
                </p>
              </div>
            )
          ) : (
            // Empty State
            <div className="text-slate-400 text-sm italic py-8 text-center border border-dashed border-slate-200">
              Enter details above to search the database.
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default InternVerification;
