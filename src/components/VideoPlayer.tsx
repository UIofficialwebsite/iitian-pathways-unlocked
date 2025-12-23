import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, RotateCw, List, Expand, Settings, Volume2 } from 'lucide-react';

const VideoPlayer = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHUD, setShowHUD] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // PW Logic: Hide controls after 3s of no movement ONLY if playing
  const resetTimer = () => {
    setShowHUD(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowHUD(false), 3000);
    }
  };

  useEffect(() => {
    const init = () => {
      playerRef.current = new (window as any).YT.Player('pw-video-engine', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          showinfo: 0
        },
        events: {
          onReady: (e: any) => e.target.playVideo(),
          onStateChange: (e: any) => {
            const state = e.data;
            setIsPlaying(state === 1);
            if (state === 1) setHasStarted(true); // Only reveal when actually playing
          }
        }
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = init;
    } else {
      init();
    }

    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setCurrentTime(curr);
        setDuration(total);
        if (total > 0) setProgress((curr / total) * 100);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      playerRef.current?.destroy();
    };
  }, [videoId]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={resetTimer}
      className={`fixed inset-0 z-[1000] bg-black flex overflow-hidden transition-all duration-300 ${showHUD ? 'cursor-default' : 'cursor-none'}`}
    >
      {/* THE PW SHELL CONTAINER */}
      <div className="video-player-app flex-1 relative flex flex-col items-center justify-center">
        
        {/* 1. THE VIDEO ENGINE: scale-100 but functionally isolated */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${hasStarted ? 'opacity-100' : 'opacity-0'}`}>
          <div id="pw-video-engine" className="w-full h-full pointer-events-none" />
        </div>

        {/* 2. THE DEAD-ZONE SHIELD: This is the 'vjs-play-toggle-layer' 
            It physically sits between the video and the UI. It prevents hover events from 
            reaching the iframe, meaning the Title/Watermark NEVER wake up. */}
        <div 
          className="absolute inset-0 z-10 cursor-pointer" 
          onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}
        />

        {/* 3. INTERACTIVE LAYER WRAPPER: Matches PW structure */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          {/* PLAYER HEADER: Solid black physical barrier for Title/Share */}
          <div className={`player-header w-full h-24 bg-black/90 flex items-center px-8 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="flex items-center gap-6 text-white pointer-events-auto w-full">
              <button onClick={onClose}><ArrowLeft size={28} /></button>
              <h1 className="text-xl font-bold truncate">{title}</h1>
            </div>
          </div>

          {/* PLAYER FOOTER: Solid black physical barrier for Watermark */}
          <div className={`player-footer w-full h-32 bg-black/95 flex flex-col justify-center px-10 transition-all duration-500 transform ${showHUD ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <div className="w-full flex flex-col pointer-events-auto">
              
              {/* Custom PW Progress Bar */}
              <div className="relative h-1.5 w-full bg-white/20 rounded-full mb-6 cursor-pointer" onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 playerRef.current.seekTo(((e.clientX - rect.left) / rect.width) * duration);
              }}>
                <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
              </div>

              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-10">
                  <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}>
                    {isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" />}
                  </button>
                  <div className="flex gap-8">
                    <RotateCcw size={28} onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                    <RotateCw size={28} onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                  </div>
                  <span className="text-sm font-bold opacity-60 tabular-nums">
                    {Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2, '0')} / {Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex items-center gap-8">
                  <Settings size={26} className="opacity-40" />
                  <List size={26} className="cursor-pointer" />
                  <Expand size={26} className="cursor-pointer" onClick={() => containerRef.current?.requestFullscreen()} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
