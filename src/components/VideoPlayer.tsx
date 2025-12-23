import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, EllipsisVertical, Play, Pause, 
  RotateCcw, RotateCw, Volume2, VolumeX, 
  List, Expand, X, Settings, Check, FastForward
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
  
  // State Management
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Playback Data
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('yt-player-headless', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,         // Hides YouTube's native UI
          modestbranding: 1,   // Removes YT logo from controls
          rel: 0,              // Suggestions limited to same channel
          iv_load_policy: 3,   // Hides annotations
          disablekb: 1,        // Disables keyboard popups
          fs: 0,               // Hides native fullscreen button
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            const YTState = (window as any).YT.PlayerState;
            setIsPlaying(event.data === YTState.PLAYING);
            // Wait for first playing event to show video, preventing flashes
            if (event.data === YTState.PLAYING || event.data === YTState.PAUSED) {
              setIsVideoVisible(true);
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
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        setCurrentTime(curr);
        if (total > 0) {
          setDuration(total);
          setProgress((curr / total) * 100);
        }
      }
    }, 400);

    return () => {
      clearInterval(tracker);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans select-none text-white">
      {/* MAIN PLAYER SECTION */}
      <div className="relative flex-1 bg-black flex flex-col overflow-hidden">
        
        {/* VIDEO CONTAINER - No Zooming/Cropping */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isVideoVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div id="yt-player-headless" className="w-full h-full scale-100 pointer-events-none" />
        </div>

        {/* INTERACTION LAYER - Prevents clicking YouTube Watermarks/Suggestions */}
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
            <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}

        {/* TOP HUD (Header) */}
        <div className="absolute top-0 inset-x-0 p-6 z-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex justify-between items-center pointer-events-none">
          <button onClick={onClose} className="pointer-events-auto flex items-center gap-4 hover:opacity-80 transition-opacity">
            <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
              <ArrowLeft size={22} />
            </div>
            <span className="font-semibold text-lg drop-shadow-md truncate max-w-xl">{title}</span>
          </button>
          <div className="pointer-events-auto">
            <EllipsisVertical size={24} className="opacity-60 cursor-pointer" />
          </div>
        </div>

        {/* SETTINGS MENU (Playback Speed) */}
        {showSettings && (
          <div className="absolute bottom-28 right-8 z-50 bg-[#121212]/95 backdrop-blur-xl rounded-2xl border border-white/10 w-52 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-auto">
            <div className="p-4 border-b border-white/10 text-[10px] font-black uppercase tracking-[2px] text-white/40">Playback Speed</div>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <button 
                key={rate}
                onClick={() => {
                  playerRef.current.setPlaybackRate(rate);
                  setPlaybackRate(rate);
                  setShowSettings(false);
                }}
                className="w-full text-left px-5 py-3.5 hover:bg-white/10 flex items-center justify-between transition-colors group"
              >
                <span className={`text-sm ${playbackRate === rate ? 'text-blue-400 font-bold' : 'text-white/80'}`}>
                  {rate === 1 ? 'Normal' : `${rate}x`}
                </span>
                {playbackRate === rate && <Check size={16} className="text-blue-400" />}
              </button>
            ))}
          </div>
        )}

        {/* BOTTOM HUD (Footer Controls) */}
        <div className="absolute bottom-0 inset-x-0 p-8 pt-24 z-40 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
          
          {/* Progress Bar with Scrubber */}
          <div className="group w-full h-1.5 bg-white/20 rounded-full mb-8 relative cursor-pointer pointer-events-auto" onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const pos = (e.clientX - rect.left) / rect.width;
             playerRef.current.seekTo(pos * duration);
          }}>
            <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}>
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-150" />
            </div>
          </div>

          <div className="flex justify-between items-center pointer-events-auto">
            <div className="flex items-center gap-8">
              <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()} className="hover:scale-110 transition-transform">
                {isPlaying ? <Pause size={30} fill="white" /> : <Play size={30} fill="white" />}
              </button>
              
              <div className="flex items-center gap-6">
                <button onClick={() => playerRef.current.seekTo(currentTime - 10)} className="hover:opacity-70 transition-opacity">
                  <RotateCcw size={24} />
                </button>
                <button onClick={() => playerRef.current.seekTo(currentTime + 10)} className="hover:opacity-70 transition-opacity">
                  <RotateCw size={24} />
                </button>
              </div>

              <div className="flex items-center gap-3 group">
                <button onClick={() => {
                  const muted = !isMuted;
                  setIsMuted(muted);
                  muted ? playerRef.current.mute() : playerRef.current.unMute();
                }}>
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <span className="text-sm font-bold tracking-tight text-white/90 tabular-nums">
                  {formatTime(currentTime)} <span className="text-white/30 mx-1">/</span> {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-md text-xs font-bold">
                {playbackRate}x
              </div>
              <button onClick={() => { setShowSettings(!showSettings); setShowTimeline(false); }} className={`hover:rotate-45 transition-transform ${showSettings ? 'text-blue-400' : ''}`}>
                <Settings size={22} />
              </button>
              <button onClick={() => { setShowTimeline(!showTimeline); setShowSettings(false); }} className={`hover:scale-110 transition-transform ${showTimeline ? 'text-blue-400' : ''}`}>
                <List size={22} />
              </button>
              <button onClick={toggleFullscreen} className="hover:scale-110 transition-transform">
                <Expand size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE SIDEBAR (PW Style Chaptering) */}
      {showTimeline && (
        <aside className="w-[380px] h-full bg-white flex flex-col z-[60] border-l border-gray-200 animate-in slide-in-from-right duration-300 shadow-2xl">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 className="text-gray-900 text-lg font-bold">Lecture Timeline</h3>
            <button onClick={() => setShowTimeline(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {timelines.length > 0 ? (
              timelines.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => playerRef.current.seekTo(item.time)}
                  className="w-full text-left p-4 rounded-2xl hover:bg-blue-50 flex justify-between items-center transition-all group border border-transparent hover:border-blue-100 shadow-sm hover:shadow-md"
                >
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors pr-4">{item.label}</span>
                  <span className="text-xs font-black text-blue-500 bg-blue-100/50 px-2 py-1 rounded-md tabular-nums">{formatTime(item.time)}</span>
                </button>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10">
                <FastForward size={48} className="mb-4 text-gray-400" />
                <p className="text-sm font-bold text-gray-500">Chapters are not available for this lecture</p>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
