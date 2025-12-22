import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, if-none-match',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const apiKey = Deno.env.get('YOUTUBE_DATA_API')
    // We use the ID you shared: UCumQJ5yZ373WXJn7DcOJcIA
    const channelId = 'UCumQJ5yZ373WXJn7DcOJcIA' 

    // 2. Fetch Cache and ETag from your table
    const { data: cache } = await supabase
      .from('youtube_cache')
      .select('data, etag')
      .eq('id', 'iitm_lectures')
      .maybeSingle()

    // 3. Conditional Fetch from YouTube
    // We send the stored etag. If YouTube returns 304, we skip all parsing!
    const ytUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,status&channelId=${channelId}&maxResults=50&key=${apiKey}`
    const playlistsRes = await fetch(ytUrl, { 
      headers: cache?.etag ? { 'If-None-Match': cache.etag } : {} 
    })

    // 4. Handle 304 Not Modified (Content is the same)
    if (playlistsRes.status === 304 && cache) {
      console.log("YouTube: No changes (304). Serving from DB.")
      return new Response(JSON.stringify(cache.data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      })
    }

    // 5. Handle 200 OK (Content changed or cache empty)
    const playlistsData = await playlistsRes.json()
    if (playlistsData.error) {
       throw new Error(`YouTube API Error: ${playlistsData.error.message}`)
    }

    // Fetch videos for each public playlist
    const playlistsWithVideos = await Promise.all(
      (playlistsData.items || []).map(async (playlist: any) => {
        if (playlist.status.privacyStatus !== 'public') return null

        const vRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${playlist.id}&maxResults=50&key=${apiKey}`)
        const vData = await vRes.json()
        
        const publicVideos = (vData.items || [])
          .filter((v: any) => v.status.privacyStatus === 'public')
          .map((v: any) => ({
            id: v.snippet.resourceId.videoId,
            title: v.snippet.title,
            thumbnail: v.snippet.thumbnails.high?.url || v.snippet.thumbnails.default?.url
          }))

        return publicVideos.length > 0 ? { title: playlist.snippet.title, videos: publicVideos } : null
      })
    )

    const finalData = { playlists: playlistsWithVideos.filter(p => p !== null) }
    const newEtag = playlistsRes.headers.get('etag')

    // 6. Save NEW data and NEW ETag to Database
    await supabase.from('youtube_cache').upsert({ 
      id: 'iitm_lectures', 
      data: finalData, 
      etag: newEtag, 
      last_updated: new Date().toISOString() 
    })

    console.log("YouTube: Data updated (200). DB Cache Refreshed.")
    return new Response(JSON.stringify(finalData), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (err: any) {
    console.error("Critical Error:", err.message)
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})
