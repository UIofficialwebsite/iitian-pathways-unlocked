import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, 
  List, Expand, X, Settings, Volume2, VolumeX 
} from 'lucide-react';

const VideoPlayer = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  
  // PW Logic: Tracking double-taps for seeking (from 4269.chunk.js)
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

  // PW EXACT AUTO-HIDE logic (from 4269.chunk.js)
  const handleMouseMove = () => {
    setShowHUD(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => {
        setShowHUD(false);
      }, 3000);
    }
  };

  // PW Logic: Double-Tap to Seek on the interaction layer
  const handleInteractionClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x > rect.width / 2) {
        playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
      } else {
        playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
      }
    } else {
      // Single tap logic
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
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
          widget_referrer: window.location.origin,
          origin: window.location.origin 
        },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            const state = e.data;
            setIsPlaying(state === 1);
            if (state === 1) {
              setHasStarted(true);
              if (hideTimer.current) clearTimeout(hideTimer.current);
              hideTimer.current = setTimeout(() => setShowHUD(false), 3000);
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
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }

    // PW Keyboard Capture Priority (from 6165.chunk.js)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in sidebar/search
      const isTyping = document.activeElement?.tagName === 'INPUT' || 
                       document.activeElement?.tagName === 'TEXTAREA' ||
                       (document.activeElement as HTMLElement)?.isContentEditable;
      if (isTyping) return;

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
      if (playerRef.current?.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setCurrentTime(curr);
        setDuration(total);
        if (total > 0) setProgress((curr / total) * 100);
      }
    }, 400);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(tracker);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      playerRef.current?.destroy();
    };
  }, [videoId, isPlaying]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      // PW Logic: Block right-click to hide YT context menu (from 6165.chunk.js)
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed inset-0 z-[2000] bg-black flex overflow-hidden font-sans select-none text-white transition-all duration-300 ${showHUD ? 'cursor-default' : 'cursor-none'}`}
    >
      <div className="video-player-app relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center">
        
        {/* 1. THE STREAM ENGINE (Physically Isolated) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          {/* PW Scale Logic: scale-[1.04] pushes the 1px branding lines outside the overflow-hidden container */}
          <div id="pw-strict-stream" className="w-full h-full pointer-events-none scale-[1.04]" />
        </div>

        {/* 2. THE PW CLICK LAYER */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer" 
          onClick={handleInteractionClick}
        />

        {/* 3. PHYSICAL BARRIER HUD (z-20) */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          {/* HEADER (PW uses standard h-16 or h-20 for masking) */}
          <div className={`w-full bg-black h-16 flex items-center px-8 border-b border-white/5 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="flex items-center gap-6 pointer-events-auto w-full">
              <button onClick={onClose} className="hover:opacity-60 transition-opacity"><ArrowLeft size={28} /></button>
              <h1 className="text-lg font-bold truncate max-w-3xl">{title}</h1>
            </div>
          </div>

          {/* FOOTER (Opaque masking for YT progress bar/watermark) */}
          <div className={`w-full bg-black h-32 flex flex-col justify-center px-10 border-t border-white/5 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="w-full pointer-events-auto">
              
              <div className="relative w-full h-1 bg-white/10 rounded-full mb-6 cursor-pointer group" onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 playerRef.current.seekTo(((e.clientX - rect.left) / rect.width) * duration);
              }}>
                <div className="absolute h-full bg-[#5a4bda] rounded-full transition-all duration-150" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-10">
                  <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}>
                    {isPlaying ? <Pause size={38} fill="white" /> : <Play size={38} fill="white" />}
                  </button>
                  <div className="flex gap-8">
                    <RotateCcw size={28} className="hover:text-[#5a4bda] transition-colors" onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                    <RotateCw size={28} className="hover:text-[#5a4bda] transition-colors" onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => {
                        const muted = !isMuted;
                        setIsMuted(muted);
                        muted ? playerRef.current.mute() : playerRef.current.unMute();
                    }}>
                        {isMuted ? <VolumeX size={26} /> : <Volume2 size={26} />}
                    </button>
                    <span className="text-xs font-bold opacity-60 tabular-nums">
                        {Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2, '0')} / {Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <Settings size={26} className="cursor-pointer opacity-40 hover:opacity-100" />
                  <List size={26} className={`cursor-pointer transition-colors ${showTimeline ? 'text-[#5a4bda]' : 'opacity-40 hover:opacity-100'}`} onClick={toggleTimeline} />
                  <Expand size={26} className="cursor-pointer opacity-40 hover:opacity-100" onClick={() => {
                    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
                    else document.exitFullscreen();
                  }} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* PERSISTENT TIMELINE (State shared with PW SessionStorage) */}
      {showTimeline && (
        <aside className="w-[420px] h-full bg-white text-black z-40 animate-in slide-in-from-right duration-300 border-l border-gray-200 flex flex-col">
          <div className="p-8 border-b flex justify-between items-center bg-gray-50">
            <span className="font-black text-2xl tracking-tighter uppercase">Timeline</span>
            <X size={24} className="cursor-pointer opacity-30 hover:opacity-100" onClick={toggleTimeline} />
          </div>
          <div className="flex-1 p-6 space-y-3 overflow-y-auto">
            {timelines.map((t, i) => (
              <div key={i} className="p-5 hover:bg-[#f1efff]/50 cursor-pointer rounded-2xl flex justify-between items-center group transition-all" onClick={() => playerRef.current.seekTo(t.time)}>
                <span className="font-bold text-gray-700 group-hover:text-black">{t.label}</span>
                <span className="text-[#5a4bda] font-black bg-[#f1efff] px-3 py-1 rounded-lg text-xs">{Math.floor(t.time/60)}:{(t.time%60).toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
