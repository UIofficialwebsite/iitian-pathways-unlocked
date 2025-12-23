import React, { useEffect, useRef, useState } from 'react';
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
  const [showPlaylist, setShowPlaylist] = useState(false); // Playlist hidden by default

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      // Use vjs-fill to make the player fill its container exactly without extra padding
      videoElement.className = 'video-js vjs-big-play-centered vjs-fill vjs-theme-city';
      videoRef.current.appendChild(videoElement);

      playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        techOrder: ["youtube"],
        sources: [{ type: "video/youtube", src: `https://www.youtube.com/watch?v=${videoId}` }],
        youtube: { 
          modestbranding: 1, // Minimize logo
          rel: 0, 
          iv_load_policy: 3, // Disable annotations/watermarks
          controls: 0 
        }
      });
    }
    return () => playerRef.current?.dispose();
  }, [videoId]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans">
      <div className="relative flex-1 flex flex-col bg-black overflow-hidden">
        {/* Top Header */}
        <div className="absolute top-0 inset-x-0 p-6 z-30 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center">
          <h2 className="text-white font-bold text-lg leading-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white transition-all">
            <X size={24}/>
          </button>
        </div>

        {/* Console Viewport - This container dictates the video size */}
        <div className="flex-1 relative flex items-center justify-center">
          <div className="w-full h-full max-h-screen relative" data-vjs-player>
            <div ref={videoRef} className="w-full h-full" />
          </div>
        </div>

        {/* Floating Playlist Toggle (Only appears if user selects it) */}
        {!showPlaylist && (
          <button 
            onClick={() => setShowPlaylist(true)}
            className="absolute bottom-10 right-10 z-50 p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-105 transition-transform"
          >
            <ListVideo size={24}/>
          </button>
        )}
      </div>

      {/* Logic-Based Playlist Sidebar */}
      {showPlaylist && (
        <div className="w-80 bg-[#0B0F1A] border-l border-white/10 flex flex-col z-50 animate-in slide-in-from-right duration-300 shadow-2xl">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest">Lectures</h3>
            <button onClick={() => setShowPlaylist(false)} className="text-slate-500 hover:text-white">
              <ChevronRight size={22}/>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[#0B0F1A]">
            {playlist.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl cursor-pointer flex gap-4 items-center border ${item.id === videoId ? 'bg-blue-600 border-blue-400' : 'hover:bg-white/5 border-transparent'}`}
              >
                <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-black ${item.id === videoId ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-500'}`}>
                  {index + 1}
                </div>
                <p className={`text-xs font-bold truncate ${item.id === videoId ? 'text-white' : 'text-slate-400'}`}>{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
