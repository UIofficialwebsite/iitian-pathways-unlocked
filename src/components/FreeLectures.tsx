'use client';
import { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

export default function FreeLectures() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://qzrvctpwefhmcduariuw.supabase.co/functions/v1/get-youtube-playlist')
      .then(res => res.json())
      .then(data => {
        setPlaylists(data.playlists || []);
        setLoading(false);
      });
  }, []);

  // 1. THE VIDEO PLAYER VIEW (Full Page Swap)
  if (selectedVideo) {
    return (
      <VideoPlayer 
        videoId={selectedVideo.id} 
        title={selectedVideo.title} 
        onClose={() => setSelectedVideo(null)} 
      />
    );
  }

  // 2. THE LOADING STATE
  if (loading) return <div className="p-20 text-center text-gray-400 font-medium">Preparing Lectures...</div>;

  // 3. THE LIBRARY VIEW (Header + Playlists)
  return (
    <div className="animate-in fade-in duration-500">
      {/* Main Header - only visible when no video is playing */}
      <header className="bg-white border-b border-gray-100 py-10 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Free Library</h1>
          <p className="text-gray-500 mt-2 text-lg">Browse high-quality course content across all subjects.</p>
        </div>
      </header>

      <div className="container mx-auto px-4 max-w-6xl pb-20">
        <div className="space-y-16">
          {playlists.map((playlist: any, i) => (
            <section key={i}>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                {playlist.title}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {playlist.videos.map((video: any) => (
                  <div 
                    key={video.id}
                    onClick={() => {
                      setSelectedVideo(video);
                      window.scrollTo(0, 0);
                    }}
                    className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-blue-400 hover:shadow-xl transition-all overflow-hidden"
                  >
                    <div className="relative aspect-video">
                      <img src={video.thumbnail} className="w-full h-full object-cover" alt={video.title} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                         <div className="bg-white/90 p-3 rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                           <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                             <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                           </svg>
                         </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
                        {video.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
