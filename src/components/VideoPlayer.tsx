import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose }) => {
  const playerInstance = useRef<any>(null);

  useEffect(() => {
    // 1. Inject Plyr CSS
    if (!document.getElementById('plyr-css')) {
      const link = document.createElement('link');
      link.id = 'plyr-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
      document.head.appendChild(link);
    }

    // 2. Load script and initialize
    const scriptId = 'plyr-js';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initPlayer = () => {
      // @ts-ignore
      if (window.Plyr) {
        if (playerInstance.current) playerInstance.current.destroy();
        
        // @ts-ignore
        playerInstance.current = new window.Plyr('#player', {
          autoplay: true,
          controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
          settings: ['quality', 'speed'],
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            // REQUIRED: origin prevents YouTube from blocking the embed
            origin: window.location.origin 
          }
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js';
      script.async = true;
      script.onload = initPlayer;
      document.body.appendChild(script);
    } else {
      initPlayer();
    }

    return () => {
      if (playerInstance.current) playerInstance.current.destroy();
    };
  }, [videoId]);

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center gap-4">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{title}</h2>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">Now Playing</p>
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto p-0 md:p-6">
        <div className="aspect-video w-full bg-black shadow-2xl md:rounded-2xl overflow-hidden relative group">
          {/* Target for Plyr */}
          <div id="player" data-plyr-provider="youtube" data-plyr-embed-id={videoId}></div>
          
          {/* Shields to block branding clicks */}
          <div className="absolute top-0 left-0 w-full h-[15%] z-20 bg-transparent" />
          <div className="absolute bottom-0 right-0 w-[20%] h-[12%] z-20 bg-transparent" />
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
