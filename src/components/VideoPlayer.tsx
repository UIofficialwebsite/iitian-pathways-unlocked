import React, { useEffect, useRef, useState } from 'react';
import { Settings, Play, Pause, ListVideo, X, ChevronRight } from 'lucide-react';

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
  const [progress, setProgress] = useState(0); // For the Timeline Meter

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
          onReady: () => setIsReady(true),
          onStateChange: (e: any) => setIsPlaying(e.data === window.YT.PlayerState.PLAYING),
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    const timer = setInterval(() => {
      if (isReady && playerRef.current?.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) setProgress((current / duration) * 100);
      }
    }, 1000);

    return () => {
      if (playerRef.current) playerRef.current.destroy();
      clearInterval(timer);
    };
  }, [videoId, isReady]);

  const togglePlay = () => {
    if (!isReady || !playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const changeSpeed = (s: number) => {
    if (!isReady || !playerRef.current) return;
    playerRef.current.setPlaybackRate(s);
    setPlaybackSpeed(s);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans select-none">
      {/* MAIN VIDEO AREA */}
      <div className="relative flex-1 bg-black flex flex-col group">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black">
           <div id="yt-player-headless" className="w-full h-full pointer-events-none" />
        </div>

        {/* SECURITY SHIELD */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} onContextMenu={(e) => e.preventDefault()} />

        {/* TOP HUD */}
        <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex justify-between items-center">
            <h2 className="text-white font-bold text-lg">{title}</h2>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
              <X size={24}/>
            </button>
          </div>
        </div>

        {/* BOTTOM HUD */}
        <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* TIMELINE LEVEL METER (White and Clean) */}
          <div className="mb-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white disabled:opacity-30" disabled={!isReady}>
              {isPlaying ? <Pause size={32} fill="white"/> : <Play size={32} fill="white"/>}
            </button>
            <div className="flex-1" />
            
            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className="text-white p-2 hover:bg-white/10 rounded-lg">
                <Settings size={24}/>
              </button>
              {showSettings && (
                <div className="absolute bottom-14 right-0 bg-neutral-900 border border-white/10 p-2 rounded-xl w-32 shadow-2xl">
                  <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1 px-2 tracking-tighter">Speed</p>
                  {[0.5, 1, 1.5, 2].map(s => (
                    <button key={s} onClick={() => changeSpeed(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${playbackSpeed === s ? 'bg-white text-black' : 'text-white hover:bg-white/5'}`}>
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 rounded-lg ${showPlaylist ? 'text-white bg-white/10' : 'text-white hover:bg-white/10'}`}>
              <ListVideo size={24}/>
            </button>
          </div>
        </div>
      </div>

      {/* PLAYLIST COLUMN (Strict Black & White) */}
      {showPlaylist && (
        <div className="w-80 bg-neutral-950 border-l border-white/10 flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-500">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black">
            <h3 className="text-white font-bold text-sm uppercase tracking-tighter">Playlist</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-neutral-500 hover:text-white transition-colors"><ChevronRight size={22}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-black">
            {playlist.map((item, index) => {
              const isActive = item.id === videoId;
              return (
                <div key={item.id} className={`p-4 rounded-xl cursor-pointer flex gap-4 items-center transition-all border ${isActive ? 'bg-white border-white' : 'hover:bg-neutral-900 border-transparent'}`}>
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${isActive ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-black' : 'text-white'}`}>{item.title}</p>
                    {isActive && <p className="text-[9px] text-black font-black uppercase mt-0.5 animate-pulse">Now Playing</p>}
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
