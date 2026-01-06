import React, { useState } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Briefcase, 
  Building, 
  Search,
  ChevronDown,
  Plus,
  Bookmark,
  Loader2,
  X
} from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { motion } from "framer-motion";

const CareerOpportunities = () => {
  const { jobs, contentLoading } = useBackend();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter active jobs based on search
  const openings = jobs.filter(job => {
    if (!job.is_active) return false;
    if (searchTerm === "") return true;
    const term = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(term) ||
      job.location?.toLowerCase().includes(term) ||
      job.department?.toLowerCase().includes(term) ||
      job.company?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 pb-12">
      <NavBar />
      
      {/* Abstract Header Background */}
      <div className="h-[240px] w-full bg-gradient-to-br from-[#f0f4c3] via-[#d1e3ff] to-[#f3e5f5] relative overflow-hidden mt-16">
         {/* Decorative masking/shapes can be added here if needed */}
      </div>

      {/* Main Content Container */}
      <div className="max-w-[1100px] mx-auto px-5 relative z-10 -mt-10">
        
        {/* Search Bar */}
        <div className="relative w-full mb-10 shadow-sm bg-white rounded-lg">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-4 pl-5 pr-14 border border-slate-200 rounded-lg text-[15px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-slate-700 placeholder:text-slate-400"
            placeholder="Search by role, department or location"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
            {searchTerm ? (
              <button onClick={() => setSearchTerm("")} className="hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-medium text-slate-800">
            {openings.length} {openings.length === 1 ? 'Open job' : 'Open jobs'} available
          </h1>
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            Newest First
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
          
          {/* Sidebar Filters */}
          <div className="hidden lg:block space-y-3">
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
                  <h2 className="text-xl font-medium text-slate-900 mb-3">{job.title}</h2>
                  
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
                <p className="text-slate-600">No open positions found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
};

export default CareerOpportunities;
