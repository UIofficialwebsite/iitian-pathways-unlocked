import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. official YouTube IFrame API doesn't violate your CSP
    const iframeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1&iv_load_policy=3&enablejsapi=1&origin=${window.location.origin}`;

    return () => {
      // Cleanup logic if needed
    };
  }, [videoId]);

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h2>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Secure Player Mode</p>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto p-0 md:p-6">
        {/* PW-STYLE ASPECT RATIO CONTAINER */}
        <div className="aspect-video w-full bg-black shadow-2xl md:rounded-2xl overflow-hidden relative">
          
          {/* THE NATIVE PLAYER */}
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&controls=1&enablejsapi=1&origin=${window.location.origin}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
          
          {/* PW-STYLE SECURITY SHIELDS (BLOCKS LOGO/TITLE CLICKS) */}
          {/* Top Shield: Prevents Title/Share redirection */}
          <div className="absolute top-0 left-0 w-full h-[15%] z-20 bg-transparent cursor-default" 
               onContextMenu={(e) => e.preventDefault()} />
          
          {/* Bottom Right Shield: Specifically blocks the YouTube Logo click */}
          <div className="absolute bottom-0 right-0 w-[18%] h-[12%] z-20 bg-transparent cursor-default"
               onContextMenu={(e) => e.preventDefault()} />

          {/* Bottom Left Shield: Prevents clicking 'Watch on YouTube' text */}
          <div className="absolute bottom-0 left-0 w-[25%] h-[12%] z-20 bg-transparent cursor-default" />
        </div>
        
        <div className="p-6 md:px-0">
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          <div className="h-1 w-20 bg-blue-600 mt-4 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
