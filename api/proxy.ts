import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Get the destination path from the request URL
  const path = (req.query.path as string[])?.join('/') || '';

  // Your actual Supabase URL
  const supabaseUrl = 'https://qzrvctpwefhmcduariuw.supabase.co';

  // Construct the full Supabase URL
  const targetUrl = `${supabaseUrl}/${path}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        // Replace with your Supabase anon key
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cnZjdHB3ZWZobWNkdWFyaXV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MTAxNDYsImV4cCI6MjA2MjA4NjE0Nn0.VK1JfGf1zhXbiOc_1N03HQnA0xlpGoynjXRkb_k2NJ0',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while proxying the request.' });
  }
}
