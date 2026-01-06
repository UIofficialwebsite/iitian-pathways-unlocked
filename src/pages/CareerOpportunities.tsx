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
  GraduationCap
} from "lucide-react";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// --- JOB HELP CARD COMPONENT (Based on your HTML/CSS) ---
const JobHelpCard = () => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm flex flex-col mt-6">
      <div className="w-full h-[180px] bg-slate-50 rounded-xl mb-6 flex justify-center items-center overflow-hidden relative">
        <div className="absolute w-[140px] h-[140px] bg-[#2563eb] opacity-[0.03] rounded-full -top-5 -right-5 pointer-events-none"></div>
        <img 
          src="https://cdni.iconscout.com/illustration/premium/thumb/man-searching-for-job-illustration-download-in-svg-png-gif-file-formats--business-person-employee-interview-hiring-pack-human-resources-illustrations-4841963.png" 
          alt="Searching illustration" 
          className="max-w-[90%] h-auto relative z-10"
        />
      </div>

      <h2 className="text-lg font-extrabold text-slate-800 mb-3 tracking-tight font-sans">
        Can't find the right job?
      </h2>
      
      <p className="text-sm leading-relaxed text-slate-500 mb-6 font-sans">
        Drop in your resume and we'll get back to you when we have suitable openings that match your profile!
      </p>

      <a 
        href="#" 
        className="inline-block self-start px-6 py-2.5 border-[1.5px] border-blue-600 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-px font-sans decoration-0"
      >
        Apply Here
      </a>
    </div>
  );
};

const CareerOpportunities = () => {
  const { jobs, contentLoading } = useBackend();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter States
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  const [expandedFilter, setExpandedFilter] = useState<string | null>("job_type"); 

  // Derived Unique Values from Active Jobs
  const activeJobs = useMemo(() => jobs.filter(j => j.is_active), [jobs]);

  const uniqueJobTypes = useMemo(() => {
    const items = new Set<string>();
    activeJobs.forEach(job => { if (job.job_type) items.add(job.job_type); });
    return Array.from(items).sort();
  }, [activeJobs]);

  const uniqueExperienceLevels = useMemo(() => {
    const items = new Set<string>();
    activeJobs.forEach(job => { if (job.experience_level) items.add(job.experience_level); });
    return Array.from(items).sort();
  }, [activeJobs]);

  const uniqueLocations = useMemo(() => {
    const items = new Set<string>();
    activeJobs.forEach(job => { if (job.location) items.add(job.location); });
    return Array.from(items).sort();
  }, [activeJobs]);

  // Filtering Logic
  const openings = useMemo(() => {
    return activeJobs.filter(job => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          job.title?.toLowerCase().includes(term) ||
          job.location?.toLowerCase().includes(term) ||
          job.company?.toLowerCase().includes(term) ||
          job.job_type?.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }
      
      if (selectedJobTypes.length > 0) {
        if (!job.job_type || !selectedJobTypes.includes(job.job_type)) return false;
      }
      if (selectedExperienceLevels.length > 0) {
        if (!job.experience_level || !selectedExperienceLevels.includes(job.experience_level)) return false;
      }
      if (selectedLocations.length > 0) {
        if (!job.location || !selectedLocations.includes(job.location)) return false;
      }

      return true;
    });
  }, [activeJobs, searchTerm, selectedJobTypes, selectedExperienceLevels, selectedLocations]);

  const toggleFilter = (item: string, currentSelected: string[], setFn: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentSelected.includes(item)) {
      setFn(currentSelected.filter(i => i !== item));
    } else {
      setFn([...currentSelected, item]);
    }
  };

  const clearFilters = () => {
    setSelectedJobTypes([]);
    setSelectedExperienceLevels([]);
    setSelectedLocations([]);
    setSearchTerm("");
  };

  const toggleExpanded = (filterName: string) => {
    setExpandedFilter(prev => prev === filterName ? null : filterName);
  };

  const hasActiveFilters = selectedJobTypes.length > 0 || selectedExperienceLevels.length > 0 || selectedLocations.length > 0 || searchTerm !== "";

  const FilterSection = ({ title, items, selectedItems, id, onToggle }: { title: string, items: string[], selectedItems: string[], id: string, onToggle: (item: string) => void }) => (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden mb-3 shrink-0">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => toggleExpanded(id)}
      >
        <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
          {title}
          {selectedItems.length > 0 && (
            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-blue-100 text-blue-700">
              {selectedItems.length}
            </Badge>
          )}
        </span>
        {expandedFilter === id ? <Minus className="w-4 h-4 text-slate-400" /> : <Plus className="w-4 h-4 text-slate-400" />}
      </div>
      
      <AnimatePresence initial={false}>
        {expandedFilter === id && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
          >
            <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {items.length > 0 ? items.map((item) => (
                <button
                  key={item}
                  onClick={(e) => { e.stopPropagation(); onToggle(item); }}
                  className={`flex items-center w-full text-left text-sm py-2 px-2 rounded-md transition-colors ${
                    selectedItems.includes(item) ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center transition-colors ${
                    selectedItems.includes(item) ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"
                  }`}>
                    {selectedItems.includes(item) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {item}
                </button>
              )) : (
                <p className="text-xs text-slate-400 italic">No options available</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans text-slate-900">
      {/* 1. Header is Sticky */}
      <div className="sticky top-0 z-50 bg-white shrink-0">
        <NavBar />
      </div>

      {/* 2. Main Content Area - Scrollable page flow */}
      <div className="flex-1 flex flex-col relative">
        {/* Background Gradient */}
        <div className="absolute top-0 left-0 w-full h-[240px] bg-gradient-to-br from-[#f0f4c3] via-[#d1e3ff] to-[#f3e5f5] -z-10 mt-0"></div>

        <div className="max-w-[1100px] w-full mx-auto px-5 flex flex-col flex-1 pt-8 pb-16">
            
            {/* Top Search & Stats Area */}
            <div className="shrink-0 mb-4">
                <div className="relative w-full mb-8 shadow-sm bg-white rounded-lg mt-8">
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full py-4 pl-5 pr-14 border border-slate-200 rounded-lg text-[15px] outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-slate-700 placeholder:text-slate-400"
                    placeholder="Search by role, company or location"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                    {searchTerm ? (
                      <button onClick={() => setSearchTerm("")} className="hover:text-slate-600"><X className="w-5 h-5" /></button>
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-medium text-slate-800">
                      {openings.length} {openings.length === 1 ? 'Open job' : 'Open jobs'} available
                    </h1>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-xs flex items-center gap-1 text-red-500 font-medium hover:text-red-600 transition-colors">
                        <FilterX className="w-3 h-3" /> Clear filters
                      </button>
                    )}
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    Newest First <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
            </div>

            {/* 3. The Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
              
              {/* Left Column: Filters - STICKY */}
              <div className="hidden lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-sm font-semibold text-slate-600 mb-4 py-2">Filters</p>
                
                <FilterSection 
                  title="Job Type" 
                  id="job_type" 
                  items={uniqueJobTypes} 
                  selectedItems={selectedJobTypes} 
                  onToggle={(item) => toggleFilter(item, selectedJobTypes, setSelectedJobTypes)}
                />

                <FilterSection 
                  title="Experience Level" 
                  id="experience_level" 
                  items={uniqueExperienceLevels} 
                  selectedItems={selectedExperienceLevels} 
                  onToggle={(item) => toggleFilter(item, selectedExperienceLevels, setSelectedExperienceLevels)}
                />

                <FilterSection 
                  title="Location" 
                  id="location" 
                  items={uniqueLocations} 
                  selectedItems={selectedLocations} 
                  onToggle={(item) => toggleFilter(item, selectedLocations, setSelectedLocations)}
                />

                <JobHelpCard />
              </div>

              {/* Right Column: Jobs - FLOWS NATURALLY */}
              <div className="min-h-[500px]">
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
                        className="bg-white border border-slate-900 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                      >
                        <h2 className="text-xl font-medium text-slate-900 mb-3">{job.title}</h2>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 opacity-70" />
                            <span>{job.location}</span>
                          </div>
                          
                          {job.job_type && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 opacity-70" />
                              <span>{job.job_type}</span>
                            </div>
                          )}
                          
                          {job.experience_level && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 opacity-70" />
                              <span>{job.experience_level}</span>
                            </div>
                          )}

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
                          <button className="p-2.5 rounded-md border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all"><Bookmark className="w-5 h-5" /></button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">No open positions found matching your criteria.</p>
                      <button onClick={clearFilters} className="text-sm text-blue-600 font-medium mt-2 hover:underline">Clear all filters</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
      
      {/* 4. Footer - Placed at the very bottom, full width */}
      <Footer />
    </div>
  );
};

export default CareerOpportunities;
