import React, { useEffect, useRef, useState } from 'react';
import { Settings, Play, Pause, ListVideo, X, ChevronRight, RotateCcw } from 'lucide-react';

const VideoPlayer: React.FC<{ 
  videoId: string; 
  title: string; 
  onClose: () => void;
  playlist?: { id: string; title: string }[] 
}> = ({ videoId, title, onClose, playlist = [] }) => {
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false); // SAFETY CHECK
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true); // SIDE DRAWER
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    const initPlayer = () => {
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
          onReady: () => setIsReady(true), // ONLY ENABLE CONTROLS NOW
          onStateChange: (e: any) => setIsPlaying(e.data === window.YT.PlayerState.PLAYING),
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [videoId]);

  // SAFE CONTROL FUNCTIONS
  const togglePlay = () => {
    if (!isReady || !playerRef.current) return; // PREVENTS CRASH
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const changeSpeed = (s: number) => {
    if (!isReady || !playerRef.current) return;
    playerRef.current.setPlaybackRate(s);
    setPlaybackSpeed(s);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-row overflow-hidden font-sans">
      
      {/* MAIN VIDEO AREA */}
      <div className="relative flex-1 bg-black flex flex-col group">
        
        {/* Headless Video (Scaled to hide YouTube logo) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
           <div id="yt-player-headless" className="w-[105%] h-[105%] pointer-events-none" />
        </div>

        {/* SECURITY SHIELD */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} onContextMenu={(e) => e.preventDefault()} />

        {/* LOADING STATE (When CSP or API is slow) */}
        {!isReady && (
          <div className="absolute inset-0 z-20 bg-slate-950 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-500 font-bold text-xs uppercase tracking-widest">Securing Player...</p>
          </div>
        )}

        {/* TOP HUD */}
        <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/80 to-transparent transition-opacity opacity-0 group-hover:opacity-100">
          <div className="flex justify-between items-center">
            <h2 className="text-white font-bold">{title}</h2>
            <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white"><X/></button>
          </div>
        </div>

        {/* BOTTOM HUD CONTROLS */}
        <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-black/90 to-transparent transition-opacity opacity-0 group-hover:opacity-100 flex items-center gap-6">
          <button onClick={togglePlay} className="text-white disabled:opacity-30" disabled={!isReady}>
            {isPlaying ? <Pause size={28} fill="white"/> : <Play size={28} fill="white"/>}
          </button>
          
          <div className="flex-1" />

          {/* Speed Selector (Corner Setting) */}
          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className="text-white p-2 hover:bg-white/10 rounded-lg">
              <Settings size={22}/>
            </button>
            {showSettings && (
              <div className="absolute bottom-14 right-0 bg-slate-900 border border-white/10 p-2 rounded-xl w-32 shadow-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 px-2">Speed</p>
                {[0.5, 1, 1.5, 2].map(s => (
                  <button key={s} onClick={() => changeSpeed(s)} className={`w-full text-left px-3 py-1.5 rounded text-sm ${playbackSpeed === s ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                    {s}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 rounded-lg ${showPlaylist ? 'text-blue-500 bg-blue-600/10' : 'text-white'}`}>
            <ListVideo size={22}/>
          </button>
        </div>
      </div>

      {/* SIDE PLAYLIST DRAWER */}
      {showPlaylist && (
        <div className="w-80 bg-slate-950 border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-500">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
            <h3 className="text-white font-bold text-sm">Course Content</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-slate-500 hover:text-white"><ChevronRight/></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {playlist.map((item, index) => (
              <div key={item.id} className={`p-4 rounded-xl cursor-pointer flex gap-4 items-center ${item.id === videoId ? 'bg-blue-600/10 border border-blue-600/30' : 'hover:bg-white/5 border border-transparent'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${item.id === videoId ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                  {index + 1}
                </div>
                <p className={`text-xs font-semibold ${item.id === videoId ? 'text-blue-400' : 'text-slate-200'}`}>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
