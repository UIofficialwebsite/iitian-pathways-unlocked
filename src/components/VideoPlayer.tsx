import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';
import { 
  ArrowLeft, EllipsisVertical, Play, Pause, 
  RotateCcw, RotateCw, Volume2, Settings, 
  List, Expand, Flag, X 
} from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  playlist?: { id: string; title: string }[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, playlist = [] }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  // Progress & Time State
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hoverTime, setHoverTime] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState(0);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.className = 'video-js vjs-fill vjs-big-play-centered';
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: false,
        responsive: true,
        techOrder: ["youtube"],
        sources: [{ type: "video/youtube", src: `https://www.youtube.com/watch?v=${videoId}` }],
        youtube: { modestbranding: 1, rel: 0, iv_load_policy: 3, controls: 0, showinfo: 0 }
      });

      player.on('play', () => setIsPlaying(true));
      player.on('pause', () => setIsPlaying(false));
      
      // Update progress logic
      player.on('timeupdate', () => {
        const current = player.currentTime();
        const total = player.duration();
        setCurrentTime(current);
        if (total > 0) {
          setDuration(total);
          setProgress((current / total) * 100);
        }
      });

      player.on('loadedmetadata', () => {
        setDuration(player.duration());
      });
    }
    return () => playerRef.current?.dispose();
  }, [videoId]);

  const togglePlay = () => isPlaying ? playerRef.current.pause() : playerRef.current.play();
  
  const skip = (seconds: number) => {
    const time = playerRef.current.currentTime();
    playerRef.current.currentTime(time + seconds);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    playerRef.current.currentTime(pos * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setHoverPos(e.clientX - rect.left);
    setHoverTime(formatTime(pos * duration));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans select-none text-white">
      <div className="relative flex-1 bg-black flex flex-col overflow-hidden">
        
        {/* TOP BAR */}
        <div className="absolute top-0 inset-x-0 p-6 z-50 bg-gradient-to-b from-black/70 to-transparent flex justify-between items-center">
          <button onClick={onClose} className="hover:opacity-80 transition-opacity"><ArrowLeft size={24} /></button>
          <div className="relative">
            <button onClick={() => setShowReport(!showReport)} className="hover:opacity-80 transition-opacity"><EllipsisVertical size={24} /></button>
            {showReport && (
              <div className="absolute right-0 top-10 bg-[#1c1c1c] rounded-lg shadow-2xl min-w-[120px] overflow-hidden border border-white/10">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#333]"><Flag size={14} /> Report</button>
              </div>
            )}
          </div>
        </div>

        {/* VIDEO AREA */}
        <div className="flex-1 relative flex items-center justify-center">
          <div className="w-full h-full" data-vjs-player><div ref={videoRef} className="w-full h-full" /></div>
          <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} onClick={togglePlay} />
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="absolute bottom-0 inset-x-0 p-8 pt-20 z-50 bg-gradient-to-t from-black/80 to-transparent">
          
          {/* Timeline Meter with Hover Time */}
          <div 
            className="w-full h-1.5 bg-white/20 rounded-full mb-6 cursor-pointer relative group/timeline"
            onClick={handleSeek}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverTime(null)}
          >
            {/* Progress Fill */}
            <div className="absolute h-full bg-[#0056D2] rounded-full" style={{ width: `${progress}%` }} />
            
            {/* Hover Tooltip */}
            {hoverTime && (
              <div 
                className="absolute bottom-4 bg-black/90 px-2 py-1 rounded text-[10px] border border-white/10 -translate-x-1/2"
                style={{ left: `${hoverPos}px` }}
              >
                {hoverTime}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="hover:opacity-80">
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
              </button>
              <button onClick={() => skip(-10)} className="relative hover:opacity-80 flex items-center justify-center"><RotateCcw size={28} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button onClick={() => skip(10)} className="relative hover:opacity-80 flex items-center justify-center"><RotateCw size={28} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button className="hover:opacity-80"><Volume2 size={24} /></button>
              <span className="text-sm font-medium opacity-80 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <button onClick={() => setShowSettings(!showSettings)} className="hover:opacity-80"><Settings size={24} /></button>
                {showSettings && (
                  <div className="absolute bottom-12 right-0 bg-[#1c1c1c] rounded-lg shadow-2xl min-w-[160px] border border-white/10">
                    <div className="flex justify-between px-4 py-3 text-sm hover:bg-[#333] cursor-pointer border-b border-white/5">Quality <span className="text-[11px] text-gray-400">1080p</span></div>
                    <div className="flex justify-between px-4 py-3 text-sm hover:bg-[#333] cursor-pointer">Speed <span className="text-[11px] text-gray-400">1.0x</span></div>
                  </div>
                )}
              </div>
              <button onClick={() => setShowPlaylist(!showPlaylist)} className={`hover:opacity-80 ${showPlaylist ? 'text-[#0056D2]' : ''}`}><List size={24} /></button>
              <button onClick={() => playerRef.current.requestFullscreen()} className="hover:opacity-80"><Expand size={24} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* SIDEBAR PLAYLIST */}
      {showPlaylist && (
        <div className="w-80 bg-[#1c1c1c] border-l border-white/10 flex flex-col z-[60] animate-in slide-in-from-right">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest">Playlist</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {playlist.map((item, index) => (
              <div key={item.id} className={`p-4 rounded-lg cursor-pointer flex gap-4 items-center mb-1 ${item.id === videoId ? 'bg-[#0056D2]' : 'hover:bg-white/5'}`}>
                <span className="text-[10px] font-black opacity-50">{index + 1}</span>
                <p className="text-xs font-bold truncate">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
