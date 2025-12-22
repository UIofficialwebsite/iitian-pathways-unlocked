import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    // 2. Access Secret (Exact name: YOUTUBE DATA API)
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_DATA_API')
    
    if (!YOUTUBE_API_KEY) {
      console.error("Missing secret: YOUTUBE DATA API");
      return new Response(
        JSON.stringify({ error: 'YouTube API Key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 3. Your Channel ID
    const CHANNEL_ID = 'UCumQJ5yZ373WXJn7DcOJcIA'; // REPLACE WITH YOUR ACTUAL CHANNEL ID

    // 4. Fetch Playlists
    const playlistsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    
    const playlistsData = await playlistsRes.json();

    if (playlistsData.error) {
      console.error("YouTube Playlists Error:", playlistsData.error);
      return new Response(
        JSON.stringify({ error: playlistsData.error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // 5. Fetch Videos for each playlist
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

    // 6. Return Data
    return new Response(
      JSON.stringify({ playlists: playlistsWithVideos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Function error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
