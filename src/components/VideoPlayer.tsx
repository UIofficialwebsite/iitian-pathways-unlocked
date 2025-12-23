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
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('yt-player-headless', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,         // Disables native YouTube controls
          modestbranding: 1,   // Removes YouTube logo from the control bar
          rel: 0,              // Limits related videos to the same channel
          iv_load_policy: 3,   // Hides annotations/popups
          disablekb: 1,        // Disables keyboard shortcuts
          fs: 0,               // Hides native fullscreen button
        },
        events: {
          onReady: (e: any) => e.target.playVideo(),
          onStateChange: (e: any) => {
            const YTState = (window as any).YT.PlayerState;
            setIsPlaying(e.data === YTState.PLAYING);
            // Wait until playing to show video to hide initial YouTube loading elements
            if (e.data === YTState.PLAYING || e.data === YTState.PAUSED) setIsVideoVisible(true);
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
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans select-none text-white">
      <div className="relative flex-1 overflow-hidden bg-black">
        
        {/* PLAYER BODY: scale-100 ensures full visibility */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${isVideoVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* pointer-events-none ensures the user can't click internal YT buttons */}
          <div id="yt-player-headless" className="w-full h-full scale-100 pointer-events-none" />
        </div>

        {/* INTERACTIVE LAYER: The "Shield" that blocks YT popups and suggestions */}
        <div 
          className="absolute inset-0 z-20 cursor-pointer" 
          onClick={() => {
            if (showSettings) setShowSettings(false);
            else isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
          }} 
        />

        {/* CUSTOM HUD: Covers the title bar area with a protective gradient */}
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between">
          
          {/* Header Guard */}
          <div className="p-6 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-auto flex justify-between items-center">
            <button onClick={onClose} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
              <ArrowLeft size={24} />
              <span className="text-lg font-medium">{title}</span>
            </button>
            <EllipsisVertical size={24} className="opacity-50" />
          </div>

          {/* Footer Guard (Hides Watermark area) */}
          <div className="p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-auto">
            {/* Custom Progress Control */}
            <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 relative cursor-pointer" onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const pos = (e.clientX - rect.left) / rect.width;
               playerRef.current.seekTo(pos * duration);
            }}>
              <div className="absolute h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-8">
                <button onClick={() => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo()} className="hover:scale-110 transition">
                  {isPlaying ? <Pause size={30} fill="white" /> : <Play size={30} fill="white" />}
                </button>
                <div className="flex items-center gap-6">
                  <RotateCcw size={24} className="hover:opacity-70" onClick={() => playerRef.current.seekTo(currentTime - 10)} />
                  <RotateCw size={24} className="hover:opacity-70" onClick={() => playerRef.current.seekTo(currentTime + 10)} />
                </div>
                <button onClick={() => {
                  setIsMuted(!isMuted);
                  isMuted ? playerRef.current.unMute() : playerRef.current.mute();
                }}>
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <span className="text-sm font-medium opacity-80 tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1 text-xs font-bold bg-white/10 px-2 py-1 rounded">{playbackRate}x</div>
                <Settings size={22} className="cursor-pointer" onClick={() => setShowSettings(!showSettings)} />
                <List size={22} className="cursor-pointer" onClick={() => setShowTimeline(!showTimeline)} />
                <Expand size={22} className="cursor-pointer" onClick={() => containerRef.current?.requestFullscreen()} />
              </div>
            </div>
          </div>
        </div>

        {/* Playback Speed Menu */}
        {showSettings && (
          <div className="absolute bottom-28 right-8 z-50 bg-[#1a1a1a] rounded-xl border border-white/10 w-48 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            {[0.5, 1, 1.5, 2].map((rate) => (
              <button 
                key={rate} 
                onClick={() => { playerRef.current.setPlaybackRate(rate); setPlaybackRate(rate); setShowSettings(false); }}
                className="w-full text-left px-4 py-3 hover:bg-white/10 flex justify-between items-center text-sm"
              >
                <span>{rate === 1 ? 'Normal' : `${rate}x`}</span>
                {playbackRate === rate && <Check size={16} className="text-blue-500" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chapter Sidebar */}
      {showTimeline && (
        <aside className="w-[350px] h-full bg-white text-black z-[60] border-l animate-in slide-in-from-right duration-300 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-bold text-lg">Lecture Timeline</h3>
            <X size={20} className="cursor-pointer" onClick={() => setShowTimeline(false)} />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {timelines.map((item, idx) => (
              <button key={idx} onClick={() => playerRef.current.seekTo(item.time)} className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex justify-between items-center transition-colors">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{formatTime(item.time)}</span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
