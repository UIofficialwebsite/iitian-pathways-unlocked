import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';
import { X, ListVideo, ChevronRight } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  playlist?: { id: string; title: string }[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, playlist = [] }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [showPlaylist, setShowPlaylist] = React.useState(true);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-city');
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
          modestbranding: 1, 
          rel: 0, 
          iv_load_policy: 3 
        }
      }, () => {
        console.log('Player is ready');
      });
    } else if (playerRef.current) {
      // If player exists, just update the source for new videoId
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
    <div className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans">
      <div className="relative flex-1 bg-black flex flex-col group">
        {/* Top Header */}
        <div className="absolute top-0 inset-x-0 p-6 z-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md">
            <X size={24}/>
          </button>
        </div>

        {/* Video.js Container */}
        <div className="flex-1 flex items-center justify-center">
          <div data-vjs-player className="w-full">
            <div ref={videoRef} />
          </div>
        </div>

        {/* Toggle Playlist Button (Mobile/HUD) */}
        {!showPlaylist && (
          <button 
            onClick={() => setShowPlaylist(true)}
            className="absolute bottom-6 right-6 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"
          >
            <ListVideo size={24}/>
          </button>
        )}
      </div>

      {/* Playlist Sidebar */}
      {showPlaylist && (
        <div className="w-80 bg-neutral-950 border-l border-white/10 flex flex-col z-30 shadow-2xl">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black">
            <h3 className="text-white font-bold text-sm uppercase">Playlist</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-neutral-500 hover:text-white">
              <ChevronRight size={22}/>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-black">
            {playlist.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl cursor-pointer flex gap-4 items-center border ${item.id === videoId ? 'bg-white border-white' : 'hover:bg-neutral-900 border-transparent'}`}
              >
                <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold ${item.id === videoId ? 'bg-black text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                  {index + 1}
                </div>
                <p className={`text-xs font-bold truncate ${item.id === videoId ? 'text-black' : 'text-white'}`}>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
