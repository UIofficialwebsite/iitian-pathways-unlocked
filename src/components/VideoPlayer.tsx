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
        playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 10);
      } else {
        playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 10);
      }
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
          controls: 0,           // Kills bottom bar
          modestbranding: 1,    // Kills large logo
          rel: 0,                // Kills related videos
          iv_load_policy: 3,     // Kills annotations
          disablekb: 1,          // Kills keyboard shortcuts
          fs: 0,                 // Kills fullscreen button
          autohide: 1,           // Hide controls automatically
          enablejsapi: 1,
          origin: window.location.origin 
        },
        events: {
          onReady: (e) => {
            e.target.playVideo();
            setDuration(e.target.getDuration());
          },
          onStateChange: (e) => {
            setIsPlaying(e.data === 1);
            if (e.data === 1) {
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlayPause(); }
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
  }, [duration]); 

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed inset-0 z-[2000] bg-black flex overflow-hidden font-sans select-none text-white ${showHUD ? 'cursor-default' : 'cursor-none'}`}
    >
      <div className="relative flex-1 bg-black overflow-hidden flex flex-col items-center justify-center">
        
        {/* PW CROP LOGIC: The iframe is scaled and taller than the container to push titles/watermarks out of view */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full h-full scale-[1.15] origin-center">
             <div id="pw-strict-engine" className="w-full h-full pointer-events-none" />
          </div>
        </div>

        {/* PW SHIELD: This layer prevents any hover triggers or clicks from reaching YouTube */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer pointer-events-auto" 
          onClick={handleInteractionClick}
        />

        {/* HUD: Solid masking blocks */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          <div className={`w-full bg-black h-16 flex items-center px-6 border-b border-white/10 transition-all duration-500 transform pointer-events-auto ${showHUD ? 'translate-y-0' : '-translate-y-full'}`}>
            <button onClick={onClose}><ArrowLeft size={24} /></button>
            <h1 className="ml-4 text-base font-semibold truncate">{title}</h1>
          </div>

          <div className={`w-full bg-black h-28 flex flex-col justify-center px-8 border-t border-white/10 transition-all duration-500 transform pointer-events-auto ${showHUD ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="w-full">
              <div className="relative w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer" onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 playerRef.current?.seekTo(((e.clientX - rect.left) / rect.width) * duration);
              }}>
                <div className="absolute h-full bg-[#5a4bda] rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <button onClick={togglePlayPause}>{isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}</button>
                  <RotateCcw size={22} onClick={() => playerRef.current?.seekTo(currentTime - 10)} />
                  <RotateCw size={22} onClick={() => playerRef.current?.seekTo(currentTime + 10)} />
                  <span className="text-xs tabular-nums opacity-70">
                    {Math.floor(currentTime/60)}:{(Math.floor(currentTime%60)).toString().padStart(2, '0')} / {Math.floor(duration/60)}:{(Math.floor(duration%60)).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <Settings size={22} />
                  <List size={22} className={showTimeline ? 'text-[#5a4bda]' : ''} onClick={toggleTimeline} />
                  <Expand size={22} onClick={() => document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen()} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTimeline && (
        <aside className="w-[380px] h-full bg-white text-black z-40 border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b flex justify-between items-center">
            <span className="font-bold">Timeline</span>
            <X size={20} className="cursor-pointer" onClick={toggleTimeline} />
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {timelines.map((t, i) => (
              <div key={i} className="p-4 hover:bg-gray-100 cursor-pointer rounded-xl flex justify-between" onClick={() => playerRef.current?.seekTo(t.time)}>
                <span className="text-sm">{t.label}</span>
                <span className="text-xs text-[#5a4bda]">{Math.floor(t.time/60)}:{(t.time%60).toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
