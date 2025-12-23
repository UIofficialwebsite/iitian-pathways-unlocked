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
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,        // Total custom control mode
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          disablekb: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onStateChange: (event: any) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
    return () => playerRef.current?.destroy();
  }, [videoId]);

  const togglePlay = () => {
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const changeSpeed = (speed: number) => {
    playerRef.current.setPlaybackRate(speed);
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col md:flex-row animate-in fade-in duration-300">
      
      {/* LEFT SIDE: MAIN PLAYER AREA */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-30 flex justify-between items-center">
          <h2 className="text-white font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"><X size={20}/></button>
        </div>

        {/* Video Frame */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
           <div id="yt-player" className="absolute inset-0 w-full h-full pointer-events-none scale-105"></div>
           {/* SECURITY SHIELD */}
           <div className="absolute inset-0 z-10 bg-transparent" onContextMenu={(e) => e.preventDefault()} onClick={togglePlay} />
        </div>

        {/* CUSTOM BOTTOM CONTROLS */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent z-30 flex items-center gap-4">
          <button onClick={togglePlay} className="text-white">
            {isPlaying ? <Pause fill="white"/> : <Play fill="white"/>}
          </button>
          
          <div className="flex-1" /> {/* Spacer */}

          {/* Speed/Quality Settings */}
          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className="text-white hover:rotate-45 transition-transform">
              <Settings size={22}/>
            </button>
            {showSettings && (
              <div className="absolute bottom-12 right-0 bg-slate-900 border border-slate-700 p-2 rounded-lg w-32 shadow-2xl animate-in slide-in-from-bottom-2">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 px-2">Playback Speed</p>
                {[0.5, 1, 1.5, 2].map(speed => (
                  <button 
                    key={speed}
                    onClick={() => changeSpeed(speed)}
                    className={`w-full text-left px-2 py-1.5 rounded text-sm ${playbackSpeed === speed ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/10'}`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Playlist Icon */}
          <button onClick={() => setShowPlaylist(!showPlaylist)} className="text-white">
            <ListVideo size={22}/>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: PLAYLIST COLUMN (Custom PW-style Drawer) */}
      {showPlaylist && (
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-white font-bold text-sm">Course Playlist</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-slate-400"><ChevronRight/></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {playlist.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-4 flex gap-3 cursor-pointer hover:bg-white/5 border-b border-slate-800/50 ${item.id === videoId ? 'bg-blue-600/10' : ''}`}
              >
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                  {index + 1}
                </div>
                <p className={`text-xs font-medium ${item.id === videoId ? 'text-blue-400' : 'text-slate-300'}`}>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
