import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';
import { X, ListVideo, ChevronRight, Play, Pause, Maximize, Volume2 } from 'lucide-react';

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
      videoElement.className = 'vjs-theme-city vjs-big-play-centered custom-vjs';
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        playbackRates: [0.5, 1, 1.5, 2],
        techOrder: ["youtube"],
        sources: [{
          type: "video/youtube",
          src: `https://www.youtube.com/watch?v=${videoId}`
        }],
        youtube: { 
          modestbranding: 1, 
          rel: 0, 
          showinfo: 0, 
          iv_load_policy: 3,
          controls: 0 
        }
      });

      player.on('play', () => setIsPlaying(true));
      player.on('pause', () => setIsPlaying(false));
    } else if (playerRef.current) {
      playerRef.current.src({
        type: "video/youtube",
        src: `https://www.youtube.com/watch?v=${videoId}`
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-row overflow-hidden font-sans select-none">
      {/* LEFT: MAIN CONTENT AREA */}
      <div className="relative flex-1 flex flex-col bg-black">
        
        {/* TOP HEADER - Minimalist & Premium */}
        <div className="absolute top-0 inset-x-0 p-6 z-30 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">Online Classroom</span>
            <h2 className="text-white font-semibold text-xl tracking-tight leading-none">{title}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-white/70 border border-white/10 backdrop-blur-xl transition-all duration-300"
          >
            <X size={20}/>
          </button>
        </div>

        {/* CENTER: VIDEO VIEWPORT */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12 relative overflow-hidden">
          {/* Subtle Glow Background */}
          <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full scale-50" />
          
          <div data-vjs-player className="w-full max-w-[1200px] z-10 aspect-video shadow-2xl shadow-black/80 rounded-2xl overflow-hidden border border-white/10">
            <div ref={videoRef} className="w-full h-full" />
          </div>

          {/* Security Shield - Prevents clicking Youtube logo/branding */}
          <div 
            className="absolute inset-x-0 top-20 bottom-20 z-20 cursor-default" 
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        {/* BOTTOM HUD FEEDBACK */}
        <div className="absolute bottom-8 left-8 z-30 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="h-10 w-1 bg-blue-600 rounded-full" />
           <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Premium Learning Experience</p>
        </div>
      </div>

      {/* RIGHT: PLAYLIST SIDEBAR */}
      {showPlaylist && (
        <div className="w-[380px] bg-[#0B0F1A] border-l border-white/5 flex flex-col z-40 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-500">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#0B0F1A]/50 backdrop-blur-md">
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest">Playlist</h3>
              <p className="text-slate-500 text-[10px] mt-1 font-medium italic">{playlist.length} Lectures Available</p>
            </div>
            <button 
              onClick={() => setShowPlaylist(false)} 
              className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronRight size={22}/>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {playlist.map((item, index) => {
              const isActive = item.id === videoId;
              return (
                <button 
                  key={item.id} 
                  disabled={isActive}
                  className={`w-full p-4 rounded-2xl flex gap-5 items-center transition-all duration-300 group border text-left ${
                    isActive 
                    ? 'bg-blue-600 border-blue-400 shadow-[0_10px_20px_rgba(37,99,235,0.2)]' 
                    : 'hover:bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-200'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold leading-snug truncate ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                       {isActive ? (
                         <span className="text-[10px] text-blue-100 font-bold uppercase tracking-tighter flex items-center gap-1">
                           <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                           Now Streaming
                         </span>
                       ) : (
                         <span className="text-[10px] text-slate-600 font-medium">12:45 • MP4 HD</span>
                       )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FLOATING PLAYLIST TOGGLE (When Hidden) */}
      {!showPlaylist && (
        <button 
          onClick={() => setShowPlaylist(true)}
          className="absolute right-8 bottom-8 z-50 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-2xl shadow-blue-600/40 border border-blue-400 transition-all active:scale-95"
        >
          <ListVideo size={24}/>
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
