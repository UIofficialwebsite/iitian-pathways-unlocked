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

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('pw-strict-engine', {
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
          widget_referrer: window.location.origin,
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

    // PW Keyboard Capture Priority Logic
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in a search/doubt box
      const isTyping = document.activeElement?.tagName === 'INPUT' || 
                       document.activeElement?.tagName === 'TEXTAREA' || 
                       (document.activeElement as HTMLElement)?.isContentEditable;

      if (isTyping) return; // Prevent play/pause while typing

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
      }
      if (e.code === 'ArrowRight') playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
      if (e.code === 'ArrowLeft') playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
    };

    window.addEventListener('keydown', handleKeyDown);

    const tracker = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setCurrentTime(curr);
        if (total > 0) setProgress((curr / total) * 100);
      }
    }, 500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(tracker);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId, isPlaying]);

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
      onMouseMove={resetHUDTimer}
      // PW CONTEXT MENU HARDENING: Completely block browser right-click menu
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed inset-0 z-[9999] bg-black flex overflow-hidden font-sans select-none text-white ${showHUD ? 'cursor-default' : 'cursor-none'}`}
    >
      <div className="relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center">
        
        {/* LAYER 1: THE ENGINE (PW EDGE-CROP SCALE) */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          {/* scale-[1.04] ensures watermark/title area artifacts are outside the viewport bounds */}
          <div id="pw-strict-engine" className="w-full h-full pointer-events-none scale-[1.04]" />
        </div>

        {/* LAYER 2: INTERACTION CLICK-SURFACE (PW PlayToggleLayer) */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer" 
          onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}
        />

        {/* LAYER 3: OPAQUE HUD MASKING */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          {/* HEADER (Solid Mask) */}
          <div className={`w-full bg-black h-24 flex items-center px-10 border-b border-white/10 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="flex items-center gap-8 pointer-events-auto w-full">
              <button onClick={onClose} className="hover:scale-110 transition-transform">
                <ArrowLeft size={32} />
              </button>
              <h1 className="text-2xl font-bold truncate max-w-4xl">{title}</h1>
            </div>
          </div>

          {/* FOOTER (Solid Mask) */}
          <div className={`w-full bg-black h-48 flex flex-col justify-center px-12 border-t border-white/10 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="w-full pointer-events-auto">
              
              <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-10 cursor-pointer group" onClick={handleSeek}>
                <div className="absolute h-full bg-[#5a4bda] rounded-full transition-all" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-14">
                  <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}>
                    {isPlaying ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" />}
                  </button>

                  <div className="flex gap-10 items-center">
                    <RotateCcw size={36} className="cursor-pointer hover:text-[#5a4bda]" onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                    <RotateCw size={36} className="cursor-pointer hover:text-[#5a4bda]" onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                  </div>

                  <div className="flex items-center gap-6">
                    <button onClick={() => {
                        const nextMuted = !isMuted;
                        setIsMuted(nextMuted);
                        nextMuted ? playerRef.current.mute() : playerRef.current.unMute();
                    }}>
                        {isMuted ? <VolumeX size={32} /> : <Volume2 size={32} />}
                    </button>
                    <span className="text-lg font-medium opacity-80 tabular-nums">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-12 text-white/60">
                   <Settings size={34} className="cursor-pointer hover:text-white" />
                   <List 
                     size={34} 
                     className={`cursor-pointer transition-colors ${showTimeline ? 'text-[#5a4bda]' : 'hover:text-white'}`} 
                     onClick={toggleTimeline} 
                   />
                   <Expand 
                     size={34} 
                     className="cursor-pointer hover:text-white" 
                     onClick={() => {
                        if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
                        else document.exitFullscreen();
                     }} 
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR: PERSISTENT TIMELINE */}
      {showTimeline && (
        <aside className="w-[480px] h-full bg-white text-black z-40 animate-in slide-in-from-right duration-300 shadow-2xl border-l border-gray-100 flex flex-col">
          <div className="p-10 border-b flex justify-between items-center bg-gray-50/50">
            <span className="font-extrabold text-3xl tracking-tight">Timeline</span>
            <button onClick={toggleTimeline} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X size={28} className="opacity-40" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-4">
            {timelines.map((item, i) => (
              <div 
                key={i} 
                className="group p-6 hover:bg-[#f8f7ff] cursor-pointer rounded-3xl flex justify-between items-center border border-transparent hover:border-[#5a4bda]/10 transition-all"
                onClick={() => playerRef.current.seekTo(item.time)}
              >
                <span className="font-bold text-xl text-gray-700 group-hover:text-black">{item.label}</span>
                <span className="text-[#5a4bda] font-black bg-[#5a4bda]/5 px-4 py-2 rounded-xl text-sm">
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
