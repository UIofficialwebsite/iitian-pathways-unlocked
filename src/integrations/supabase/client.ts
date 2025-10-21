import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// This safety check is crucial. If it fails, the problem is in the environment variables.
if (!supabaseUrl || !supabaseKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be defined in your deployment environment.');
}

// This is all you need.
// Regular API calls will use your proxy.
// The Supabase client will automatically use the correct direct wss:// URL for real-time.
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
