import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Calendar, 
  Share2, 
  ArrowLeft,
  Loader2,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  Twitter
} from "lucide-react";
import { motion } from "framer-motion";

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs, contentLoading } = useBackend();

  // Find the specific job
  const job = jobs.find(j => j.id === jobId);

  // Add Manrope font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (contentLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Job not found</h2>
        <Button onClick={() => navigate('/career/openings')}>Back to Openings</Button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-['Manrope'] text-slate-600">
      <NavBar />

      {/* HERO HEADER: LEFT ALIGNED & SOOTHING */}
      <header className="relative pt-[120px] pb-[140px] border-b border-slate-200 bg-white">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000" 
            alt="Office background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/60"></div>
        </div>

        <div className="max-w-[1140px] mx-auto px-6 relative z-10">
          <div className="flex items-center text-sm font-semibold text-blue-600 mb-6 tracking-wide cursor-pointer" onClick={() => navigate('/career/openings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hover:underline">Back to Jobs</span> 
            <span className="mx-2 text-slate-400">/</span>
            <span>{job.department || 'General'}</span>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-500 font-normal">{job.title}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            {job.title}
          </h1>
          
          <div className="flex flex-wrap gap-6 mb-8 text-sm font-semibold text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              {job.location}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              {job.duration || 'Full Time'}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-500" />
              {job.job_type}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-6 rounded-lg font-bold text-base shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-px"
            >
              <a href={job.application_url || '#'} target="_blank" rel="noopener noreferrer">
                Apply Now
              </a>
            </Button>
            <button className="bg-white border border-slate-200 p-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-600">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT LAYOUT: OVERLAPPING */}
      <main className="max-w-[1140px] mx-auto px-6 relative z-20 -mt-20 pb-24 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        
        {/* Main Job Info */}
        <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Job Description</h2>
          
          <div className="prose prose-slate max-w-none text-[16px] leading-relaxed text-slate-600">
            <p className="mb-6">
              {job.description || "We are seeking a high-energy individual to join our growing team. This role focuses on identifying new opportunities, building high-value solutions, and scaling our operations."}
            </p>

            {job.requirements && job.requirements.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">Requirements</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {Array.isArray(job.requirements) 
                    ? job.requirements.map((req: string, i: number) => <li key={i}>{req}</li>)
                    : typeof job.requirements === 'string' 
                      ? <li>{job.requirements}</li>
                      : <li>No specific requirements listed.</li>
                  }
                </ul>
              </>
            )}

            {job.skills && job.skills.length > 0 && (
              <>
                <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(job.skills) && job.skills.map((skill: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Sidebar Details */}
        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-slate-900 mb-5">Job Snapshot</h2>
            
            <div className="mb-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Posted Date</p>
              <p className="text-[15px] font-semibold text-slate-900">
                {job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Reference</p>
              <p className="text-[15px] font-semibold text-slate-900 font-mono text-sm">#{job.id.slice(0, 8)}</p>
            </div>

            <div className="mb-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stipend / Salary</p>
              <p className="text-[15px] font-semibold text-slate-900">{job.stipend || 'Competitive'}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deadline</p>
              <p className="text-[15px] font-semibold text-slate-900">
                {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open until filled'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-bold text-slate-900 mb-3">Share this role</h2>
            <div className="flex gap-2.5 mt-3">
              <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-blue-600 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-black hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-blue-800 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-800 hover:text-white transition-colors">
                <LinkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

      </main>
      
      <Footer />
    </div>
  );
};

export default JobDetails;
