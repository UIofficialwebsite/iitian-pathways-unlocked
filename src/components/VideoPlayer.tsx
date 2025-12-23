import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';
import { X, ListVideo, ChevronRight, Play, Pause } from 'lucide-react';

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
  const [showPlaylist, setShowPlaylist] = useState(true);

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.className = 'vjs-theme-city vjs-big-play-centered';
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        techOrder: ["youtube"],
        sources: [{
          type: "video/youtube",
          src: `https://www.youtube.com/watch?v=${videoId}`
        }],
        youtube: { 
          modestbranding: 1, // Removes YouTube logo from control bar
          rel: 0,            // Prevents related videos from other channels
          showinfo: 0,       // Hides video title/uploader before play
          iv_load_policy: 3, // Hides video annotations (watermarks)
          controls: 0        // We use Video.js controls for a cleaner look
        }
      });

      player.on('play', () => setIsPlaying(true));
      player.on('pause', () => setIsPlaying(false));
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const togglePlay = () => {
    if (playerRef.current.paused()) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-row overflow-hidden font-sans">
      <div className="relative flex-1 flex flex-col">
        
        {/* TOP BAR - Minimalist Design */}
        <div className="absolute top-0 inset-x-0 p-6 z-30 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center">
          <div>
            <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-1 block">Now Playing</span>
            <h2 className="text-white font-medium text-lg tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white border border-white/10 backdrop-blur-md transition-all">
            <X size={20}/>
          </button>
        </div>

        {/* MAIN PLAYER AREA */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
          <div data-vjs-player className="w-full max-w-5xl shadow-2xl shadow-blue-900/20">
            <div ref={videoRef} className="rounded-lg overflow-hidden border border-white/5" />
          </div>
          
          {/* Security & Watermark Shield */}
          {/* This transparent layer prevents clicking the YouTube watermark */}
          <div 
            className="absolute inset-0 z-20 cursor-pointer" 
            onClick={togglePlay}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* HUD Overlay for Play/Pause visual feedback */}
        <div className="absolute bottom-10 left-10 z-30">
           <button onClick={togglePlay} className="text-white/50 hover:text-white transition-colors">
              {isPlaying ? <Pause size={28} /> : <Play size={28} />}
           </button>
        </div>
      </div>

      {/* SIDEBAR PLAYLIST - Formal Dark Design */}
      {showPlaylist && (
        <div className="w-80 bg-[#0B0F1A] border-l border-white/5 flex flex-col z-40 shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]">
            <h3 className="text-white font-semibold text-xs uppercase tracking-[0.2em]">Course Content</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-slate-500 hover:text-white transition-colors">
              <ChevronRight size={20}/>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {playlist.map((item, index) => {
              const isActive = item.id === videoId;
              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-xl cursor-pointer flex gap-4 items-center transition-all group border ${
                    isActive 
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' 
                    : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {item.title}
                    </p>
                    {isActive && <span className="text-[9px] text-blue-400 font-bold uppercase tracking-tighter animate-pulse">Streaming</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
