import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, 
  Volume2, VolumeX, List, Expand, X, Settings, Check 
} from 'lucide-react';

const VideoPlayer = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // PW PERSISTENCE: Save UI state to SessionStorage so tab changes don't reset placement
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [showTimeline, setShowTimeline] = useState(() => {
    return sessionStorage.getItem('pw_timeline_active') === 'true';
  });
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Persistent Toggle
  const toggleTimeline = () => {
    const next = !showTimeline;
    setShowTimeline(next);
    sessionStorage.setItem('pw_timeline_active', String(next));
  };

  // PW EXACT AUTO-HIDE: Controls hide after 3s of inactivity, cursor also hides
  const handleInactivity = () => {
    setShowHUD(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => {
        // If mouse is over Header or Footer area, don't hide
        setShowHUD(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('pw-strict-engine', {
        videoId: videoId,
        host: 'https://www.youtube.com', // Fixes Origin Error
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          origin: window.location.origin // Essential for Vercel
        },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            const state = e.data;
            setIsPlaying(state === 1);
            if (state === 1) {
              setHasStarted(true);
              // Trigger hide timer on first play
              hideTimer.current = setTimeout(() => setShowHUD(false), 3000);
            } else {
              setShowHUD(true); // Always show when paused
            }
          }
        }
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    const syncProgress = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setCurrentTime(curr);
        setDuration(total);
        if (total > 0) setProgress((curr / total) * 100);
      }
    }, 400);

    return () => {
      clearInterval(syncProgress);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      playerRef.current?.destroy();
    };
  }, [videoId]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleInactivity}
      className={`fixed inset-0 z-[1000] bg-black flex overflow-hidden font-sans select-none text-white ${showHUD ? 'cursor-default' : 'cursor-none'}`}
    >
      <div className="relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center">
        
        {/* 1. THE ENGINE (Isolated pointer events) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          {/* This pointer-events-none is what kills the YouTube branding forever */}
          <div id="pw-strict-engine" className="w-full h-full pointer-events-none scale-100" />
        </div>

        {/* 2. THE DITTO PW INTERACTION LAYER (vjs-play-toggle-layer)
            This is the physical wall. Mouse never touches the iframe. */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer" 
          onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}
        />

        {/* 3. PHYSICAL HUD BARRIERS (Z-20) */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          {/* TOP BAR BARRIER (Solid Opaque) */}
          <div className={`w-full bg-black h-20 flex items-center px-8 border-b border-white/5 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="flex items-center gap-6 pointer-events-auto w-full">
              <button onClick={onClose} className="hover:opacity-60 transition-opacity"><ArrowLeft size={28} /></button>
              <h1 className="text-xl font-bold tracking-tight truncate max-w-2xl">{title}</h1>
            </div>
          </div>

          {/* BOTTOM BAR BARRIER (Solid Opaque) */}
          <div className={`w-full bg-black h-36 flex flex-col justify-center px-10 border-t border-white/5 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="w-full pointer-events-auto">
              
              {/* Progress Scrubber */}
              <div className="relative w-full h-1.5 bg-white/10 rounded-full mb-8 cursor-pointer group" onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const pos = (e.clientX - rect.left) / rect.width;
                 playerRef.current.seekTo(pos * duration);
              }}>
                <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-xl scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-10">
                  <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}>
                    {isPlaying ? <Pause size={38} fill="white" /> : <Play size={38} fill="white" />}
                  </button>
                  <div className="flex gap-8">
                    <RotateCcw size={28} className="hover:text-blue-500" onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                    <RotateCw size={28} className="hover:text-blue-500" onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                  </div>
                  <span className="text-sm font-bold opacity-60 tabular-nums">
                    {Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2, '0')} / {Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-10">
                  <Settings size={26} className="opacity-40" />
                  <List size={26} className={`cursor-pointer ${showTimeline ? 'text-blue-500' : ''}`} onClick={toggleTimeline} />
                  <Expand size={26} className="cursor-pointer" onClick={() => containerRef.current?.requestFullscreen()} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PERSISTENT SIDEBAR */}
      {showTimeline && (
        <aside className="w-[420px] h-full bg-white text-black z-40 animate-in slide-in-from-right duration-300 border-l border-gray-200">
          <div className="p-6 border-b flex justify-between items-center">
            <span className="font-black text-xl tracking-tighter">Timeline</span>
            <X size={24} className="cursor-pointer opacity-30 hover:opacity-100" onClick={toggleTimeline} />
          </div>
          <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-100px)]">
            {timelines.map((t, i) => (
              <div key={i} className="p-4 hover:bg-gray-50 cursor-pointer rounded-2xl flex justify-between items-center transition-all" onClick={() => playerRef.current.seekTo(t.time)}>
                <span className="font-semibold text-gray-700">{t.label}</span>
                <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded text-xs">{Math.floor(t.time/60)}:{(t.time%60).toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
