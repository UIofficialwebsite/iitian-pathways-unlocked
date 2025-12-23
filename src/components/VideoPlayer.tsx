import React, { useEffect, useRef, useState } from 'react';
import { Settings, Play, Pause, ListVideo, X, ChevronRight, Maximize2, RotateCcw, Volume2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  playlist?: { id: string; title: string; duration?: string }[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, playlist = [] }) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true); // Default open for premium feel
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new window.YT.Player('yt-player-headless', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,        // Hides native UI
          modestbranding: 1,
          rel: 0,
          disablekb: 1,
          enablejsapi: 1,
        },
        events: {
          onStateChange: (e: any) => setIsPlaying(e.data === window.YT.PlayerState.PLAYING),
        }
      });
    };

    if (window.YT && window.YT.Player) initPlayer();
    else window.onYouTubeIframeAPIReady = initPlayer;

    const timer = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        setProgress((current / duration) * 100);
      }
    }, 1000);

    return () => {
      playerRef.current?.destroy();
      clearInterval(timer);
    };
  }, [videoId]);

  const togglePlay = () => isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  const changeSpeed = (s: number) => { playerRef.current.setPlaybackRate(s); setPlaybackSpeed(s); setShowSettings(false); };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-row overflow-hidden font-sans">
      
      {/* MAIN THEATRE AREA */}
      <div className="relative flex-1 bg-black flex flex-col group">
        
        {/* 1. THE HEADLESS VIDEO (Scaled 105% to hide YouTube logo/edges) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
           <div id="yt-player-headless" className="w-[105%] h-[105%] pointer-events-none" />
        </div>

        {/* 2. THE SECURITY SHIELD (Prevents YouTube interactions) */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} onContextMenu={(e) => e.preventDefault()} />

        {/* 3. TOP HUD */}
        <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">Unknown IITians Internal</span>
              <h2 className="text-white text-xl font-bold mt-1">{title}</h2>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
              <X size={24}/>
            </button>
          </div>
        </div>

        {/* 4. BOTTOM HUD CONTROLS */}
        <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Custom Progress Bar */}
          <div className="mb-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
              {isPlaying ? <Pause size={30} fill="white"/> : <Play size={30} fill="white"/>}
            </button>
            <button onClick={() => playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10)} className="text-white/70 hover:text-white">
              <RotateCcw size={22}/>
            </button>
            
            <div className="flex-1" />

            {/* Custom Settings Popover */}
            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-blue-600 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                <Settings size={24}/>
              </button>
              {showSettings && (
                <div className="absolute bottom-14 right-0 bg-slate-900/95 border border-white/10 p-2 rounded-xl w-40 backdrop-blur-xl shadow-2xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-2">Playback Speed</p>
                  {[0.5, 1, 1.25, 1.5, 2].map(s => (
                    <button key={s} onClick={() => changeSpeed(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${playbackSpeed === s ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                      {s === 1 ? 'Normal' : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Playlist Toggle */}
            <button onClick={() => setShowPlaylist(!showPlaylist)} className={`p-2 rounded-lg transition-all ${showPlaylist ? 'text-blue-500' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
              <ListVideo size={24}/>
            </button>
            <button className="text-white/70 hover:text-white"><Maximize2 size={22}/></button>
          </div>
        </div>
      </div>

      {/* SIDE PLAYLIST DRAWER */}
      {showPlaylist && (
        <div className="w-80 bg-slate-900 border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-500">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
            <h3 className="text-white font-bold">Course Content</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-slate-500 hover:text-white"><ChevronRight/></button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
            {playlist.length > 0 ? playlist.map((item, index) => (
              <div key={item.id} className={`mx-2 mb-1 p-4 rounded-xl cursor-pointer transition-all ${item.id === videoId ? 'bg-blue-600/20 border border-blue-600/30' : 'hover:bg-white/5'}`}>
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${item.id === videoId ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold leading-tight ${item.id === videoId ? 'text-blue-400' : 'text-slate-200'}`}>{item.title}</p>
                    <span className="text-[10px] text-slate-500 mt-1 block uppercase font-bold tracking-tighter">Video • {item.duration || '15:00'}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-sm">No other videos in this playlist</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
