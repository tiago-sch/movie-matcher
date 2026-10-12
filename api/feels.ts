import type { VercelRequest, VercelResponse } from '@vercel/node';
import { userIdFromAuthHeader } from './_lib/firebase.js';
import { listUserFeels, removeUserFeel } from './_lib/feels.js';
import { isAllowedOrigin } from './_lib/hosts.js';

/**
 * GET /api/feels         — the signed-in user's saved searches
 * DELETE /api/feels?id=… — remove one from the list (its public link keeps working)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'GET, DELETE');
    return res.status(405).json({ error: 'method-not-allowed' });
  }
  if (req.method === 'DELETE' && !isAllowedOrigin(req.headers.origin)) {
    return res.status(403).json({ error: 'forbidden-origin' });
  }

  const uid = await userIdFromAuthHeader(req.headers.authorization);
  if (!uid) return res.status(401).json({ error: 'unauthorized' });

  try {
    if (req.method === 'DELETE') {
      await removeUserFeel(uid, typeof req.query.id === 'string' ? req.query.id : '');
      return res.status(204).end();
    }
    return res.status(200).json({ feels: await listUserFeels(uid) });
  } catch (err) {
    console.error('Failed to access user feels', err);
    return res.status(500).json({ error: 'generic' });
  }
}
