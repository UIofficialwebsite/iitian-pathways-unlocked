import React from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose }) => {
  // Use the official YouTube Privacy Enhanced mode to stay compliant with Vercel CSP
  const videoUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&enablejsapi=1&origin=${window.location.origin}`;

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 p-4 flex items-center gap-4">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em]">Unknown IITians Secure Player</p>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
        {/* PW-STYLE PLAYER CONTAINER 
            We use a double-layer container to trap the YouTube UI outside the rounded borders.
        */}
        <div className="aspect-video w-full bg-black shadow-2xl rounded-2xl overflow-hidden border-4 border-slate-900 relative group">
          
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            {/* THE CROP: 
              We scale the iframe to 110% and shift it by -5% to physically 
              push the YouTube Title bar and Logo outside the hidden overflow area.
            */}
            <iframe
              src={videoUrl}
              className="absolute top-[-5%] left-[-5%] w-[110%] h-[110%] border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            ></iframe>
          </div>

          {/* PW-STYLE SECURITY SHIELDS (BLOCKS CLICKS TO YT BRANDING) */}
          {/* Top Layer Shield: Blocks Title/Share redirection */}
          <div className="absolute top-0 left-0 w-full h-[18%] z-20 bg-transparent cursor-default" />
          
          {/* Bottom Right Shield: Specifically blocks the YouTube Logo area */}
          <div className="absolute bottom-0 right-0 w-[20%] h-[15%] z-20 bg-transparent cursor-default" />

          {/* CUSTOM BRANDING WATERMARK */}
          <div className="absolute bottom-6 right-6 z-30 pointer-events-none">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
              <span className="text-white text-[10px] font-black uppercase tracking-tighter italic">
                Unknown IITians
              </span>
            </div>
          </div>
        </div>
        
        {/* Info Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3">
             <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase">Official Lecture</span>
             <span className="text-slate-400 text-xs">Full HD 1080p</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 max-w-2xl leading-relaxed">
            This lecture is part of the Unknown IITians premium library. Redirection and external links have been disabled for a focused study environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
