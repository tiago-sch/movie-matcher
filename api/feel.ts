import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFeel } from './_lib/feels.js';

/** GET /api/feel?id=… — public, read-only access to a saved search. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method-not-allowed' });
  }
  const id = typeof req.query.id === 'string' ? req.query.id : '';
  try {
    const feel = await getFeel(id);
    if (!feel) return res.status(404).json({ error: 'not-found' });
    // Saved feels never change, so let the CDN absorb repeated opens of shared links
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(feel);
  } catch (err) {
    console.error('Failed to load feel', err);
    return res.status(500).json({ error: 'generic' });
  }
}
