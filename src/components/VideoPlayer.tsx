import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose }) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Load the YouTube IFrame API script
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // 2. Define the callback for when the API is ready
    const onPlayerReady = () => {
      if (playerRef.current) playerRef.current.destroy();

      playerRef.current = new window.YT.Player('headless-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,        // Hides all native YT controls
          modestbranding: 1,  // Reduces YouTube branding
          rel: 0,             // Shows related videos only from your channel
          showinfo: 0,        // Deprecated but included for legacy support
          iv_load_policy: 3,  // Hides video annotations
          disablekb: 1,       // Disables keyboard shortcuts
          enablejsapi: 1,     // Required for custom controls
          // origin prevents black screen block by verifying your domain
          origin: window.location.origin 
        },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (event: any) => {
            // Monitor playback status
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          }
        }
      });
    };

    // 3. Handle initialization if API is already loaded or pending
    if (window.YT && window.YT.Player) {
      onPlayerReady();
    } else {
      window.onYouTubeIframeAPIReady = onPlayerReady;
    }

    return () => {
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId]);

  const togglePlay = () => {
    if (isPlaying) playerRef.current?.pauseVideo();
    else playerRef.current?.playVideo();
  };

  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in duration-500">
      {/* Branded Header */}
      <div className="sticky top-0 z-40 bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">{title}</h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1 italic">Unknown IITians Secure Player</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-10">
        {/* VIDEO CONTAINER */}
        <div className="aspect-video w-full bg-black rounded-3xl shadow-2xl overflow-hidden relative border-8 border-slate-900 group">
          
          {/* THE ACTUAL VIDEO ELEMENT */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            <div id="headless-player"></div>
          </div>

          {/* INTERACTION SHIELD
              Blocks user from clicking the video to see "Watch on YouTube" redirection
          */}
          <div className="absolute inset-0 z-10 bg-transparent cursor-default" />

          {/* LOADING STATE */}
          {!isReady && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* BRANDING WATERMARK (Physics Wallah Style) */}
          <div className="absolute top-6 left-6 z-20">
             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-white text-[10px] font-black uppercase italic tracking-tighter">Unknown IITians Official</span>
             </div>
          </div>

          {/* CUSTOM BRANDED CONSOLE */}
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
               <button onClick={togglePlay} className="text-white p-4 hover:scale-110 transition-transform bg-white/10 rounded-full backdrop-blur-sm">
                  {isPlaying ? (
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  ) : (
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
               </button>
               
               <div className="text-white text-[11px] font-black tracking-widest opacity-80 uppercase italic border-r-4 border-blue-600 pr-4">
                  Secured Lecture
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}
