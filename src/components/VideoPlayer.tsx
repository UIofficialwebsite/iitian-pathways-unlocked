import React, { useEffect, useRef } from 'react';

const VideoPlayer: React.FC<{ videoId: string; title: string; onClose: () => void }> = ({ videoId, title, onClose }) => {
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // Load API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const onPlayerReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,        // Hides YouTube logo and bottom bar
          modestbranding: 1,  // Minimizes branding
          rel: 0,             // No related videos
          showinfo: 0,        // Hides title/share
          iv_load_policy: 3,  // No annotations
          origin: window.location.origin
        }
      });
    };

    if (window.YT && window.YT.Player) {
      onPlayerReady();
    } else {
      window.onYouTubeIframeAPIReady = onPlayerReady;
    }

    return () => playerRef.current?.destroy();
  }, [videoId]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="p-4 bg-white flex justify-between items-center">
        <h2 className="font-bold">{title}</h2>
        <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white rounded">Close</button>
      </div>
      <div className="flex-1 relative overflow-hidden bg-black">
        {/* The Player */}
        <div id="yt-player" className="absolute inset-0 w-full h-full pointer-events-none scale-105"></div>
        
        {/* The Security Shield (Blocks clicks to logo/title) */}
        <div className="absolute inset-0 z-10 bg-transparent" />
        
        {/* Custom Branding */}
        <div className="absolute top-4 left-4 z-20 bg-black/50 px-3 py-1 rounded text-white text-xs">
          Unknown IITians
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
