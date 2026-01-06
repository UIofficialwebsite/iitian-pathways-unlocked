import React, { useState, useMemo } from "react";
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
  Minus,
  Bookmark,
  Loader2,
  X,
  Check,
  FilterX
} from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const CareerOpportunities = () => {
  const { jobs, contentLoading } = useBackend();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter States
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [expandedFilter, setExpandedFilter] = useState<string | null>("department");

  // Derived Unique Values from Active Jobs
  const activeJobs = useMemo(() => jobs.filter(j => j.is_active), [jobs]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set<string>();
    activeJobs.forEach(job => {
      if (job.department) depts.add(job.department);
    });
    return Array.from(depts).sort();
  }, [activeJobs]);

  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    activeJobs.forEach(job => {
      if (job.location) locs.add(job.location);
    });
    return Array.from(locs).sort();
  }, [activeJobs]);

  // Filtering Logic
  const openings = activeJobs.filter(job => {
    // 1. Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term) ||
        job.department?.toLowerCase().includes(term) ||
        job.company?.toLowerCase().includes(term);
      
      if (!matchesSearch) return false;
    }

    // 2. Department Filter
    if (selectedDepartments.length > 0) {
      if (!job.department || !selectedDepartments.includes(job.department)) {
        return false;
      }
    }

    // 3. Location Filter
    if (selectedLocations.length > 0) {
      if (!job.location || !selectedLocations.includes(job.location)) {
        return false;
      }
    }

    return true;
  });

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  const clearFilters = () => {
    setSelectedDepartments([]);
    setSelectedLocations([]);
    setSearchTerm("");
  };

  const toggleExpanded = (filter: string) => {
    setExpandedFilter(expandedFilter === filter ? null : filter);
  };

  const hasActiveFilters = selectedDepartments.length > 0 || selectedLocations.length > 0 || searchTerm !== "";

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 pb-12">
      <NavBar />
      
      {/* Abstract Header Background */}
      <div className="h-[240px] w-full bg-gradient-to-br from-[#f0f4c3] via-[#d1e3ff] to-[#f3e5f5] relative overflow-hidden mt-16">
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-slate-800">
              {openings.length} {openings.length === 1 ? 'Open job' : 'Open jobs'} available
            </h1>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-xs flex items-center gap-1 text-red-500 font-medium hover:text-red-600 transition-colors"
              >
                <FilterX className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
          
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
            
            {/* Department Filter */}
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpanded("department")}
              >
                <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                  Department
                  {selectedDepartments.length > 0 && (
                    <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-blue-100 text-blue-700">
                      {selectedDepartments.length}
                    </Badge>
                  )}
                </span>
                {expandedFilter === "department" ? (
                  <Minus className="w-4 h-4 text-slate-400" />
                ) : (
                  <Plus className="w-4 h-4 text-slate-400" />
                )}
              </div>
              
              <AnimatePresence>
                {expandedFilter === "department" && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {uniqueDepartments.length > 0 ? uniqueDepartments.map((dept) => (
                        <div key={dept} className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleDepartment(dept)}
                            className={`flex items-center w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors ${
                              selectedDepartments.includes(dept) 
                                ? "bg-blue-50 text-blue-700 font-medium" 
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center ${
                              selectedDepartments.includes(dept)
                                ? "bg-blue-600 border-blue-600"
                                : "border-slate-300"
                            }`}>
                              {selectedDepartments.includes(dept) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {dept}
                          </button>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-400 italic px-2">No departments found</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Location Filter */}
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpanded("location")}
              >
                <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
                  Location
                  {selectedLocations.length > 0 && (
                    <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-blue-100 text-blue-700">
                      {selectedLocations.length}
                    </Badge>
                  )}
                </span>
                {expandedFilter === "location" ? (
                  <Minus className="w-4 h-4 text-slate-400" />
                ) : (
                  <Plus className="w-4 h-4 text-slate-400" />
                )}
              </div>
              
              <AnimatePresence>
                {expandedFilter === "location" && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {uniqueLocations.length > 0 ? uniqueLocations.map((loc) => (
                        <div key={loc} className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleLocation(loc)}
                            className={`flex items-center w-full text-left text-sm py-1.5 px-2 rounded-md transition-colors ${
                              selectedLocations.includes(loc) 
                                ? "bg-blue-50 text-blue-700 font-medium" 
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center ${
                              selectedLocations.includes(loc)
                                ? "bg-blue-600 border-blue-600"
                                : "border-slate-300"
                            }`}>
                              {selectedLocations.includes(loc) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            {loc}
                          </button>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-400 italic px-2">No locations found</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                      onClick={() => navigate(`/career/job/${job.id}`)}
                      className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 hover:border-blue-300 font-medium px-6 py-2 h-auto rounded-md transition-all duration-200"
                    >
                      View and Apply
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
                <button onClick={clearFilters} className="text-sm text-blue-600 font-medium mt-2 hover:underline">
                  Clear all filters
                </button>
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
