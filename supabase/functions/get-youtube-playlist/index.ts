import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers to fix "blocked by CORS policy"
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // 1. Handle CORS Preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Access secret using the exact name you provided
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE DATA API')
    
    if (!YOUTUBE_API_KEY) {
      throw new Error('Secret "YOUTUBE DATA API" not found in Supabase')
    }

    // Replace with your actual YouTube Channel ID
    const CHANNEL_ID = 'UCxxxxxxxxxxxxxxxxxxxxxx'; 
    
    // 3. Fetch playlists from your channel
    const playlistsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    const playlistsData = await playlistsRes.json();

    if (playlistsData.error) throw new Error(playlistsData.error.message);

    // 4. Fetch videos for each playlist found
    const playlistsWithVideos = await Promise.all(
      (playlistsData.items || []).map(async (playlist: any) => {
        const videosRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist.id}&maxResults=20&key=${YOUTUBE_API_KEY}`
        );
        const videosData = await videosRes.json();
        
        return {
          title: playlist.snippet.title,
          videos: (videosData.items || []).map((item: any) => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
          }))
        };
      })
    );

    // 5. Return success with CORS headers
    return new Response(
      JSON.stringify({ playlists: playlistsWithVideos }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
