import type { VercelRequest, VercelResponse } from '@vercel/node';

const AL_JADEED_RATES_URL = 'https://api.dshinez.com/api/currency-rates/';
const PK_EXCHANGE_RATES_URL = 'https://www.pkexchange.com.om/rates/';

const CORRIDOR_CODES = ['PKR', 'INR', 'PHP', 'BDT', 'NPR', 'LKR', 'EGP', 'USD'];
const COUNTRY_TO_CODE: Record<string, string> = {
  'PAKISTAN': 'PKR',
  'INDIA': 'INR',
  'PHILIPPINES': 'PHP',
  'BANGLADESH': 'BDT',
  'NEPAL': 'NPR',
  'SRI LANKA': 'LKR',
  'EGYPT': 'EGP',
  'USA': 'USD',
  'US DOLLARS': 'USD',
};

function cleanText(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumber(value: string | undefined) {
  if (!value) return null;
  const number = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(number) ? number : null;
}

function parsePkExchangeRates(html: string) {
  const rates: Record<string, { tt: number | null; cashPay: number | null; buy: number | null; sell: number | null }> = {};
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];

  for (const row of rows) {
    const cells = [...row.matchAll(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi)].map((match) => cleanText(match[1]));
    if (cells.length < 5) continue;
    const code = COUNTRY_TO_CODE[cells[0].toUpperCase()];
    if (!code || !CORRIDOR_CODES.includes(code)) continue;
    rates[code] = {
      tt: parseNumber(cells[1]),
      cashPay: parseNumber(cells[2]),
      buy: parseNumber(cells[3]),
      sell: parseNumber(cells[4]),
    };
  }

  const publishedDate = cleanText(html.match(/<p[^>]*class=["'][^"']*text-muted[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] || '') || null;
  return { rates, publishedDate };
}

async function fetchJson() {
  const response = await fetch(AL_JADEED_RATES_URL, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Al Jadeed responded with ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Al Jadeed returned an invalid rates response');
  return data;
}

async function fetchHtml() {
  const response = await fetch(PK_EXCHANGE_RATES_URL, {
    headers: { Accept: 'text/html', 'User-Agent': 'Mozilla/5.0 (compatible; AlJadeedMarketingAgent/1.0)' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`PK Exchange responded with ${response.status}`);
  return response.text();
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const [alJadeed, pkHtml] = await Promise.all([fetchJson(), fetchHtml()]);
    const pkExchange = parsePkExchangeRates(pkHtml);
    const fetchedAt = new Date().toISOString();

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      fetchedAt,
      alJadeed,
      pkExchange: {
        source: 'PK Exchange Oman',
        sourceUrl: PK_EXCHANGE_RATES_URL,
        ...pkExchange,
      },
      westernUnion: {
        source: 'PK Remit / Western Union reference quote',
        sourceUrl: 'https://apps.apple.com/om/app/pk-remit/id6514312805',
        status: 'reference',
        quoteDate: '2026-09-27',
        fee: 2,
        vat: 0.1,
        deliveryType: 'Direct to bank',
        note: 'Reference quote transcribed from the user-provided PK Remit screenshot. It is not an official public API feed and should be refreshed manually when the PK Remit quote changes.',
        rates: {
          BDT: { tt: 319.2559792, cashPay: null, buy: null, sell: null },
        },
      },
    });
  } catch (error) {
    console.error('Combined exchange rates proxy error:', error);
    res.status(502).json({ error: 'Unable to reach one or more live exchange-rate feeds' });
  }
}
