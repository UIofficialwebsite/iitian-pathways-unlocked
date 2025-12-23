import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, EllipsisVertical, Play, Pause, 
  RotateCcw, RotateCw, Volume2, VolumeX, 
  List, Expand, X, Settings, Check
} from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  timelines?: { time: number; label: string }[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, timelines = [] }) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('yt-player-headless', {
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
            const YTState = (window as any).YT.PlayerState;
            setIsPlaying(e.data === YTState.PLAYING);
            // Wait for playing to start before revealing to hide initial YT logos
            if (e.data === YTState.PLAYING) setIsVideoVisible(true);
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
      playerRef.current?.destroy();
    };
  }, [videoId]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex text-white overflow-hidden font-sans select-none">
      <div className="relative flex-1 overflow-hidden bg-black">
        
        {/* 1. THE VIDEO: Forced scale-100 and pointer-events-none */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isVideoVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div id="yt-player-headless" className="w-full h-full scale-100 pointer-events-none" />
        </div>

        {/* 2. THE INTERACTIVE SHIELD (Z-20): 
            This layer sits over the video. Since the video has pointer-events-none, 
            the user only interacts with this DIV. The YT title and watermark 
            NEVER receive a hover event, so they stay hidden. */}
        <div 
          className="absolute inset-0 z-20 cursor-pointer" 
          onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}
        />

        {/* 3. THE CUSTOM SHELL HUD (Z-30): Physical Barriers */}
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between">
          
          {/* TOP BAR BARRIER: Solid black background at the very top to mask the 'Watch Later/Share' area */}
          <div className="w-full bg-black/90 pointer-events-auto border-b border-white/5 shadow-2xl">
            <div className="p-5 flex justify-between items-center bg-gradient-to-b from-black to-transparent">
              <button onClick={onClose} className="flex items-center gap-4 hover:opacity-80 transition">
                <ArrowLeft size={24} />
                <span className="font-bold text-lg">{title}</span>
              </button>
              <div className="flex gap-4 opacity-50">
                <EllipsisVertical size={24} />
              </div>
            </div>
          </div>

          {/* BOTTOM BAR BARRIER: Solid black area to physically block the YouTube Watermark */}
          <div className="w-full bg-black/90 pointer-events-auto border-t border-white/5">
            <div className="p-6 bg-gradient-to-t from-black to-transparent">
              {/* Custom Scrubber */}
              <div className="w-full h-1 bg-white/20 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${progress}%` }} />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()}>
                    {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" />}
                  </button>
                  <div className="flex gap-6">
                    <RotateCcw size={24} className="hover:text-blue-400" onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                    <RotateCw size={24} className="hover:text-blue-400" onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                  </div>
                  <span className="text-sm font-bold tabular-nums opacity-60">
                    {Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2, '0')} / {Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <Settings size={22} className="opacity-50" />
                  <List size={22} className="cursor-pointer hover:text-blue-400" onClick={() => setShowTimeline(!showTimeline)} />
                  <Expand size={22} className="hover:text-blue-400" onClick={() => containerRef.current?.requestFullscreen()} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Sidebar */}
      {showTimeline && (
        <aside className="w-[400px] h-full bg-white text-black z-40 animate-in slide-in-from-right duration-300 border-l border-gray-200">
          <div className="p-6 border-b flex justify-between items-center">
            <span className="font-black text-xl tracking-tight">Timeline</span>
            <X size={24} className="cursor-pointer opacity-40 hover:opacity-100" onClick={() => setShowTimeline(false)} />
          </div>
          <div className="p-4 space-y-2">
            {timelines.map((t, i) => (
              <div key={i} className="p-4 hover:bg-gray-50 cursor-pointer rounded-xl border border-transparent hover:border-gray-200 flex justify-between items-center font-medium transition-all" onClick={() => playerRef.current.seekTo(t.time)}>
                <span className="text-gray-700">{t.label}</span>
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
