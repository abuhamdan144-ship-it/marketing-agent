import type { VercelRequest, VercelResponse } from '@vercel/node';

const AL_JADEED_RATES_URL = 'https://api.dshinez.com/api/currency-rates/';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const upstream = await fetch(AL_JADEED_RATES_URL, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Al Jadeed rates feed unavailable' });
      return;
    }

    const data = await upstream.json();
    if (!Array.isArray(data)) {
      res.status(502).json({ error: 'Al Jadeed returned an invalid rates response' });
      return;
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json(data);
  } catch (error) {
    console.error('Al Jadeed rates proxy error:', error);
    res.status(502).json({ error: 'Unable to reach Al Jadeed rates feed' });
  }
}
