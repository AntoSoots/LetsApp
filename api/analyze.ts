import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeWithAI(textInput: string, imageBase64?: string): Promise<string> {
  const systemPrompt = `You are a product sourcing expert. Given a product description and/or image, generate a highly specific and descriptive search query that would find the best matching products on e-commerce sites. The query should be in English, specific about materials, features, and use cases. Return ONLY the search query, nothing else.`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (imageBase64) {
    messages.push({
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' },
        },
        {
          type: 'text',
          text: textInput
            ? `Product description: ${textInput}. Generate a specific e-commerce search query for this product.`
            : 'Generate a specific e-commerce search query for this product in the image.',
        },
      ],
    });
  } else {
    messages.push({
      role: 'user',
      content: `Product description: "${textInput}". Generate a specific e-commerce search query.`,
    });
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 150,
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content?.trim() ?? textInput;
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
    const { data, error } = await supabase
      .from('search_requests')
      .select('status, ai_query')
      .eq('id', requestId)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }
    return res.json({
      success: true,
      data: { status: data.status as string, aiQuery: data.ai_query as string | undefined },
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { textInput, imageBase64, filters, expoPushToken } = req.body as {
    textInput: string;
    imageBase64?: string;
    filters: object;
    expoPushToken?: string;
  };

  if (!textInput && !imageBase64) {
    return res.status(400).json({ success: false, error: 'textInput or imageBase64 required' });
  }

  const requestId = uuidv4();

  await supabase.from('search_requests').insert({
    id: requestId,
    text_input: textInput,
    has_image: Boolean(imageBase64),
    filters,
    expo_push_token: expoPushToken,
    status: 'processing',
    created_at: new Date().toISOString(),
  });

  // Respond immediately, process in background
  res.status(202).json({ success: true, data: { requestId } });

  try {
    const aiQuery = await analyzeWithAI(textInput, imageBase64);

    await supabase
      .from('search_requests')
      .update({ ai_query: aiQuery, status: 'analyzing' })
      .eq('id', requestId);

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, aiQuery, filters }),
    }).catch(console.error);
  } catch (err) {
    console.error('Background processing error:', err);
    await supabase
      .from('search_requests')
      .update({ status: 'failed' })
      .eq('id', requestId);
  }
}
