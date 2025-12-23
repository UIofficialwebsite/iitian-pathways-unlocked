import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, 
  List, Expand, X, Settings, Volume2, VolumeX 
} from 'lucide-react';

const VideoPlayer = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // PW PERSISTENCE: State persists through tab changes
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

  // PW EXACT AUTO-HIDE logic
  const handleMouseMove = () => {
    setShowHUD(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => {
        // Only hide if the mouse is NOT over the header or footer interaction zones
        setShowHUD(false);
      }, 3000);
    }
  };

  useEffect(() => {
    const initPlayer = () => {
      // Fixes the www-widgetapi origin error
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
          origin: window.location.origin // FIX: Required for Vercel Origin error
        },
        events: {
          onReady: (e) => e.target.playVideo(),
          onStateChange: (e) => {
            const state = e.data;
            setIsPlaying(state === 1);
            if (state === 1) {
              setHasStarted(true);
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
      clearInterval(tracker);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      playerRef.current?.destroy();
    };
  }, [videoId]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-[2000] bg-black flex overflow-hidden font-sans select-none text-white transition-all duration-300 ${showHUD ? 'cursor-default' : 'cursor-none'}`}
    >
      <div className="video-player-app relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center">
        
        {/* 1. THE STREAM ENGINE (Physically Isolated) */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          {/* pointer-events-none is the ONLY way to kill YT's internal hover branding forever */}
          <div id="pw-strict-stream" className="w-full h-full pointer-events-none scale-100" />
        </div>

        {/* 2. THE PW CLICK LAYER (vjs-play-toggle-layer) */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer" 
          onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}
        />

        {/* 3. PHYSICAL BARRIER HUD (z-20) */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          {/* HEADER (Solid Block over Title Area) */}
          <div className={`w-full bg-black h-20 flex items-center px-8 border-b border-white/5 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="flex items-center gap-6 pointer-events-auto w-full">
              <button onClick={onClose} className="hover:opacity-60"><ArrowLeft size={28} /></button>
              <h1 className="text-xl font-bold truncate max-w-3xl">{title}</h1>
            </div>
          </div>

          {/* FOOTER (Solid Block over Watermark Area) */}
          <div className={`w-full bg-black h-40 flex flex-col justify-center px-10 border-t border-white/5 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="w-full pointer-events-auto">
              
              <div className="relative w-full h-1 bg-white/10 rounded-full mb-8 cursor-pointer group" onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 playerRef.current.seekTo(((e.clientX - rect.left) / rect.width) * duration);
              }}>
                <div className="absolute h-full bg-[#5a4bda] rounded-full" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-12">
                  <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}>
                    {isPlaying ? <Pause size={44} fill="white" /> : <Play size={44} fill="white" />}
                  </button>
                  <div className="flex gap-10">
                    <RotateCcw size={32} className="hover:text-[#5a4bda]" onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                    <RotateCw size={32} className="hover:text-[#5a4bda]" onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => {
                        const muted = !isMuted;
                        setIsMuted(muted);
                        muted ? playerRef.current.mute() : playerRef.current.unMute();
                    }}>
                        {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                    </button>
                    <span className="text-sm font-bold opacity-60 tabular-nums">
                        {Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2, '0')} / {Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <List size={30} className={`cursor-pointer ${showTimeline ? 'text-[#5a4bda]' : 'opacity-40'}`} onClick={toggleTimeline} />
                  <Expand size={30} className="cursor-pointer opacity-40 hover:opacity-100" onClick={() => containerRef.current?.requestFullscreen()} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* PERSISTENT TIMELINE */}
      {showTimeline && (
        <aside className="w-[450px] h-full bg-white text-black z-40 animate-in slide-in-from-right duration-300 border-l border-gray-200">
          <div className="p-8 border-b flex justify-between items-center">
            <span className="font-black text-2xl">Timeline</span>
            <X size={24} className="cursor-pointer opacity-30" onClick={toggleTimeline} />
          </div>
          <div className="p-6 space-y-3 overflow-y-auto max-h-[calc(100vh-100px)]">
            {timelines.map((t, i) => (
              <div key={i} className="p-5 hover:bg-gray-50 cursor-pointer rounded-2xl flex justify-between items-center border border-transparent hover:border-gray-100" onClick={() => playerRef.current.seekTo(t.time)}>
                <span className="font-bold text-gray-700">{t.label}</span>
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
