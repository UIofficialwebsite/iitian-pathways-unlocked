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

  // Normalize data structures
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

  // Inject Manrope font dynamically
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

  const jobReference = `GB-${job.id.slice(0, 4).toUpperCase()}`;

  return (
    <div className="bg-[#f8fafc] min-h-screen font-['Manrope'] text-[#475569] leading-[1.6]">
      <NavBar />

      {/* HERO HEADER */}
      <header className="relative pt-[100px] pb-[140px] border-b border-[#e2e8f0] bg-white">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2000')" }}
        ></div>
        <div 
          className="absolute inset-0 z-0"
          style={{ background: "linear-gradient(to right, rgba(255,255,255,0.98) 10%, rgba(255,255,255,0.6) 100%)" }}
        ></div>

        <div className="max-w-[1140px] mx-auto px-6 relative z-10">
          <nav className="text-[13px] font-[600] text-[#2563eb] mb-6 tracking-[0.01em]">
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/career/openings')}>Open Jobs</span>
            <span className="text-[#94a3b8] mx-2 font-[400]">/</span>
            <span>{job.department || 'General'}</span>
            <span className="text-[#94a3b8] mx-2 font-[400]">/</span>
            <span className="text-[#64748b]">{job.title}</span>
          </nav>

          <h1 className="text-[34px] font-[800] text-[#0f172a] mb-3 tracking-[-0.02em] leading-tight">
            {job.title}
          </h1>
          
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

          <div className="flex gap-3">
            <a 
              href={job.application_url || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-7 py-3 rounded-lg font-[700] transition-all shadow-[0_4px_6px_-1px_rgba(37,99,235,0.2)] hover:-translate-y-px inline-block text-center no-underline"
            >
              Apply Now
            </a>
            <button className="bg-white border border-[#e2e8f0] px-3.5 py-2.5 rounded-lg flex items-center justify-center hover:bg-[#f1f5f9] transition-all text-[#475569]">
              <Share2Icon />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT LAYOUT */}
      <main className="max-w-[1140px] mx-auto px-6 relative z-10 -mt-[80px] pb-[100px] grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        
        {/* Main Job Info Card */}
        <section className="bg-white border border-[#e2e8f0] rounded-xl p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.04)]">
          <h2 className="text-[18px] font-[700] text-[#0f172a] mb-6">Job Description</h2>
          
          <div className="text-[16px] text-[#475569] leading-[1.8] space-y-6">
            <p className="whitespace-pre-line">
              {job.description}
            </p>

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
              <p className="text-[15px] font-[600] text-[#0f172a]">{updatedDate}</p>
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

          {/* SHARE THIS OPPORTUNITY CARD */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] w-full">
            <h2 className="text-[16px] font-[700] text-[#0f172a] mb-5">Share the opportunity</h2>
            
            <div className="flex gap-3 flex-wrap">
              {/* LinkedIn */}
              <button 
                title="Share on LinkedIn"
                className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#0a66c2] hover:text-white hover:-translate-y-[2px]"
              >
                <span className="text-[14px] font-[800] leading-none">in</span>
              </button>

              {/* X (Twitter) */}
              <button 
                title="Share on X"
                className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#000000] hover:text-white hover:-translate-y-[2px]"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </button>

              {/* Facebook */}
              <button 
                title="Share on Facebook"
                className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#1877f2] hover:text-white hover:-translate-y-[2px]"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
                </svg>
              </button>

              {/* Email */}
              <button 
                title="Share via Email"
                className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#ea4335] hover:text-white hover:-translate-y-[2px]"
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </button>

              {/* WhatsApp - Fixed Icon */}
              <button 
                title="Share on WhatsApp"
                className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#25d366] hover:text-white hover:-translate-y-[2px]"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.694c1.025.558 1.979.804 3.3.804 5.375 0 8.542-4.43 5.305-7.792-1.37-1.425-3.321-2.269-5.799-2.269zm0 9.875c-1.077 0-1.921-.301-2.75-.794l-.196-.117-1.579.414.422-1.54-.127-.202c-.551-.875-.769-1.556-.769-2.296 0-2.31 1.88-4.191 4.193-4.191 1.119 0 2.172.436 2.964 1.228 1.579 1.579 1.637 4.193.072 5.758-.809.809-1.393 1.242-2.23 1.242zm-2.029-3.23c-.112-.196-.411-.196-.86.002-.449.198-1.479.734-1.708.858-.229.124-.396.186-.566.452-.171.266-.653.844-.801 1.012-.148.168-.295.188-.547.062-.253-.126-1.07-.395-2.038-1.258-.752-.671-1.26-1.5-1.408-1.754-.148-.254-.016-.391.11-.518.114-.114.254-.296.381-.444.127-.148.169-.254.254-.423.085-.169.042-.317-.021-.444-.064-.127-.57-1.374-.781-1.881-.206-.494-.415-.427-.57-.435-.148-.007-.317-.008-.486-.008-.169 0-.444.063-.676.317-.232.254-.888.868-.888 2.116 0 1.248.909 2.454 1.035 2.622.127.169 1.789 2.73 4.333 3.829.605.261 1.077.417 1.446.533.607.193 1.16.166 1.597.101.487-.072 1.499-.613 1.711-1.205.211-.592.211-1.1.148-1.205-.063-.106-.232-.169-.486-.296z"></path>
                </svg>
              </button>

              {/* Copy Link */}
              <button 
                title="Copy Link"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#64748b] flex items-center justify-center transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#334155] hover:text-white hover:-translate-y-[2px]"
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
              </button>
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

export default JobDetails;
