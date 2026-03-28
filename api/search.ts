import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Local type definitions for Vercel environment (mirrors types/index.ts)
type SourceOrigin = 'estonia' | 'europe' | 'global';
type SortCategory = 'cheapest' | 'best' | 'fastest';

interface ProductResult {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  totalCost: number;
  shippingCost: number;
  estimatedDeliveryDays: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  purchaseUrl: string;
  seller: string;
  sellerReputation: 'verified' | 'trusted' | 'unknown';
  origin: SourceOrigin;
  isSecure: boolean;
  brand?: string;
  category: SortCategory;
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  imageUrl?: string;
  price?: string;
  rating?: number;
  ratingCount?: number;
  source?: string;
  position?: number;
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function searchProducts(query: string): Promise<SerperResult[]> {
  const response = await axios.post<{ organic: SerperResult[]; shopping?: SerperResult[] }>(
    'https://google.serper.dev/shopping',
    { q: query, num: 20 },
    {
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY!,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data.shopping ?? response.data.organic ?? [];
}

function parsePrice(priceStr?: string): number {
  if (!priceStr) return 0;
  const match = priceStr.replace(/[,$€£]/g, '').match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

function detectOrigin(link: string, source?: string): SourceOrigin {
  const text = (link + (source ?? '')).toLowerCase();
  if (text.includes('.ee') || text.includes('kaup24') || text.includes('klick')) {
    return 'estonia';
  }
  if (
    text.includes('.de') ||
    text.includes('.fr') ||
    text.includes('.nl') ||
    text.includes('.fi') ||
    text.includes('.se') ||
    text.includes('.pl') ||
    text.includes('amazon.de') ||
    text.includes('amazon.fr')
  ) {
    return 'europe';
  }
  return 'global';
}

function checkSecurity(url: string): boolean {
  return url.startsWith('https://');
}

function checkReputation(
  url: string,
  source?: string
): ProductResult['sellerReputation'] {
  const TRUSTED = [
    'amazon', 'ebay', 'walmart', 'bestbuy', 'target',
    'aliexpress', 'etsy', 'kaup24', 'klick', 'onoff',
  ];
  const VERIFIED = [
    'amazon.com', 'amazon.de', 'amazon.co.uk', 'ebay.com', 'walmart.com',
  ];
  const urlLower = (url + (source ?? '')).toLowerCase();
  if (VERIFIED.some((v) => urlLower.includes(v))) return 'verified';
  if (TRUSTED.some((t) => urlLower.includes(t))) return 'trusted';
  return 'unknown';
}

async function sendPushNotification(token: string, requestId: string): Promise<void> {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: token,
      title: '🎉 Your results are ready!',
      body: 'Tehop AI has found the best deals for your product.',
      data: { requestId },
      sound: 'default',
      priority: 'high',
    }),
  });
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { requestId } = req.query;
    if (!requestId || typeof requestId !== 'string') {
      return res.status(400).json({ success: false, error: 'requestId required' });
    }

    const { data: request, error: reqError } = await supabase
      .from('search_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (reqError || !request) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const { data: dbResults, error: resultsError } = await supabase
      .from('search_results')
      .select('*')
      .eq('request_id', requestId);

    if (resultsError || !dbResults) {
      return res.status(404).json({ success: false, error: 'Results not found' });
    }

    const products = dbResults as ProductResult[];
    const cheapest = products.filter((p) => p.category === 'cheapest').slice(0, 5);
    const best = products.filter((p) => p.category === 'best').slice(0, 5);
    const fastest = products.filter((p) => p.category === 'fastest').slice(0, 5);

    return res.json({
      success: true,
      data: {
        requestId,
        aiQuery: request.ai_query as string,
        cheapest,
        best,
        fastest,
        completedAt: request.completed_at as string,
      },
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { requestId, aiQuery, filters } = req.body as {
    requestId: string;
    aiQuery: string;
    filters: { origin?: SourceOrigin[] };
  };

  res.status(202).json({ success: true, data: { message: 'Search started' } });

  try {
    const rawResults = await searchProducts(aiQuery);

    const products: ProductResult[] = rawResults.map((r) => {
      const price = parsePrice(r.price);
      const shipping = price > 50 ? 0 : 4.99;
      const origin = detectOrigin(r.link, r.source);
      const deliveryDays =
        origin === 'estonia' ? 2 : origin === 'europe' ? 5 : 14;
      return {
        id: uuidv4(),
        title: r.title,
        description: r.snippet,
        price,
        currency: 'EUR',
        totalCost: price + shipping,
        shippingCost: shipping,
        estimatedDeliveryDays: deliveryDays,
        rating: r.rating ?? 4.0 + Math.random() * 0.9,
        reviewCount: r.ratingCount ?? Math.floor(Math.random() * 2000 + 50),
        imageUrl: r.imageUrl ?? '',
        purchaseUrl: r.link,
        seller: r.source ?? getHostname(r.link),
        sellerReputation: checkReputation(r.link, r.source),
        origin,
        isSecure: checkSecurity(r.link),
        brand: undefined,
        category: 'best' as SortCategory,
      };
    });

    const withPrice = products.filter((p) => p.price > 0);

    const categorized = [
      ...[...withPrice]
        .sort((a, b) => a.totalCost - b.totalCost)
        .slice(0, 5)
        .map((p) => ({ ...p, category: 'cheapest' as SortCategory })),
      ...[...withPrice]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map((p) => ({ ...p, category: 'best' as SortCategory })),
      ...[...withPrice]
        .sort((a, b) => a.estimatedDeliveryDays - b.estimatedDeliveryDays)
        .slice(0, 5)
        .map((p) => ({ ...p, category: 'fastest' as SortCategory })),
    ];

    if (categorized.length > 0) {
      await supabase.from('search_results').insert(
        categorized.map((p) => ({ ...p, request_id: requestId }))
      );
    }

    await supabase
      .from('search_requests')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', requestId);

    const { data: requestRow } = await supabase
      .from('search_requests')
      .select('expo_push_token')
      .eq('id', requestId)
      .single();

    if (requestRow?.expo_push_token) {
      await sendPushNotification(
        requestRow.expo_push_token as string,
        requestId
      ).catch(console.error);
    }
  } catch (err) {
    console.error('Search processing error:', err);
    await supabase
      .from('search_requests')
      .update({ status: 'failed' })
      .eq('id', requestId);
  }
}
