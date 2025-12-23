import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, 
  List, Expand, X, Volume2, VolumeX, Settings 
} from 'lucide-react';

interface TimelineItem {
  time: number;
  label: string;
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  timelines?: TimelineItem[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0); // PW Double-tap tracking

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const [showTimeline, setShowTimeline] = useState(() => {
    return sessionStorage.getItem('pw_timeline_state') === 'true';
  });

  const toggleTimeline = () => {
    const next = !showTimeline;
    setShowTimeline(next);
    sessionStorage.setItem('pw_timeline_state', String(next));
  };

  const resetHUDTimer = () => {
    setShowHUD(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowHUD(false), 3000);
    }
  };

  // PW Logic: Functional toggle that doesn't trigger re-renders of the Effect
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (playerRef.current.getPlayerState() === 1) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // PW Logic: Double-tap to seek (100% copy from chunk 4269)
  const handleInteractionClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      // Seek Right if clicked right half, Left otherwise
      if (x > rect.width / 2) playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 10);
      else playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 10);
    } else {
      togglePlayPause();
    }
    lastTap.current = now;
  };

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('pw-strict-engine', {
        videoId: videoId,
        host: 'https://www.youtube.com',
        playerVars: {
          autoplay: 1,
          controls: 0,          // Kills native UI
          modestbranding: 1,   // Kills logo
          rel: 0,               // Kills related
          iv_load_policy: 3,    // Kills annotations
          disablekb: 1,         // Kills shortcuts
          fs: 0,                // Kills native fullscr
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (e: any) => {
            e.target.playVideo();
            setDuration(e.target.getDuration());
          },
          onStateChange: (e: any) => {
            const state = e.data;
            setIsPlaying(state === 1);
            if (state === 1) {
              setHasStarted(true);
              resetHUDTimer();
            } else {
              setShowHUD(true);
            }
          }
        }
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '');
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
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        setCurrentTime(curr);
        if (duration > 0) setProgress((curr / duration) * 100);
      }
    }, 500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(tracker);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (playerRef.current) playerRef.current.destroy();
    };
    // videoId is the ONLY dependency. isPlaying is removed to stop the restart bug.
  }, [videoId]); 

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    playerRef.current.seekTo((x / rect.width) * duration);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed inset-0 z-[9999] bg-black flex overflow-hidden font-sans select-none text-white ${showHUD ? 'cursor-default' : 'cursor-none'}`}
    >
      <div className="relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center">
        
        {/* LAYER 1: THE ENGINE - Scale slightly reduced to 1.12 for better framing */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          <div id="pw-strict-engine" className="w-full h-full pointer-events-none scale-[1.12]" />
        </div>

        {/* LAYER 2: INTERACTION CLICK-SURFACE */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer" 
          onClick={handleInteractionClick}
        />

        {/* LAYER 3: OPAQUE HUD MASKING */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          {/* SLIM HEADER - Corrected from h-24 to h-16 */}
          <div className={`w-full bg-black/80 h-16 flex items-center px-8 border-b border-white/10 transition-all duration-500 transform ${showHUD ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="flex items-center gap-6 pointer-events-auto w-full">
              <button onClick={onClose} className="hover:text-[#5a4bda] transition-colors">
                <ArrowLeft size={28} />
              </button>
              <h1 className="text-lg font-bold truncate max-w-4xl">{title}</h1>
            </div>
          </div>

          {/* SLIM FOOTER - Corrected from h-48 to h-32 */}
          <div className={`w-full bg-black/80 h-32 flex flex-col justify-center px-10 border-t border-white/10 transition-all duration-500 transform ${showHUD ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="w-full pointer-events-auto">
              
              <div className="relative w-full h-1 bg-white/20 rounded-full mb-6 cursor-pointer group" onClick={handleSeek}>
                <div className="absolute h-full bg-[#5a4bda] rounded-full transition-all" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-10">
                  <button onClick={togglePlayPause}>
                    {isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" />}
                  </button>

                  <div className="flex gap-8 items-center">
                    <RotateCcw size={28} className="cursor-pointer hover:text-[#5a4bda]" onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                    <RotateCw size={28} className="cursor-pointer hover:text-[#5a4bda]" onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                    <div className="flex items-center gap-4 ml-2">
                        <button onClick={() => {
                            const n = !isMuted;
                            setIsMuted(n);
                            n ? playerRef.current.mute() : playerRef.current.unMute();
                        }}>
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>
                        <span className="text-sm font-bold opacity-70 tabular-nums">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-white/50">
                   <Settings size={28} className="cursor-pointer hover:text-white" />
                   <List 
                     size={28} 
                     className={`cursor-pointer transition-colors ${showTimeline ? 'text-[#5a4bda]' : 'hover:text-white'}`} 
                     onClick={toggleTimeline} 
                   />
                   <Expand 
                     size={28} 
                     className="cursor-pointer hover:text-white" 
                     onClick={() => document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen()} 
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTimeline && (
        <aside className="w-[400px] h-full bg-white text-black z-40 animate-in slide-in-from-right duration-300 border-l border-gray-100 flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
            <span className="font-extrabold text-xl tracking-tight">Timeline</span>
            <button onClick={toggleTimeline} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
              <X size={20} className="opacity-40" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {timelines.map((item, i) => (
              <div 
                key={i} 
                className="group p-4 hover:bg-[#f8f7ff] cursor-pointer rounded-2xl flex justify-between items-center transition-all"
                onClick={() => playerRef.current.seekTo(item.time)}
              >
                <span className="font-bold text-gray-700 group-hover:text-black">{item.label}</span>
                <span className="text-[#5a4bda] font-black bg-[#5a4bda]/5 px-3 py-1 rounded-lg text-xs">
                  {formatTime(item.time)}
                </span>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
