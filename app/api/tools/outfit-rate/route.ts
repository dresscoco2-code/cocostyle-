import { NextResponse } from 'next/server';
import { anthropicVisionJson } from '@/lib/anthropic';

export type OutfitRateResult = {
  score: number;
  compliments: string[];
  improvement: string;
};

const SYSTEM = `You are a supportive fashion critic looking at a full-body or outfit photo.
Respond ONLY with JSON:
{"score":8.5,"compliments":["specific compliment 1","specific compliment 2","specific compliment 3"],"improvement":"one concrete improvement tip"}
Score 0-10 with one decimal allowed. Compliments must be specific to what you see. No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      imageBase64: string;
      mimeType?: string;
    };
    if (!body.imageBase64?.length) {
      return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
    }
    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const raw = body.mimeType ?? 'image/jpeg';
    const mime = (allowed.has(raw) ? raw : 'image/jpeg') as
      | 'image/jpeg'
      | 'image/png'
      | 'image/webp'
      | 'image/gif';
    const result = await anthropicVisionJson<OutfitRateResult>({
      system: SYSTEM,
      userText: 'Rate this outfit today. Be kind but honest.',
      imageBase64: body.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      mediaType: mime,
      maxTokens: 800,
    });
    const score = Number(result.score);
    result.score = Number.isFinite(score) ? Math.min(10, Math.max(0, score)) : 7;
    if (!Array.isArray(result.compliments)) {
      result.compliments = [String(result.compliments)];
    }
    while (result.compliments.length < 3) {
      result.compliments.push('Great effort putting this look together.');
    }
    result.compliments = result.compliments.slice(0, 3);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
