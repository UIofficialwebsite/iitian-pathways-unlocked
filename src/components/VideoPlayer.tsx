import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, EllipsisVertical, Play, Pause, 
  RotateCcw, RotateCw, Volume2, Settings, 
  List, Expand, Flag, X 
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
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isVideoLocked, setIsVideoLocked] = useState(true); // Masks initial branding flicker

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new window.YT.Player('yt-player-headless', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1, // Minimizes logo
          rel: 0,            // Limits related videos to same channel
          iv_load_policy: 3, // Disables annotations/watermarks
          disablekb: 1,
          showinfo: 0,       // Deprecated but included for fallback
          autohide: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            setIsReady(true);
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
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
        
        // UNLOCK: Show video only after 1.5s to wait out YouTube's title animation
        if (curr > 1.5 && isVideoLocked) setIsVideoLocked(false);
        
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
  }, [videoId, isVideoLocked]);

  const togglePlay = () => {
    if (!isReady || !playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  // FIXED: seekTo(time, true) allows jumping backward even to non-buffered segments
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * duration;
    playerRef.current.seekTo(seekTime, true); 
    setCurrentTime(seekTime);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans select-none text-white">
      <div className="relative flex-1 bg-black flex flex-col overflow-hidden">
        
        {/* head-less player layer */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isVideoLocked ? 'opacity-0' : 'opacity-100'}`}>
           <div id="yt-player-headless" className="w-full h-full pointer-events-none" />
        </div>

        {/* SECURITY & PAUSE SHIELD: Blocks "More Videos" tray on pause */}
        <div className="absolute inset-0 z-20 cursor-pointer" onClick={togglePlay} onContextMenu={(e) => e.preventDefault()} />
        
        {/* INITIAL LOADING MASK */}
        {isVideoLocked && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* BOTTOM HUD */}
        <div className="absolute bottom-0 inset-x-0 p-8 pt-20 z-40 bg-gradient-to-t from-black/90 to-transparent">
          {/* Progress Bar with Correct Seek Logic */}
          <div className="w-full h-1 bg-white/20 rounded-full mb-6 relative cursor-pointer" onClick={handleSeek}>
            <div className="absolute h-full bg-[#0056D2]" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="hover:opacity-80">
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
              </button>
              <button onClick={() => playerRef.current.seekTo(currentTime - 10, true)} className="relative flex items-center justify-center"><RotateCcw size={26} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button onClick={() => playerRef.current.seekTo(currentTime + 10, true)} className="relative flex items-center justify-center"><RotateCw size={26} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button><Volume2 size={24} /></button>
              <span className="text-sm font-medium opacity-80 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => setShowTimeline(!showTimeline)} className={showTimeline ? 'text-[#0056D2]' : ''}><List size={24} /></button>
              <button onClick={() => playerRef.current.getIframe().requestFullscreen()}><Expand size={24} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE SIDEBAR */}
      {showTimeline && (
        <aside className="w-[350px] h-full bg-white flex flex-col z-[50] border-l border-gray-300 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center p-4 border-b border-[#efefef]">
            <h3 className="text-[#1a1a1a] text-base font-semibold m-0 tracking-tight">Timeline</h3>
            <button onClick={() => setShowTimeline(false)} className="text-[#333] hover:opacity-60 transition-opacity font-bold text-[22px]">&times;</button>
          </div>
          <div className="flex-1 flex flex-col">
            {timelines.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {timelines.map((item, idx) => (
                  <button key={idx} onClick={() => playerRef.current.seekTo(item.time, true)} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex justify-between items-center transition-colors border border-transparent hover:border-gray-200 text-black">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs font-bold text-[#7d84d1]">{formatTime(item.time)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center pb-20 px-10 text-center text-black">
                <p className="font-semibold text-[15px]">No timeline yet!</p>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
