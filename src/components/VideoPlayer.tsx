import React, { useEffect, useRef, useState } from 'react';
import { Settings, Play, Pause, ListVideo, X, ChevronRight, Maximize2, RotateCcw, Volume2 } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  playlist?: { id: string; title: string; duration?: string }[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, playlist = [] }) => {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false); // New: Track if player object exists
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const initPlayer = () => {
      // Ensure we don't initialize twice
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-player-headless', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => setIsReady(true), // Only allow controls after this fires
          onStateChange: (e: any) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          },
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    const timer = setInterval(() => {
      // Safety check: Only read time if player is ready and has the method
      if (isReady && playerRef.current?.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) setProgress((current / duration) * 100);
      }
    }, 1000);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      clearInterval(timer);
    };
  }, [videoId, isReady]);

  // CRITICAL FIX: Safety-guarded control functions
  const togglePlay = () => {
    if (!isReady || !playerRef.current) return; // Prevent "pauseVideo of null"
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const changeSpeed = (s: number) => {
    if (!isReady || !playerRef.current) return;
    playerRef.current.setPlaybackRate(s);
    setPlaybackSpeed(s);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-row overflow-hidden font-sans select-none">
      
      {/* MAIN THEATRE AREA */}
      <div className="relative flex-1 bg-black flex flex-col group">
        
        {/* Headless Frame */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
           <div id="yt-player-headless" className="w-[105%] h-[105%] pointer-events-none" />
        </div>

        {/* SECURITY SHIELD - All clicks handled by togglePlay with safety check */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} onContextMenu={(e) => e.preventDefault()} />

        {/* LOADING OVERLAY */}
        {!isReady && (
          <div className="absolute inset-0 z-20 bg-slate-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-blue-500 font-bold text-xs uppercase tracking-widest">Securing Connection...</p>
            </div>
          </div>
        )}

        {/* TOP HUD */}
        <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">Unknown IITians Internal Player</span>
              <h2 className="text-white text-xl font-bold mt-1">{title}</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
              <X size={24}/>
            </button>
          </div>
        </div>

        {/* BOTTOM HUD CONTROLS */}
        <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="mb-4 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform disabled:opacity-50" disabled={!isReady}>
              {isPlaying ? <Pause size={30} fill="white"/> : <Play size={30} fill="white"/>}
            </button>
            
            <div className="flex-1" />

            {/* Custom Speed Popover */}
            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-blue-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                <Settings size={22}/>
              </button>
              {showSettings && (
                <div className="absolute bottom-14 right-0 bg-slate-900/95 border border-white/10 p-2 rounded-xl w-36 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-2 tracking-tighter">Speed</p>
                  {[0.5, 1, 1.25, 1.5, 2].map(s => (
                    <button key={s} onClick={() => changeSpeed(s)} className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${playbackSpeed === s ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                      {s === 1 ? 'Normal' : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 rounded-lg transition-all ${showPlaylist ? 'text-blue-500 bg-blue-600/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
              <ListVideo size={22}/>
            </button>
          </div>
        </div>
      </div>

      {/* SIDE PLAYLIST */}
      {showPlaylist && (
        <div className="w-80 bg-slate-950 border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-500 z-30">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
            <div>
              <h3 className="text-white font-bold text-sm tracking-tight">Playlist</h3>
              <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">{playlist.length} Lessons</p>
            </div>
            <button onClick={() => setShowPlaylist(false)} className="text-slate-500 hover:text-white transition-colors"><ChevronRight size={20}/></button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
            {playlist.map((item, index) => (
              <div key={item.id} className={`p-4 rounded-xl cursor-pointer transition-all border ${item.id === videoId ? 'bg-blue-600/10 border-blue-600/30' : 'hover:bg-white/5 border-transparent'}`}>
                <div className="flex gap-4 items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${item.id === videoId ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-500'}`}>
                    {index + 1}
                  </div>
                  <div className="overflow-hidden">
                    <p className={`text-xs font-semibold truncate ${item.id === videoId ? 'text-blue-400' : 'text-slate-200'}`}>{item.title}</p>
                    <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold">Video Lesson</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
