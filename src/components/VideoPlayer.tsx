import React, { useEffect, useRef, useState } from 'react';

const VideoPlayer: React.FC<{ videoId: string; title: string; onClose: () => void }> = ({ videoId, title, onClose }) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // API loading logic
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,        // Hides YouTube logo and bottom bar completely
          modestbranding: 1,  // Minimizes branding further
          rel: 0,             // No related videos
          showinfo: 0,        // Hides title and share buttons
          iv_load_policy: 3,  // No annotations
          disablekb: 1,       // Disables keyboard shortcuts to prevent escape
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

    return () => playerRef.current?.destroy();
  }, [videoId]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col animate-in fade-in duration-300">
      {/* Branded Player Header */}
      <div className="p-4 bg-white border-b flex justify-between items-center px-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-none">{title}</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Unknown IITians Internal Player</p>
        </div>
        <button onClick={onClose} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-colors">
          Close Player
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center p-4">
        {/* The Headless Frame with Scaling to Hide Edges */}
        <div className="w-full max-w-5xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800">
            <div id="yt-player" className="absolute inset-0 w-full h-full pointer-events-none scale-105"></div>
            
            {/* THE SECURITY SHIELD: Invisible layer that prevents clicks on hidden branding */}
            <div className="absolute inset-0 z-10 bg-transparent cursor-default" onContextMenu={(e) => e.preventDefault()} />
            
            {/* PW-STYLE CUSTOM WATERMARK */}
            <div className="absolute bottom-6 right-6 z-20 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-white/20">
                    <span className="text-white text-[10px] font-black uppercase italic">Unknown IITians</span>
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
