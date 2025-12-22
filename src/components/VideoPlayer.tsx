import React, { useEffect } from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose }) => {
  useEffect(() => {
    // 1. Load Plyr CSS from CDN
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
    document.head.appendChild(link);

    // 2. Load Plyr JS from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore - Initialize the player on our target div
      new window.Plyr('#player', {
        autoplay: true,
        controls: [
          'play-large', 'play', 'progress', 'current-time', 
          'mute', 'volume', 'settings', 'fullscreen'
        ],
        settings: ['quality', 'speed'], // PW-style speed/quality access
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1
        }
      });
    };
    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(link);
      const scripts = document.body.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('plyr')) {
          document.body.removeChild(scripts[i]);
        }
      }
    };
  }, [videoId]);

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-300">
      {/* Dedicated Player Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-4 flex items-center gap-4">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          title="Back to Library"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h2>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Now Playing</p>
        </div>
      </div>

      {/* Full Width Video Area */}
      <div className="w-full max-w-6xl mx-auto p-0 md:p-6">
        <div className="aspect-video w-full bg-black shadow-2xl md:rounded-2xl overflow-hidden relative group">
          
          {/* PLYR TARGET DIV */}
          <div id="player" data-plyr-provider="youtube" data-plyr-embed-id={videoId}></div>
          
          {/* SECURITY SHIELDS (Like PW)
              These invisible layers block clicks on the YouTube branding while 
              leaving the center and controls interactive.
          */}
          {/* Top Shield: Blocks Title/Share clicks */}
          <div className="absolute top-0 left-0 w-full h-[15%] z-20 bg-transparent cursor-default" />
          
          {/* Bottom Right Shield: Blocks YouTube Logo redirection */}
          <div className="absolute bottom-0 right-0 w-[20%] h-[12%] z-20 bg-transparent cursor-default" />
          
        </div>
        
        {/* Additional Video Info */}
        <div className="p-6 md:px-0">
          <h1 className="text-2xl font-extrabold text-gray-900">{title}</h1>
          <div className="h-1 w-20 bg-blue-600 mt-4 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
