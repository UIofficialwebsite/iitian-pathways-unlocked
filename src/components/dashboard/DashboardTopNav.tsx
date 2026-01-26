import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const InternVerification = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Employee Code
  const [nameQuery, setNameQuery] = useState("");     // Full Name
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || !nameQuery.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both Employee ID and Full Name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);
    setHasSearched(false);

    try {
      // Clean inputs
      const cleanCode = searchQuery.trim().toUpperCase();
      const cleanName = nameQuery.trim().toLowerCase();

      // 1. Exact Match Search
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_code', cleanCode)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // 2. Name Verification (Case-insensitive check)
        const dbName = data.full_name.trim().toLowerCase();
        
        if (dbName === cleanName) {
          setResult(data);
          toast({
            title: "Verification Successful",
            description: "Employee record found.",
          });
        } else {
          toast({
            title: "Verification Failed",
            description: "Employee ID found, but the name does not match our records.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "No Record Found",
          description: "No employee found with this ID.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "System Error",
        description: "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Main Verification Container */}
      <div className="w-full max-w-lg space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Intern Verification</h1>
          <p className="text-sm text-gray-500">
            Verify internship completion and employee status.
          </p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
            <CardTitle className="text-base font-semibold text-gray-800">
              Enter Details
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="empId" className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Employee ID
                </label>
                <Input
                  id="empId"
                  placeholder="e.g. UI/INT/2024/001"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-sm border-gray-300 focus:border-gray-400 focus:ring-gray-200 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  placeholder="Enter full name as per records"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className="rounded-sm border-gray-300 focus:border-gray-400 focus:ring-gray-200 h-10"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-sm h-10 mt-2 font-medium transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  "Verify Status"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Verification Result Display */}
        {hasSearched && result && (
          <div className="bg-white border border-gray-200 rounded-md shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-green-50/50 border-b border-green-100 px-6 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-green-800">Verified Record</span>
              <span className="px-2 py-0.5 rounded-sm bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">
                {result.status || 'Active'}
              </span>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</p>
                <p className="text-sm font-medium text-gray-900">{result.full_name}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Employee ID</p>
                <p className="text-sm font-medium text-gray-900">{result.employee_code}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Position</p>
                <p className="text-sm font-medium text-gray-900">{result.position}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Department</p>
                <p className="text-sm font-medium text-gray-900">{result.department}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {result.start_date ? new Date(result.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">End Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {result.end_date ? new Date(result.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Present'}
                </p>
              </div>
            </div>

            {result.verification_certificate_url && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-right">
                <a 
                  href={result.verification_certificate_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  View Certificate &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        {/* FAQ Section - Clean List */}
        <div className="pt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 px-1">Frequently Asked Questions</h3>
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Why can't I find my details?</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ensure you have entered your Employee ID exactly as issued (e.g., UI/INT/...) and your full name as registered. If the issue persists, contact HR.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">How do I download my certificate?</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                If your internship is completed and verified, a "View Certificate" link will appear at the bottom of your verification card.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InternVerification;
