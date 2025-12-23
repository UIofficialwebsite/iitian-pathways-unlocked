import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, 
  List, Expand, X, Settings, Volume2, VolumeX 
} from 'lucide-react';

const VideoPlayer = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [showTimeline, setShowTimeline] = useState(() => {
    return sessionStorage.getItem('pw_timeline_state') === 'true';
  });
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const toggleTimeline = () => {
    const next = !showTimeline;
    setShowTimeline(next);
    sessionStorage.setItem('pw_timeline_state', String(next));
  };

  const handleMouseMove = () => {
    setShowHUD(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowHUD(false), 3000);
    }
  };

  // Logic to handle Play/Pause without re-initializing the player
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleInteractionClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x > rect.width / 2) {
        playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
      } else {
        playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
      }
    } else {
      togglePlayPause();
    }
    lastTap.current = now;
  };

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('pw-strict-stream', {
        videoId: videoId,
        host: 'https://www.youtube.com',
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          enablejsapi: 1,
          origin: window.location.origin 
        },
        events: {
          onReady: (e) => {
            e.target.playVideo();
            setDuration(e.target.getDuration());
          },
          onStateChange: (e) => {
            const state = e.data;
            // 1: playing, 2: paused
            setIsPlaying(state === 1);
            if (state === 1) {
              setHasStarted(true);
              resetHUDAutoHider();
            } else {
              setShowHUD(true);
            }
          }
        }
      });
    };

    const resetHUDAutoHider = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setShowHUD(false), 3000);
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = document.activeElement?.tagName === 'INPUT' || 
                       document.activeElement?.tagName === 'TEXTAREA';
      if (isTyping) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
      if (e.code === 'ArrowRight') playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 10);
      if (e.code === 'ArrowLeft') playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 10);
    };

    window.addEventListener('keydown', handleKeyDown);

    const tracker = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        setCurrentTime(curr);
        if (duration > 0) setProgress((curr / duration) * 100);
      }
    }, 400);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(tracker);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      playerRef.current?.destroy();
    };
    // CRITICAL: isPlaying removed from dependencies to stop video reset
  }, [videoId, duration]); 

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    playerRef.current.seekTo(((x / rect.width) * duration));
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed inset-0 z-[2000] bg-black flex overflow-hidden font-sans select-none text-white ${showHUD ? 'cursor-default' : 'cursor-none'}`}
    >
      <div className="video-player-app relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center">
        
        {/* 1. THE STREAM ENGINE */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          {/* Reduced scale to 1.015 to prevent excessive zoom while still hiding 1px edges */}
          <div id="pw-strict-stream" className="w-full h-full pointer-events-none scale-[1.015]" />
        </div>

        {/* 2. THE PW CLICK LAYER */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer" 
          onClick={handleInteractionClick}
        />

        {/* 3. PHYSICAL BARRIER HUD */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          {/* SLIM HEADER - Reduced height */}
          <div className={`w-full bg-black/90 h-14 flex items-center px-6 border-b border-white/10 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="flex items-center gap-4 pointer-events-auto w-full">
              <button onClick={onClose} className="hover:text-[#5a4bda] transition-colors"><ArrowLeft size={24} /></button>
              <h1 className="text-base font-semibold truncate max-w-2xl">{title}</h1>
            </div>
          </div>

          {/* SLIM FOOTER - Reduced height */}
          <div className={`w-full bg-black/90 h-24 flex flex-col justify-center px-8 border-t border-white/10 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="w-full pointer-events-auto">
              
              <div className="relative w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group" onClick={handleSeek}>
                <div className="absolute h-full bg-[#5a4bda] rounded-full" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <button onClick={togglePlayPause}>
                    {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
                  </button>
                  <div className="flex gap-6 items-center">
                    <RotateCcw size={22} className="hover:text-[#5a4bda] transition-colors" onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                    <RotateCw size={22} className="hover:text-[#5a4bda] transition-colors" onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                    <div className="flex items-center gap-3 ml-2">
                        <button onClick={() => {
                            const m = !isMuted;
                            setIsMuted(m);
                            m ? playerRef.current.mute() : playerRef.current.unMute();
                        }}>
                            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                        <span className="text-[11px] font-medium opacity-70 tabular-nums">
                            {Math.floor(currentTime/60)}:{(Math.floor(currentTime%60)).toString().padStart(2, '0')} / {Math.floor(duration/60)}:{(Math.floor(duration%60)).toString().padStart(2, '0')}
                        </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <Settings size={22} className="cursor-pointer opacity-50 hover:opacity-100" />
                  <List size={22} className={`cursor-pointer ${showTimeline ? 'text-[#5a4bda]' : 'opacity-50 hover:opacity-100'}`} onClick={toggleTimeline} />
                  <Expand size={22} className="cursor-pointer opacity-50 hover:opacity-100" onClick={() => {
                    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
                    else document.exitFullscreen();
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTimeline && (
        <aside className="w-[380px] h-full bg-white text-black z-40 animate-in slide-in-from-right duration-300 border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b flex justify-between items-center">
            <span className="font-bold text-lg">Timeline</span>
            <X size={20} className="cursor-pointer opacity-40 hover:opacity-100" onClick={toggleTimeline} />
          </div>
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {timelines.map((t, i) => (
              <div key={i} className="p-4 hover:bg-[#f1efff] cursor-pointer rounded-xl flex justify-between items-center transition-all" onClick={() => playerRef.current.seekTo(t.time)}>
                <span className="text-sm font-medium text-gray-700">{t.label}</span>
                <span className="text-[#5a4bda] font-bold bg-[#5a4bda]/10 px-2 py-1 rounded text-[10px]">{Math.floor(t.time/60)}:{(t.time%60).toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
