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
  FilterX,
  Clock
} from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const CareerOpportunities = () => {
  const { jobs, contentLoading } = useBackend();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter States
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  
  // Controls which filter section is open
  const [expandedFilter, setExpandedFilter] = useState<string | null>("job_type");

  // Derived Unique Values from Active Jobs
  const activeJobs = useMemo(() => jobs.filter(j => j.is_active), [jobs]);

  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    activeJobs.forEach(job => job.location && set.add(job.location));
    return Array.from(set).sort();
  }, [activeJobs]);

  const uniqueJobTypes = useMemo(() => {
    const set = new Set<string>();
    activeJobs.forEach(job => job.job_type && set.add(job.job_type));
    return Array.from(set).sort();
  }, [activeJobs]);

  const uniqueExperience = useMemo(() => {
    const set = new Set<string>();
    activeJobs.forEach(job => job.experience_level && set.add(job.experience_level));
    return Array.from(set).sort();
  }, [activeJobs]);

  // Filtering Logic
  const openings = activeJobs.filter(job => {
    // 1. Search Term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        job.title?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term) ||
        job.job_type?.toLowerCase().includes(term) ||
        job.company?.toLowerCase().includes(term);
      
      if (!matchesSearch) return false;
    }

    // 2. Location Filter
    if (selectedLocations.length > 0) {
      if (!job.location || !selectedLocations.includes(job.location)) return false;
    }

    // 3. Job Type Filter
    if (selectedJobTypes.length > 0) {
      if (!job.job_type || !selectedJobTypes.includes(job.job_type)) return false;
    }

    // 4. Experience Level Filter
    if (selectedExperience.length > 0) {
      if (!job.experience_level || !selectedExperience.includes(job.experience_level)) return false;
    }

    return true;
  });

  // Filter Toggles
  const toggleSelection = (
    item: string, 
    current: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const clearFilters = () => {
    setSelectedLocations([]);
    setSelectedJobTypes([]);
    setSelectedExperience([]);
    setSearchTerm("");
  };

  const toggleExpanded = (filter: string) => {
    setExpandedFilter(expandedFilter === filter ? null : filter);
  };

  const hasActiveFilters = selectedLocations.length > 0 || selectedJobTypes.length > 0 || selectedExperience.length > 0 || searchTerm !== "";

  // Helper to render filter sections
  const FilterSection = ({ 
    title, 
    id, 
    items, 
    selectedItems, 
    setSelected 
  }: { 
    title: string, 
    id: string, 
    items: string[], 
    selectedItems: string[], 
    setSelected: React.Dispatch<React.SetStateAction<string[]>> 
  }) => (
    <div className="border border-slate-900 rounded-lg bg-white overflow-hidden mb-3">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => toggleExpanded(id)}
      >
        <span className="text-sm text-slate-900 font-bold flex items-center gap-2">
          {title}
          {selectedItems.length > 0 && (
            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-slate-900 text-white hover:bg-slate-700">
              {selectedItems.length}
            </Badge>
          )}
        </span>
        {expandedFilter === id ? <Minus className="w-4 h-4 text-slate-900" /> : <Plus className="w-4 h-4 text-slate-400" />}
      </div>
      
      <AnimatePresence>
        {expandedFilter === id && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {items.length > 0 ? items.map((item) => (
                <div key={item} className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleSelection(item, selectedItems, setSelected)}
                    className={`flex items-center w-full text-left text-sm py-2 px-2 rounded-md transition-colors ${
                      selectedItems.includes(item) 
                        ? "bg-slate-100 text-slate-900 font-semibold" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center ${
                      selectedItems.includes(item)
                        ? "bg-slate-900 border-slate-900"
                        : "border-slate-300"
                    }`}>
                      {selectedItems.includes(item) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {item}
                  </button>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic px-2">No options available</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans text-slate-900 pb-12">
      <NavBar />
      
      {/* Header Background */}
      <div className="h-[240px] w-full bg-gradient-to-br from-[#f0f4c3] via-[#d1e3ff] to-[#f3e5f5] relative overflow-hidden mt-16"></div>

      {/* Main Container */}
      <div className="max-w-[1100px] mx-auto px-5 relative z-10 -mt-10">
        
        {/* Search Bar (Black Border) */}
        <div className="relative w-full mb-10 shadow-sm bg-white rounded-lg">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-4 pl-5 pr-14 border border-slate-900 rounded-lg text-[15px] outline-none focus:ring-1 focus:ring-slate-900 transition-all text-slate-900 placeholder:text-slate-400"
            placeholder="Search by role, location or skills..."
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
          
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-900 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            Newest First
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          
          {/* Sidebar Filters */}
          <div className="hidden lg:block space-y-2">
            <p className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Filter By</p>
            
            <FilterSection 
              title="Job Type" 
              id="job_type" 
              items={uniqueJobTypes} 
              selectedItems={selectedJobTypes} 
              setSelected={setSelectedJobTypes} 
            />

            <FilterSection 
              title="Location" 
              id="location" 
              items={uniqueLocations} 
              selectedItems={selectedLocations} 
              setSelected={setSelectedLocations} 
            />

            <FilterSection 
              title="Experience" 
              id="experience" 
              items={uniqueExperience} 
              selectedItems={selectedExperience} 
              setSelected={setSelectedExperience} 
            />
          </div>

          {/* Job Listings Content */}
          <div className="space-y-5">
            {contentLoading ? (
               <div className="flex justify-center items-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
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
                  className="bg-white border border-slate-900 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h2>
                    {job.is_featured && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100">Featured</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{job.job_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    {job.experience_level && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{job.experience_level}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span>{job.company}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => navigate(`/career/job/${job.id}`)}
                      className="bg-white hover:bg-slate-50 text-blue-600 border border-slate-900 hover:border-blue-600 font-bold px-6 py-2 h-auto rounded-md transition-all duration-200"
                    >
                      View and Apply
                    </Button>
                    <button className="p-2.5 rounded-md border border-slate-900 text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50 transition-all">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No open positions found.</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters.</p>
                <button onClick={clearFilters} className="text-sm text-blue-600 font-bold mt-4 hover:underline">
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
