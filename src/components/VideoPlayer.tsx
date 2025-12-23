import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, EllipsisVertical, Play, Pause, 
  RotateCcw, RotateCw, Volume2, VolumeX, Settings, 
  List, Expand, X, Check 
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player('yt-player-headless', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,        // Hides YouTube's native controls
          modestbranding: 1,  // Reduces YouTube branding
          rel: 0,             // Shows related videos only from the SAME channel
          iv_load_policy: 3,  // Hides video annotations
          disablekb: 1,       // Disables keyboard shortcuts
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            // Show video immediately without waiting for a 1.5s timer
            if (event.data === window.YT.PlayerState.PLAYING || event.data === window.YT.PlayerState.PAUSED) {
              setIsVideoVisible(true);
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    const timer = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setCurrentTime(curr);
        if (total > 0) {
          setDuration(total);
          setProgress((curr / total) * 100);
        }
      }
    }, 500);

    return () => {
      if (playerRef.current) playerRef.current.destroy();
      clearInterval(timer);
    };
  }, [videoId]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans select-none text-white">
      <div className="relative flex-1 bg-black flex flex-col overflow-hidden">
        
        {/* VIDEO CONTAINER - Removed Zoom (scale-[1.15]) */}
        <div className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ${isVideoVisible ? 'opacity-100' : 'opacity-0'}`}>
           <div id="yt-player-headless" className="w-full h-full scale-100" />
        </div>

        {/* INTERACTION LAYER - Restricts clicking on YouTube "More Videos" popups */}
        <div 
          className="absolute inset-0 z-20 cursor-pointer" 
          onClick={() => {
            if (showSettings) setShowSettings(false);
            else isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
          }} 
          onContextMenu={(e) => e.preventDefault()} 
        />

        {/* LOADING MASK */}
        {!isVideoVisible && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* TOP HUD */}
        <div className="absolute top-0 inset-x-0 p-6 z-40 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex justify-between items-center">
            <button onClick={onClose} className="hover:opacity-80 transition-opacity flex items-center gap-3">
              <ArrowLeft size={24} />
              <span className="font-medium text-lg">{title}</span>
            </button>
            <button className="hover:opacity-80"><EllipsisVertical size={24} /></button>
          </div>
        </div>

        {/* BOTTOM HUD */}
        <div className="absolute bottom-0 inset-x-0 p-8 pt-20 z-40 bg-gradient-to-t from-black/90 to-transparent">
          {/* Progress Bar */}
          <div className="group w-full h-1.5 bg-white/20 rounded-full mb-6 relative cursor-pointer" onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const pos = (e.clientX - rect.left) / rect.width;
             playerRef.current.seekTo(pos * duration);
          }}>
            <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}>
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()} className="hover:scale-110 transition-transform">
                {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
              </button>
              <button onClick={() => playerRef.current.seekTo(currentTime - 10)} className="relative flex items-center justify-center hover:opacity-70"><RotateCcw size={26} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button onClick={() => playerRef.current.seekTo(currentTime + 10)} className="relative flex items-center justify-center hover:opacity-70"><RotateCw size={26} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button onClick={() => {
                const muted = !isMuted;
                setIsMuted(muted);
                muted ? playerRef.current.mute() : playerRef.current.unMute();
              }}>
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <span className="text-sm font-medium opacity-80 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => setShowSettings(!showSettings)}><Settings size={24} /></button>
              <button onClick={() => setShowTimeline(!showTimeline)} className={showTimeline ? 'text-blue-400' : ''}><List size={24} /></button>
              <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform"><Expand size={24} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE SIDEBAR */}
      {showTimeline && (
        <aside className="w-[350px] h-full bg-white flex flex-col z-[50] border-l border-gray-300 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-[#1a1a1a] text-base font-semibold m-0">Timeline</h3>
            <button onClick={() => setShowTimeline(false)} className="text-[#333] hover:opacity-60 transition-opacity font-bold"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {timelines.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => playerRef.current.seekTo(item.time)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex justify-between items-center transition-colors border border-transparent hover:border-gray-200"
              >
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-xs font-bold text-[#7d84d1]">{formatTime(item.time)}</span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
