import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, List, Expand, X } from 'lucide-react';

const VideoPlayerHUD = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hudActive, setHudActive] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHudActive(true);
    
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        setHudActive(false);
      }, 3500); // Hide after 3.5 seconds
    }
  };

  useEffect(() => {
    const init = () => {
      playerRef.current = new (window as any).YT.Player('yt-hud-player', {
        videoId: videoId,
        playerVars: { controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3, disablekb: 1 },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            setIsPlaying(e.data === 1);
            if (e.data === 1) setIsVideoLoaded(true);
          }
        }
      });
    };
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = init;
    } else { init(); }
    return () => playerRef.current?.destroy();
  }, [videoId]);

  return (
    <div 
      onMouseMove={startInactivityTimer}
      className={`fixed inset-0 z-[100] bg-black flex overflow-hidden ${hudActive ? 'cursor-default' : 'cursor-none'}`}
    >
      <div className="relative flex-1">
        {/* YOUTUBE LAYER */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div id="yt-hud-player" className="w-full h-full pointer-events-none" />
        </div>

        {/* CLICK LAYER (Z-20) */}
        <div className="absolute inset-0 z-20" onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()} />

        {/* PW-STYLE TOP BAR (Z-30) - Physical Solid Block */}
        <div className={`absolute top-0 inset-x-0 h-24 bg-black/95 z-30 flex items-center px-8 border-b border-white/5 transition-all duration-700 ${hudActive ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className="flex items-center gap-6 text-white pointer-events-auto">
            <button onClick={onClose}><ArrowLeft size={28} /></button>
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          </div>
        </div>

        {/* PW-STYLE BOTTOM BAR (Z-30) - Physical Solid Block */}
        <div className={`absolute bottom-0 inset-x-0 h-32 bg-black/95 z-30 px-10 flex flex-col justify-center border-t border-white/5 transition-all duration-700 ${hudActive ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className="flex justify-between items-center text-white pointer-events-auto">
            <div className="flex items-center gap-10">
              <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}>
                {isPlaying ? <Pause size={34} fill="white" /> : <Play size={34} fill="white" />}
              </button>
              <div className="flex gap-8">
                <RotateCcw size={28} onClick={() => playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10)} />
                <RotateCw size={28} onClick={() => playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10)} />
              </div>
            </div>
            <div className="flex items-center gap-8">
              <List size={26} className="cursor-pointer" />
              <Expand size={26} className="cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
