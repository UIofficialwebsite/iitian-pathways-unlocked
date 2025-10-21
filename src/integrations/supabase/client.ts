import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseProxyPath = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// This is the key change: We construct the full URL differently
// depending on whether we are on the server (during build) or in the browser.
const getSupabaseUrl = () => {
  // Check if we are in a browser environment
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${supabaseProxyPath}`;
  }
  // Otherwise, we are on the server (Vercel build).
  // Vercel provides the deployment URL in an environment variable.
  // Make sure your Vercel project has VITE_VERCEL_URL set to the project URL.
  const vercelUrl = import.meta.env.VITE_VERCEL_URL;
  if (vercelUrl) {
    return `${vercelUrl}${supabaseProxyPath}`;
  }

  // Fallback for local development if VITE_VERCEL_URL is not set
  return `http://localhost:5173${supabaseProxyPath}`;
};


if (!supabaseProxyPath || !supabasePublishableKey) {
  throw new Error('Supabase URL and Key must be defined in the .env file');
}

const supabaseUrl = getSupabaseUrl();

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey);
