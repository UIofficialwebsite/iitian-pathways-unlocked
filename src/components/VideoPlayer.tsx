import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-youtube';
import { 
  ArrowLeft, EllipsisVertical, Play, Pause, 
  RotateCcw, RotateCw, Volume2, Settings, 
  List, Expand, Flag, X 
} from 'lucide-react';

interface TimelineItem {
  time: number;
  label: string;
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
  timelines?: TimelineItem[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose, timelines = [] }) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true); // Mask during initial load

  // Progress states
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!playerRef.current && videoRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.className = 'video-js vjs-fill vjs-big-play-centered';
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: false,
        responsive: true,
        techOrder: ["youtube"],
        sources: [{ type: "video/youtube", src: `https://www.youtube.com/watch?v=${videoId}` }],
        youtube: { 
          modestbranding: 1, 
          rel: 0, 
          iv_load_policy: 3, 
          controls: 0, 
          showinfo: 0,
          autohide: 1
        }
      });

      // Hide the video until it actually starts to avoid seeing the YouTube header/watermark
      player.on('playing', () => setIsBuffering(false));
      player.on('play', () => setIsPlaying(true));
      player.on('pause', () => setIsPlaying(false));
      
      player.on('timeupdate', () => {
        setCurrentTime(player.currentTime());
        if (player.duration() > 0) {
          setDuration(player.duration());
          setProgress((player.currentTime() / player.duration()) * 100);
        }
      });
    }
    return () => playerRef.current?.dispose();
  }, [videoId]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-row overflow-hidden font-sans select-none text-white">
      <div className="relative flex-1 bg-black flex flex-col overflow-hidden">
        
        {/* TOP HUD */}
        <div className="absolute top-0 inset-x-0 p-6 z-50 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-center">
          <button onClick={onClose} className="hover:opacity-80 transition-opacity"><ArrowLeft size={24} /></button>
          <button className="hover:opacity-80"><EllipsisVertical size={24} /></button>
        </div>

        {/* VIDEO AREA */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          <div className={`w-full h-full transition-opacity duration-1000 ${isBuffering ? 'opacity-0' : 'opacity-100'}`} data-vjs-player>
            <div ref={videoRef} className="w-full h-full" />
          </div>

          {/* BRANDING SHIELD OVERLAYS */}
          {/* Top Right Shield (Masks Watch Later/Share) */}
          <div className="absolute top-0 right-0 w-64 h-24 z-30 bg-black pointer-events-none" />
          
          {/* Bottom Right Shield (Masks Watermark) */}
          <div className="absolute bottom-0 right-0 w-32 h-20 z-30 bg-black pointer-events-none" />

          {/* Interaction Shield */}
          <div className="absolute inset-0 z-20 cursor-default" onClick={() => isPlaying ? playerRef.current.pause() : playerRef.current.play()} />
          
          {/* Initial Loading Spinner */}
          {isBuffering && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* BOTTOM HUD */}
        <div className="absolute bottom-0 inset-x-0 p-8 pt-20 z-50 bg-gradient-to-t from-black/90 to-transparent">
          <div className="w-full h-1.5 bg-white/20 rounded-full mb-6 relative overflow-hidden cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            playerRef.current.currentTime(((e.clientX - rect.left) / rect.width) * duration);
          }}>
            <div className="absolute h-full bg-[#0056D2] rounded-full" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button onClick={() => isPlaying ? playerRef.current.pause() : playerRef.current.play()}>
                {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
              </button>
              <button onClick={() => playerRef.current.currentTime(currentTime - 10)} className="relative flex items-center justify-center"><RotateCcw size={28} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button onClick={() => playerRef.current.currentTime(currentTime + 10)} className="relative flex items-center justify-center"><RotateCw size={28} /><span className="absolute text-[8px] font-black mt-1">10</span></button>
              <button><Volume2 size={24} /></button>
              <span className="text-sm font-medium opacity-80 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-6">
              <button><Settings size={24} /></button>
              <button onClick={() => setShowTimeline(!showTimeline)} className={showTimeline ? 'text-[#0056D2]' : ''}><List size={24} /></button>
              <button onClick={() => playerRef.current.requestFullscreen()}><Expand size={24} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE SIDEBAR */}
      {showTimeline && (
        <aside className="w-[350px] h-full bg-white flex flex-col z-[60] border-l border-gray-300 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center p-4 border-b border-[#efefef]">
            <h3 className="text-[#1a1a1a] text-base font-semibold m-0 tracking-tight">Timeline</h3>
            <button onClick={() => setShowTimeline(false)} className="text-[#333] hover:opacity-60 transition-opacity"><X size={20} /></button>
          </div>

          <div className="flex-1 flex flex-col">
            {timelines.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {timelines.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => playerRef.current.currentTime(item.time)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex justify-between items-center group transition-colors border border-transparent hover:border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs font-bold text-[#7d84d1]">{formatTime(item.time)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center pb-20 px-10 text-center">
                <div className="w-[130px] h-[130px] mb-5">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25 40L50 28L75 40V65L50 77L25 65V40Z" stroke="#7d84d1" strokeWidth="2.5" strokeLinejoin="round"/>
                    <path d="M25 40L50 52L75 40" stroke="#7d84d1" strokeWidth="2.5" strokeLinejoin="round"/>
                    <path d="M50 52V77" stroke="#7d84d1" strokeWidth="2.5" strokeLinejoin="round"/>
                    <circle cx="72" cy="32" r="10" fill="white" stroke="#7d84d1" strokeWidth="2.5"/>
                    <line x1="68" y1="28" x2="76" y2="36" stroke="#7d84d1" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="76" y1="28" x2="68" y2="36" stroke="#7d84d1" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M78 40L86 48" stroke="#7d84d1" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="text-[15px] font-semibold text-[#1a1a1a] m-0">No timeline yet!</p>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};

export default VideoPlayer;
