import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Download, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
    <div className="bg-[#f2f4f7] min-h-screen flex flex-col font-['Inter',sans-serif]">
      <NavBar />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-[1000px] mx-auto">
          
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
              Internship Verification Center
            </h1>
            <p className="text-gray-500">Official platform to check completion and roles.</p>
          </div>

          {/* Top Layout: Search + FAQ */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 mb-6">
            
            {/* Left Column: Search Form */}
            <div className="bg-white border border-gray-300 p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-6 border-l-4 border-blue-800 pl-3 text-gray-900">
                Check Details
              </h2>
              
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="employee-id" className="block text-sm font-semibold text-gray-600">
                    Intern ID Number
                  </label>
                  <Input
                    id="employee-id"
                    placeholder="Example: INT12345"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                    className="w-full p-3 h-12 border-gray-300 focus:border-blue-800 rounded-none focus:ring-0 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="employee-name" className="block text-sm font-semibold text-gray-600">
                    Full Name
                  </label>
                  <Input
                    id="employee-name"
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 h-12 border-gray-300 focus:border-blue-800 rounded-none focus:ring-0 text-base"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-6 text-sm uppercase rounded-none tracking-wide transition-colors"
                >
                  {loading ? "Searching..." : "Search Records"}
                </Button>
              </form>
            </div>

            {/* Right Column: FAQ / Common Questions */}
            <div className="bg-white border border-gray-300 p-8 shadow-sm h-fit">
              <h2 className="text-xl font-bold mb-6 border-l-4 border-blue-800 pl-3 text-gray-900">
                Common Questions
              </h2>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b-gray-100">
                  <AccordionTrigger className="text-blue-800 font-semibold hover:no-underline hover:text-blue-900 py-3 text-sm">
                    How fast is this?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-sm">
                    Results show up instantly after you click search.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border-b-gray-100">
                  <AccordionTrigger className="text-blue-800 font-semibold hover:no-underline hover:text-blue-900 py-3 text-sm">
                    ID not working?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-sm">
                    Double-check your certificate for the correct ID format (e.g., INT001 or UI12345).
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="border-b-0">
                  <AccordionTrigger className="text-blue-800 font-semibold hover:no-underline hover:text-blue-900 py-3 text-sm">
                    Need more help?
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 text-sm">
                    Email us at <a href="mailto:hr@unknowniitians.com" className="underline">hr@unknowniitians.com</a>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Bottom Section: Results (conditionally rendered) */}
          {verificationResult && (
            <div className="bg-white border border-gray-300 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold border-l-4 border-blue-800 pl-3 text-gray-900">
                  Information Found
                </h2>
                {verificationResult.verified ? (
                  <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 text-sm font-bold">
                    <CheckCircle className="w-4 h-4 mr-2" /> VERIFIED MATCH
                  </div>
                ) : (
                  <div className="flex items-center text-red-700 bg-red-50 px-3 py-1 text-sm font-bold">
                    <XCircle className="w-4 h-4 mr-2" /> NO RECORD FOUND
                  </div>
                )}
              </div>

              {verificationResult.verified && verificationResult.details ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse mt-2">
                      <thead>
                        <tr className="bg-gray-50 border-y-2 border-gray-200">
                          <th className="py-4 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="py-4 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID Number</th>
                          <th className="py-4 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
                          <th className="py-4 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Work Period</th>
                          <th className="py-4 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-semibold text-gray-900">{verificationResult.details.name}</td>
                          <td className="py-4 px-4 text-gray-500 font-mono text-sm">{verificationResult.details.employeeId}</td>
                          <td className="py-4 px-4 text-gray-700">{verificationResult.details.department}</td>
                          <td className="py-4 px-4 text-gray-700 text-sm">
                            {verificationResult.details.startDate} - {verificationResult.details.endDate}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center text-xs font-bold px-2 py-1 uppercase ${
                              verificationResult.details.status === 'Active' ? 'text-green-700 bg-green-100' :
                              verificationResult.details.status === 'Completed' ? 'text-blue-700 bg-blue-100' :
                              'text-red-700 bg-red-100'
                            }`}>
                              {verificationResult.details.status === 'Active' && '✓ '}
                              {verificationResult.details.status}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadCertificate}
                      className="rounded-none border-gray-900 text-gray-900 font-semibold hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.print()}
                      className="rounded-none border-gray-900 text-gray-900 font-semibold hover:bg-gray-50"
                    >
                      Print Page
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">{verificationResult.message}</p>
                  <p className="text-sm">Please verify the Employee ID and Name and try again.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InternVerification;
