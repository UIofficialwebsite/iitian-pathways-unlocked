import React, { useEffect, useRef, useState } from 'react';
import { Settings, Play, Pause, ListVideo, X, ChevronRight, Maximize2, Volume2, RotateCcw } from 'lucide-react';
import { Slider } from "@/components/ui/slider"; // Assuming shadcn/ui

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
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const initPlayer = () => {
      playerRef.current = new window.YT.Player('yt-player-headless', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0, // IMPORTANT: Disables native controls
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
        
        {/* 1. THE HEADLESS VIDEO (Scaled to hide logo) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div id="yt-player-headless" className="absolute inset-0 w-[104%] h-[104%] -left-[2%] -top-[2%]" />
        </div>

        {/* 2. THE SECURITY SHIELD (Catches all clicks) */}
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} />

        {/* 3. CUSTOM TOP BAR */}
        <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">Internal Course Player</span>
            <h2 className="text-white text-xl font-semibold leading-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all">
            <X size={22}/>
          </button>
        </div>

        {/* 4. CUSTOM BOTTOM CONTROLS */}
        <div className="absolute bottom-0 inset-x-0 p-6 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          
          {/* Progress Bar */}
          <div className="mb-4 group/progress h-1.5 hover:h-2 bg-white/20 rounded-full overflow-hidden transition-all">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center gap-6">
            <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
              {isPlaying ? <Pause size={28} fill="white"/> : <Play size={28} fill="white"/>}
            </button>
            <button className="text-white/80 hover:text-white"><RotateCcw size={20}/></button>
            <div className="flex items-center gap-2 group/vol">
                <Volume2 size={20} className="text-white/80"/>
                <div className="w-0 group-hover/vol:w-20 transition-all overflow-hidden"><Slider defaultValue={[80]} max={100} /></div>
            </div>

            <div className="flex-1" />

            {/* Speed Selector Gear */}
            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className={`text-white p-2 rounded-lg transition-all ${showSettings ? 'bg-blue-600 rotate-90' : 'hover:bg-white/10'}`}>
                <Settings size={22}/>
              </button>
              {showSettings && (
                <div className="absolute bottom-14 right-0 bg-slate-900 border border-slate-700/50 p-3 rounded-xl w-40 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-2 px-2">Playback Speed</p>
                  {[0.5, 1, 1.25, 1.5, 2].map(s => (
                    <button key={s} onClick={() => changeSpeed(s)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${playbackSpeed === s ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/5'}`}>
                      {s === 1 ? 'Normal' : `${s}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setShowPlaylist(!showPlaylist)} className={`text-white p-2 rounded-lg transition-all ${showPlaylist ? 'text-blue-500' : 'hover:bg-white/10'}`}>
              <ListVideo size={24}/>
            </button>
            <button className="text-white/80 hover:text-white"><Maximize2 size={20}/></button>
          </div>
        </div>
      </div>

      {/* SIDE PLAYLIST DRAWER */}
      {showPlaylist && (
        <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full animate-in slide-in-from-right duration-500 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-30">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0">
            <div>
              <h3 className="text-white font-bold text-base">Course Content</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{playlist.length} Lessons Available</p>
            </div>
            <button onClick={() => setShowPlaylist(false)} className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg"><ChevronRight size={18}/></button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
            {playlist.map((item, index) => (
              <div key={item.id} className={`group mx-2 mb-1 p-4 rounded-xl cursor-pointer transition-all border border-transparent ${item.id === videoId ? 'bg-blue-600/10 border-blue-600/30' : 'hover:bg-white/5'}`}>
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${item.id === videoId ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <p className={`text-sm font-semibold leading-snug ${item.id === videoId ? 'text-blue-400' : 'text-slate-200'}`}>
                      {item.title}
                    </p>
                    <span className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Video • {item.duration || '12:45'}</span>
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
