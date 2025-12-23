import React, { useEffect, useRef, useState } from 'react';
import { Settings, Play, Pause, ListVideo, X, ChevronRight, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  playlist?: { id: string; title: string }[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, playlist = [] }) => {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true); 
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    const initPlayer = () => {
      // Prevent double initialization
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-player-headless', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,        // Disables native YouTube UI
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          // Safety: Only enable controls after the player is ready
          onReady: () => setIsReady(true),
          onStateChange: (e: any) => setIsPlaying(e.data === window.YT.PlayerState.PLAYING),
        }
      });
    };

    // Load API script if missing
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // SAFE CONTROLS: Guard clauses prevent "pauseVideo of null" errors
  const togglePlay = () => {
    if (!isReady || !playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const changeSpeed = (speed: number) => {
    if (!isReady || !playerRef.current) return;
    playerRef.current.setPlaybackRate(speed);
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-row overflow-hidden font-sans select-none animate-in fade-in duration-300">
      
      {/* LEFT: MAIN PLAYER AREA */}
      <div className="relative flex-1 bg-black flex flex-col group">
        
        {/* Headless Frame (Scaled 105% to crop YouTube logo) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
           <div id="yt-player-headless" className="w-[105%] h-[105%] pointer-events-none" />
        </div>

        {/* THE SECURITY SHIELD: Invisible click catcher */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} onContextMenu={(e) => e.preventDefault()} />

        {/* LOADING OVERLAY: Appears while script/player initializes */}
        {!isReady && (
          <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-500 font-bold text-xs uppercase tracking-widest">Securing Player...</p>
          </div>
        )}

        {/* TOP HUD */}
        <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">Internal Course Player</span>
              <h2 className="text-white text-xl font-bold mt-1">{title}</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
              <X size={24}/>
            </button>
          </div>
        </div>

        {/* BOTTOM HUD */}
        <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-6">
          <button onClick={togglePlay} className="text-white disabled:opacity-30" disabled={!isReady}>
            {isPlaying ? <Pause size={32} fill="white"/> : <Play size={32} fill="white"/>}
          </button>
          
          <div className="flex-1" />

          {/* CUSTOM SETTINGS (Corner Cog) */}
          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className="text-white p-2 hover:bg-white/10 rounded-lg transition-all">
              <Settings size={24}/>
            </button>
            {showSettings && (
              <div className="absolute bottom-14 right-0 bg-slate-900 border border-white/10 p-2 rounded-xl w-32 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-2">Speed</p>
                {[0.5, 1, 1.5, 2].map(s => (
                  <button key={s} onClick={() => changeSpeed(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${playbackSpeed === s ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 rounded-lg transition-all ${showPlaylist ? 'text-blue-500 bg-blue-600/10' : 'text-white hover:bg-white/10'}`}>
            <ListVideo size={24}/>
          </button>
        </div>
      </div>

      {/* RIGHT: SIDE PLAYLIST COLUMN */}
      {showPlaylist && (
        <div className="w-80 bg-slate-950 border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-500 z-30 shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
            <h3 className="text-white font-bold text-sm tracking-tight uppercase">Playlist</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-slate-500 hover:text-white transition-colors"><ChevronRight size={22}/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
            {playlist.length > 0 ? playlist.map((item, index) => (
              <div key={item.id} className={`p-4 rounded-xl cursor-pointer flex gap-4 items-center transition-all ${item.id === videoId ? 'bg-blue-600/10 border border-blue-600/30' : 'hover:bg-white/5 border border-transparent'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${item.id === videoId ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40' : 'bg-slate-800 text-slate-500'}`}>
                  {index + 1}
                </div>
                <p className={`text-xs font-semibold truncate ${item.id === videoId ? 'text-blue-400' : 'text-slate-200'}`}>{item.title}</p>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-xs italic">No additional lessons</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
