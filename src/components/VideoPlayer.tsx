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
  const [showSettings, setShowSettings] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false); // Fix for 2-3 sec branding flicker

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // 1. Load YouTube API Script if not present
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
          controls: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          disablekb: 1,
          showinfo: 0,
          autohide: 1
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
        
        // Fix branding flicker: Only show video after 1 second of actual playback
        if (curr > 1.0) setIsVideoVisible(true);
        
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

  const togglePlay = () => {
    if (!isReady || !playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans select-none text-white">
      {/* MAIN VIDEO AREA */}
      <div className="relative flex-1 bg-black flex flex-col group overflow-hidden">
        
        {/* head-less player */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isVideoVisible ? 'opacity-100' : 'opacity-0'}`}>
           <div id="yt-player-headless" className="w-full h-full pointer-events-none scale-110" />
        </div>

        {/* SECURITY & BRANDING SHIELDS */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} onContextMenu={(e) => e.preventDefault()} />
        <div className="absolute top-0 right-0 w-64 h-24 z-20 bg-black pointer-events-none" /> {/* Mask Watch Later/Share */}
        <div className="absolute bottom-0 right-0 w-32 h-20 z-20 bg-black pointer-events-none" /> {/* Mask Watermark */}

        {!isVideoVisible && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )}

        {/* TOP HUD */}
        <div className="absolute top-0 inset-x-0 p-6 z-40 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex justify-between items-center">
            <button onClick={onClose} className="hover:opacity-80 transition-opacity"><ArrowLeft size={24} /></button>
            <button className="hover:opacity-80"><EllipsisVertical size={24} /></button>
          </div>
        </div>

        {/* BOTTOM HUD */}
        <div className="absolute bottom-0 inset-x-0 p-8 pt-20 z-40 bg-gradient-to-t from-black/90 to-transparent">
          <div className="w-full h-1 bg-white/20 rounded-full mb-6 relative overflow-hidden">
            <div className="absolute h-full bg-[#0056D2] rounded-full" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex justify-between items-center">
            <div className="group flex items-center gap-6">
              <button onClick={togglePlay} className="hover:opacity-80">{isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}</button>
              <button onClick={() => playerRef.current.seekTo(currentTime - 10)} className="relative flex items-center justify-center"><RotateCcw size={26} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button onClick={() => playerRef.current.seekTo(currentTime + 10)} className="relative flex items-center justify-center"><RotateCw size={26} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button><Volume2 size={24} /></button>
              <span className="text-sm font-medium opacity-80 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => setShowSettings(!showSettings)}><Settings size={24} /></button>
              <button onClick={() => setShowTimeline(!showTimeline)} className={showTimeline ? 'text-[#0056D2]' : ''}><List size={24} /></button>
              <button onClick={() => playerRef.current.getIframe().requestFullscreen()}><Expand size={24} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE SIDEBAR (Requested Design) */}
      {showTimeline && (
        <aside className="w-[350px] h-full bg-white flex flex-col z-[50] border-l border-gray-300 shadow-[-2px_0_10px_rgba(0,0,0,0.05)] animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center p-4 border-b border-[#efefef]">
            <h3 className="text-[#1a1a1a] text-base font-semibold m-0">Timeline</h3>
            <button onClick={() => setShowTimeline(false)} className="text-[#333] hover:opacity-60 transition-opacity"><X size={20} /></button>
          </div>

          <div className="flex-1 flex flex-col">
            {timelines.length > 0 ? (
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
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center pb-20 px-10 text-center">
                <div className="w-[130px] h-[130px] mb-5">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25 40L50 28L75 40V65L50 77L25 65V40Z" stroke="#7d84d1" strokeWidth="2.5" strokeLinejoin="round"/>
                    <path d="M25 40L50 52L75 40" stroke="#7d84d1" strokeWidth="2.5" strokeLinejoin="round"/>
                    <path d="M50 52V77" stroke="#7d84d1" strokeWidth="2.5" strokeLinejoin="round"/>
                    <circle cx="72" cy="32" r="10" fill="white" stroke="#7d84d1" strokeWidth="2.5"/>
                    <line x1="68" y1="28" x2="76" y2="36" stroke="#7d84d1" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="76" y1="28" x2="68" y2="36" stroke="#7d84d1" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M78 40L86 48" stroke="#7d84d1" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[15px] font-semibold text-[#1a1a1a] m-0">No timeline yet!</p>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
