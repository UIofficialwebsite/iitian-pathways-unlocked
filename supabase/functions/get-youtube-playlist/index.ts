import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers including the critical 'if-none-match' for ETags
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, if-none-match',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const apiKey = Deno.env.get('YOUTUBE_DATA_API')
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID')

    // 1. Get the last stored ETag and cached data from your table
    const { data: cache } = await supabase
      .from('youtube_cache')
      .select('data, etag')
      .eq('id', 'iitm_lectures')
      .single()

    // 2. Conditional Fetch: Pass the ETag to YouTube
    const playlistsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,status&channelId=${channelId}&maxResults=50&key=${apiKey}`,
      { 
        headers: cache?.etag ? { 'If-None-Match': cache.etag } : {} 
      }
    )

    // 3. Status 304: Content is still "Fresh" on YouTube
    if (playlistsRes.status === 304) {
      console.log("304 Not Modified: Serving fresh data from database cache.")
      return new Response(JSON.stringify(cache.data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    }

    // 4. Status 200: Content changed! Update everything
    console.log("200 OK: Channel changed. Fetching new videos...")
    const playlistsData = await playlistsRes.json()
    const newEtag = playlistsRes.headers.get('etag')

    if (playlistsData.error) throw new Error(playlistsData.error.message)

    const playlistsWithVideos = await Promise.all(
      (playlistsData.items || []).map(async (playlist: any) => {
        // Only show public playlists
        if (playlist.status.privacyStatus !== 'public') return null

        const vRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${playlist.id}&maxResults=50&key=${apiKey}`
        )
        const vData = await vRes.json()
        
        // Filter out private/deleted videos
        const publicVideos = (vData.items || [])
          .filter((v: any) => v.status.privacyStatus === 'public')
          .map((v: any) => ({
            id: v.snippet.resourceId.videoId,
            title: v.snippet.title,
            thumbnail: v.snippet.thumbnails.high?.url || v.snippet.thumbnails.default?.url
          }))

        // Don't show playlist if it's empty
        return publicVideos.length > 0 ? { title: playlist.snippet.title, videos: publicVideos } : null
      })
    )

    const finalData = { 
      playlists: playlistsWithVideos.filter(p => p !== null) 
    }

    // 5. Update the Database with new data and new ETag
    await supabase
      .from('youtube_cache')
      .upsert({ 
        id: 'iitm_lectures', 
        data: finalData, 
        etag: newEtag, 
        last_updated: new Date().toISOString() 
      })

    return new Response(JSON.stringify(finalData), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (err: any) {
    console.error("Error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})
