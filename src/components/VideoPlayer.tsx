import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose }) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // 1. Load API Script
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player('yt-headless-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,        // REMOVE: Native YouTube Console
          modestbranding: 1,  // REMOVE: Branding Logo
          rel: 0,             // REMOVE: Related Videos
          showinfo: 0,        // REMOVE: Video Title/Share
          iv_load_policy: 3,  // REMOVE: Annotations
          disablekb: 1,       // DISABLE: Keyboard redirection
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
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
    <div className="min-h-screen bg-white flex flex-col animate-in fade-in duration-500">
      {/* Branded Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-none">{title}</h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Unknown IITians Internal Player</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
        {/* PW-STYLE HEADLESS SHELL */}
        <div className="aspect-video w-full max-w-6xl bg-black rounded-3xl shadow-2xl overflow-hidden relative border-8 border-slate-900 group">
          
          {/* THE PLAYER (NO CONTROLS) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none scale-105">
            <div id="yt-headless-player"></div>
          </div>

          {/* THE SECURITY SHIELD: Blocks clicks to invisible YouTube branding */}
          <div className="absolute inset-0 z-10 bg-transparent cursor-default" onContextMenu={(e) => e.preventDefault()} />

          {/* CUSTOM BRANDING: Unknown IITians Logo Overlay */}
          <div className="absolute top-6 left-6 z-20">
             <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-2">
                <span className="text-white text-[10px] font-black uppercase italic tracking-tighter">Unknown IITians</span>
             </div>
          </div>

          {/* CUSTOM CONSOLE: Appears on hover */}
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/90 to-transparent z-30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
               <button onClick={togglePlay} className="text-white p-4 hover:scale-110 transition-transform bg-white/10 rounded-full backdrop-blur-sm">
                  {isPlaying ? (
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  ) : (
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
               </button>
               <div className="text-white text-[11px] font-black tracking-widest opacity-80 uppercase border-r-4 border-blue-600 pr-4">
                  Secured Study Mode
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
