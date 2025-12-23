import React, { useEffect, useRef, useState } from 'react';
import { Settings, ListVideo, X, ChevronRight } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  playlist?: { id: string; title: string }[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, playlist = [] }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    // 1. Initialize Video.js with YouTube tech (PW Style)
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement('video-js');
      videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-city');
      videoRef.current.appendChild(videoElement);

      playerRef.current = window.videojs(videoElement, {
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
          customVars: { wmode: "transparent" },
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        },
        controlBar: {
          children: [
            'playToggle',
            'volumePanel',
            'currentTimeDisplay',
            'timeDivider',
            'durationDisplay',
            'progressControl', // The timeline meter
            'fullscreenToggle',
          ],
        }
      });
    }

    // Cleanup: Prevent background audio after closing
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const changeSpeed = (s: number) => {
    playerRef.current.playbackRate(s);
    setPlaybackSpeed(s);
    setShowSpeedMenu(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans select-none animate-in fade-in">
      
      {/* LEFT: MAIN PLAYER AREA */}
      <div className="relative flex-1 bg-black flex flex-col group">
        
        {/* TOP HUD */}
        <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
          <div>
            <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-60">Internal Player</span>
            <h2 className="text-white font-bold text-lg mt-1">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
            <X size={24}/>
          </button>
        </div>

        {/* THE VIDEO CONTAINER (No Cropping) */}
        <div className="flex-1 flex items-center justify-center bg-black p-4">
          <div ref={videoRef} className="w-full h-full max-w-6xl shadow-2xl border border-white/5 rounded-xl overflow-hidden" />
        </div>

        {/* CUSTOM SIDEBAR TOGGLE */}
        <div className="absolute bottom-10 right-10 z-30 opacity-0 group-hover:opacity-100 transition-opacity flex gap-4">
           {/* Custom Speed Menu */}
           <div className="relative">
             <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="p-3 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 border border-white/10">
               <Settings size={22}/>
             </button>
             {showSpeedMenu && (
               <div className="absolute bottom-14 right-0 bg-neutral-900 border border-white/10 p-2 rounded-xl w-32 shadow-2xl animate-in fade-in">
                 {[0.5, 1, 1.5, 2].map(s => (
                   <button key={s} onClick={() => changeSpeed(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${playbackSpeed === s ? 'bg-white text-black' : 'text-white hover:bg-white/5'}`}>
                     {s}x
                   </button>
                 ))}
               </div>
             )}
           </div>
           
           <button 
             onClick={() => setShowPlaylist(!showPlaylist)} 
             className={`p-3 rounded-full shadow-xl transition-all border border-white/10 ${showPlaylist ? 'bg-white text-black' : 'bg-neutral-900 text-white'}`}
           >
             <ListVideo size={22}/>
           </button>
        </div>
      </div>

      {/* RIGHT: PLAYLIST COLUMN (Strict Black & White) */}
      {showPlaylist && (
        <div className="w-80 bg-neutral-950 border-l border-white/10 flex flex-col z-40 shadow-2xl animate-in slide-in-from-right duration-500">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest">Playlist</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-neutral-500 hover:text-white"><ChevronRight size={20}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-black">
            {playlist.map((item, index) => {
              const isActive = item.id === videoId;
              return (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-xl cursor-pointer flex gap-4 items-center transition-all border ${isActive ? 'bg-white border-white' : 'hover:bg-neutral-900 border-transparent'}`}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${isActive ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-black' : 'text-white'}`}>
                      {item.title}
                    </p>
                    {isActive && <p className="text-[9px] text-black font-black uppercase mt-0.5 tracking-tighter">Playing</p>}
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

declare global {
  interface Window {
    videojs: any;
  }
}
