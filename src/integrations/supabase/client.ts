import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const realtimeUrl = import.meta.env.VITE_SUPABASE_REALTIME_URL;

if (!supabaseUrl || !supabaseKey || !realtimeUrl) {
  throw new Error('Supabase environment variables are not fully defined. Check VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, and VITE_SUPABASE_REALTIME_URL.');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    // This is the crucial part.
    // It tells Supabase to use a different URL for real-time connections.
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
      // This overrides the WebSocket URL
      transport: new WebSocket(realtimeUrl),
    },
  }
);
