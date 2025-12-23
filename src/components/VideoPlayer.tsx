import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, EllipsisVertical, Play, Pause, 
  RotateCcw, RotateCw, Volume2, VolumeX, 
  List, Expand, X, Settings, Check
} from 'lucide-react';

const VideoPlayerShield = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Auto-hide logic: Triggered on mouse move
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    
    // Only start the timer to hide if the video is actually playing
    if (isPlaying) {
      hideTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hides after 3 seconds of no movement
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('yt-shield-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
        },
        events: {
          onReady: (e: any) => e.target.playVideo(),
          onStateChange: (e: any) => {
            const state = e.data;
            setIsPlaying(state === 1);
            if (state === 1) {
              setIsVideoVisible(true);
              // Start the hide timer immediately when video starts
              hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
            } else {
              // Always show controls when paused
              setShowControls(true);
              if (hideTimeout.current) clearTimeout(hideTimeout.current);
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

    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        setCurrentTime(curr);
        setDuration(dur);
        if (dur > 0) setProgress((curr / dur) * 100);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
      playerRef.current?.destroy();
    };
  }, [videoId]);

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove} 
      className={`fixed inset-0 z-[100] bg-black flex overflow-hidden transition-all duration-300 ${showControls ? 'cursor-default' : 'cursor-none'}`}
    >
      <div className="relative flex-1">
        {/* THE VIDEO: Physically blocked from receiving pointer events */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isVideoVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div id="yt-shield-player" className="w-full h-full pointer-events-none scale-100" />
        </div>

        {/* INTERACTION SHIELD: The user clicks this, NOT the YouTube iframe */}
        <div 
          className="absolute inset-0 z-20" 
          onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()} 
        />

        {/* HEADER BARRIER */}
        <div className={`absolute top-0 inset-x-0 z-30 transition-all duration-500 transform ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className="bg-gradient-to-b from-black via-black/80 to-transparent p-6 flex justify-between items-center pointer-events-auto">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><ArrowLeft size={24} /></button>
              <span className="font-bold text-lg text-white drop-shadow-md">{title}</span>
            </div>
            <EllipsisVertical size={24} className="opacity-40" />
          </div>
        </div>

        {/* FOOTER BARRIER */}
        <div className={`absolute bottom-0 inset-x-0 z-30 transition-all duration-500 transform ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-8 pointer-events-auto">
            <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 overflow-hidden cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              playerRef.current.seekTo(((e.clientX - rect.left) / rect.width) * duration);
            }}>
              <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-8">
                <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}>
                  {isPlaying ? <Pause size={30} fill="white" /> : <Play size={30} fill="white" />}
                </button>
                <div className="flex gap-6 opacity-70">
                  <RotateCcw size={24} onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                  <RotateCw size={24} onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                </div>
                <span className="text-sm font-medium tabular-nums opacity-60">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>
              <div className="flex items-center gap-6">
                <Settings size={22} className="opacity-40" />
                <List size={22} className="cursor-pointer" />
                <Expand size={22} onClick={() => containerRef.current?.requestFullscreen()} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
