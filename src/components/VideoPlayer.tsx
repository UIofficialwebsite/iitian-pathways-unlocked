import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, RotateCw, 
  List, Expand, X, Volume2, VolumeX, Settings 
} from 'lucide-react';

interface TimelineItem {
  time: number;
  label: string;
}

const VideoPlayer = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [showTimeline, setShowTimeline] = useState(() => sessionStorage.getItem('pw_timeline_state') === 'true');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimeline = () => {
    const next = !showTimeline;
    setShowTimeline(next);
    sessionStorage.setItem('pw_timeline_state', String(next));
  };

  const handleMouseMove = () => {
    setShowHUD(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) hideTimer.current = setTimeout(() => setShowHUD(false), 3000);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === 1) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  useEffect(() => {
    const init = () => {
      playerRef.current = new (window as any).YT.Player('pw-strict-engine', {
        videoId: videoId,
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
          onReady: (e) => setDuration(e.target.getDuration()),
          onStateChange: (e) => {
            setIsPlaying(e.data === 1);
            if (e.data === 1) { setHasStarted(true); handleMouseMove(); }
            else setShowHUD(true);
          }
        }
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = init;
    } else init();

    const track = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const c = playerRef.current.getCurrentTime();
        setCurrentTime(c);
        if (duration > 0) setProgress((c / duration) * 100);
      }
    }, 500);

    return () => { clearInterval(track); playerRef.current?.destroy(); };
  }, [videoId, duration]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onContextMenu={(e) => e.preventDefault()}
      className={`fixed inset-0 z-[9999] bg-black flex overflow-hidden font-sans select-none text-white ${showHUD ? '' : 'cursor-none'}`}
    >
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        
        {/* PW STRICTURE: 
            1. Scale 1.35 pushes the "Watch Later/Share" and "More Videos"shelf completely out of the viewport.
            2. pointer-events-none ensures no hover triggers are sent to the iframe.
        */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full h-full scale-[1.35] origin-center pointer-events-none">
            <div id="pw-strict-engine" className="w-full h-full pointer-events-none" />
          </div>
        </div>

        {/* PW CLICK INTERCEPTOR: Transparent layer that takes all clicks so the iframe stays dead */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer pointer-events-auto" 
          onClick={(e) => {
             const now = Date.now();
             if (now - lastTap.current < 300) {
               const rect = e.currentTarget.getBoundingClientRect();
               if (e.clientX - rect.left > rect.width / 2) playerRef.current?.seekTo(currentTime + 10);
               else playerRef.current?.seekTo(currentTime - 10);
             } else togglePlayPause();
             lastTap.current = now;
          }}
        />

        {/* OPAQUE MASKS: High Z-index solid black bars to hide YouTube artifacts */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          <div className={`w-full bg-black h-16 flex items-center px-8 border-b border-white/10 transition-all duration-500 transform pointer-events-auto ${showHUD ? '' : '-translate-y-full'}`}>
            <button onClick={onClose}><ArrowLeft size={28} /></button>
            <h1 className="ml-6 text-lg font-bold truncate">{title}</h1>
          </div>

          <div className={`w-full bg-black h-32 flex flex-col justify-center px-10 border-t border-white/10 transition-all duration-500 transform pointer-events-auto ${showHUD ? '' : 'translate-y-full'}`}>
            <div className="w-full">
              <div className="relative w-full h-1 bg-white/20 rounded-full mb-6 cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                playerRef.current?.seekTo(((e.clientX - rect.left) / rect.width) * duration);
              }}>
                <div className="absolute h-full bg-[#5a4bda] rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-10">
                  <button onClick={togglePlayPause}>{isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" />}</button>
                  <RotateCcw size={26} onClick={() => playerRef.current?.seekTo(currentTime - 10)} />
                  <RotateCw size={26} onClick={() => playerRef.current?.seekTo(currentTime + 10)} />
                  <span className="text-sm font-bold opacity-70 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  <List size={28} className={showTimeline ? 'text-[#5a4bda]' : ''} onClick={toggleTimeline} />
                  <Expand size={28} onClick={() => document.fullscreenElement ? document.exitFullscreen() : containerRef.current?.requestFullscreen()} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTimeline && (
        <aside className="w-[400px] h-full bg-white text-black z-40 border-l border-gray-100 flex flex-col">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50">
            <span className="font-extrabold text-xl uppercase">Timeline</span>
            <X size={20} className="cursor-pointer opacity-40" onClick={toggleTimeline} />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {timelines.map((item, i) => (
              <div key={i} className="group p-4 hover:bg-[#f8f7ff] cursor-pointer rounded-2xl flex justify-between items-center transition-all" onClick={() => playerRef.current?.seekTo(item.time)}>
                <span className="font-bold text-gray-700">{item.label}</span>
                <span className="text-[#5a4bda] font-black bg-[#5a4bda]/5 px-3 py-1 rounded-lg text-xs">{formatTime(item.time)}</span>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
