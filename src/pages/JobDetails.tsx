import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useBackend } from "@/components/BackendIntegratedWrapper";
import { 
  Loader2,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  Twitter,
  MapPin,
  Clock,
  Briefcase
} from "lucide-react";

const JobDetails = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs, contentLoading } = useBackend();

  // Find the specific job from the backend list
  const rawJob = jobs.find(j => j.id === jobId);

  // Normalize data structures (handle potential JSON/String differences)
  const job = rawJob ? {
    ...rawJob,
    requirements: Array.isArray(rawJob.requirements) 
      ? rawJob.requirements 
      : typeof rawJob.requirements === 'string' 
        ? [rawJob.requirements] 
        : [],
    skills: Array.isArray(rawJob.skills) 
      ? rawJob.skills 
      : typeof rawJob.skills === 'string' 
        ? [rawJob.skills] 
        : []
  } : null;

  // Inject Manrope font dynamically for this page
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
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-['Manrope']">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-['Manrope']">
        <h2 className="text-2xl font-bold text-[#0f172a] mb-4">Job not found</h2>
        <button 
          onClick={() => navigate('/career/openings')}
          className="bg-[#2563eb] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#1d4ed8] transition-colors"
        >
          Back to Openings
        </button>
      </div>
    );
  }

  // Format Date
  const updatedDate = job.updated_at || job.created_at 
    ? new Date(job.updated_at || job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  // Format ID for "Reference"
  const jobReference = `GB-${job.id.slice(0, 4).toUpperCase()}`;

  return (
    <div className="bg-[#f8fafc] min-h-screen font-['Manrope'] text-[#475569] leading-[1.6]">
      <NavBar />

      {/* HERO HEADER */}
      <header className="relative pt-[100px] pb-[140px] border-b border-[#e2e8f0] bg-white">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000')" }}
        ></div>
        
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.98) 10%, rgba(255,255,255,0.6) 100%)" }}
        ></div>

        <div className="max-w-[1140px] mx-auto px-6 relative z-10">
          {/* Breadcrumbs */}
          <nav className="text-[13px] font-[600] text-[#2563eb] mb-6 tracking-[0.01em]">
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/career/openings')}>Open Jobs</span>
            <span className="text-[#94a3b8] mx-2 font-[400]">/</span>
            <span>{job.department || 'General'}</span>
            <span className="text-[#94a3b8] mx-2 font-[400]">/</span>
            <span className="text-[#64748b]">{job.title}</span>
          </nav>

          {/* H1 Title */}
          <h1 className="text-[34px] font-[800] text-[#0f172a] mb-3 tracking-[-0.02em] leading-tight">
            {job.title}
          </h1>
          
          {/* Meta Row */}
          <div className="flex flex-wrap gap-6 mb-7 font-[600] text-[14px] text-[#475569]">
            <div className="flex items-center gap-2">
              <MapPin className="w-[18px] h-[18px]" strokeWidth={2} />
              {job.location}
            </div>
            {job.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-[18px] h-[18px]" strokeWidth={2} />
                {job.duration}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Briefcase className="w-[18px] h-[18px]" strokeWidth={2} />
              {job.job_type}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex gap-3">
            <a 
              href={job.application_url || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-7 py-3 rounded-lg font-[700] transition-all shadow-[0_4px_6px_-1px_rgba(37,99,235,0.2)] hover:-translate-y-px inline-block"
            >
              Apply Now
            </a>
            <button className="bg-white border border-[#e2e8f0] px-3.5 py-2.5 rounded-lg flex items-center justify-center hover:bg-[#f1f5f9] transition-all text-[#475569]">
              <Share2Icon />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT LAYOUT: OVERLAPPING */}
      <main className="max-w-[1140px] mx-auto px-6 relative z-10 -mt-[80px] pb-[100px] grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        
        {/* Main Job Info Card */}
        <section className="bg-white border border-[#e2e8f0] rounded-xl p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-[700] text-[#0f172a] mb-6">Job Description</h2>
          
          <div className="text-[16px] text-[#475569] leading-[1.8] space-y-6">
            {/* Description */}
            <p className="whitespace-pre-line">
              {job.description}
            </p>

            {/* Requirements Section */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[16px] font-[700] text-[#0f172a] mb-3">Requirements</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {job.requirements.map((req: any, i: number) => (
                    <li key={i}>{typeof req === 'string' ? req : JSON.stringify(req)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills Section */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[16px] font-[700] text-[#0f172a] mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: any, i: number) => (
                    <span key={i} className="bg-[#f1f5f9] text-[#475569] px-3 py-1 rounded-md text-sm font-medium">
                      {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Details */}
        <aside>
          {/* Job Snapshot Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04)] mb-6">
            <h2 className="text-[16px] font-[700] text-[#0f172a] mb-5">Job Snapshot</h2>
            
            <div className="mb-6">
              <p className="text-[11px] font-[700] text-[#94a3b8] uppercase tracking-[0.05em] mb-1">Updated Date</p>
              <p className="text-[15px] font-[600] text-[#0f172a]">
                {updatedDate}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-[11px] font-[700] text-[#94a3b8] uppercase tracking-[0.05em] mb-1">Job Reference</p>
              <p className="text-[15px] font-[600] text-[#0f172a] font-mono">{jobReference}</p>
            </div>

            <div className="mb-6">
              <p className="text-[11px] font-[700] text-[#94a3b8] uppercase tracking-[0.05em] mb-1">Stipend / Salary</p>
              <p className="text-[15px] font-[600] text-[#0f172a]">{job.stipend || 'Competitive'}</p>
            </div>

            <div>
              <p className="text-[11px] font-[700] text-[#94a3b8] uppercase tracking-[0.05em] mb-1">Employee Type</p>
              <p className="text-[15px] font-[600] text-[#0f172a]">
                {job.job_type === 'Remote' ? 'Remote' : 'FTE (Full-time)'}
              </p>
            </div>
          </div>

          {/* Share Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04)]">
            <h2 className="text-[16px] font-[700] text-[#0f172a] mb-3">Share this role</h2>
            <div className="flex gap-2.5 mt-3">
              <SocialButton icon={<Linkedin className="w-3.5 h-3.5" />} />
              <SocialButton icon={<Twitter className="w-3.5 h-3.5" />} />
              <SocialButton icon={<Facebook className="w-3.5 h-3.5" />} />
              <SocialButton icon={<LinkIcon className="w-3.5 h-3.5" />} />
            </div>
          </div>
        </aside>

      </main>
      
      <Footer />
    </div>
  );
};

// Helper Components
const Share2Icon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

const SocialButton = ({ icon }: { icon: React.ReactNode }) => (
  <div className="w-9 h-9 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748b] cursor-pointer transition-all hover:bg-[#2563eb] hover:text-white">
    {icon}
  </div>
);

export default JobDetails;
