import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get the relative path from the environment variable
const supabaseProxyPath = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Dynamically create the full absolute URL
// This combines the website's domain with the proxy path
const fullSupabaseUrl = `${window.location.origin}${supabaseProxyPath}`;

if (!supabaseProxyPath || !supabasePublishableKey) {
  throw new Error('Supabase URL and Key must be defined in the .env file');
}

// Initialize the client with the full URL
export const supabase = createClient<Database>(fullSupabaseUrl, supabasePublishableKey);
