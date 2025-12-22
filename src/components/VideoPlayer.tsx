import React from 'react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, onClose }) => {
  return (
    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Back Button */}
      <button 
        onClick={onClose}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
      >
        <span className="mr-2">←</span> Back to Playlists
      </button>
      
      {/* Video Container with Shadow & Rounded Corners */}
      <div className="bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
        <div className="aspect-video w-full">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      </div>

      {/* Video Info Card */}
      <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h2>
        <p className="mt-2 text-sm text-gray-500 uppercase tracking-wider font-semibold">
          Now Playing
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
