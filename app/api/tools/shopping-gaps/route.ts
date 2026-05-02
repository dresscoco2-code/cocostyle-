import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';

type WardrobeLite = {
  id: string;
  name: string;
  category?: string | null;
};

const SYSTEM = `You analyze wardrobes for missing staples. Suggest exactly 5 items to buy next.
For each item estimate how many NEW outfit combinations it unlocks (integer 3-15 realistic).
Respond ONLY with JSON:
{"items":[{"name":"White shirt","why":"...","unlocksOutfits":8}]}
No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { wardrobeItems: WardrobeLite[] };
    const items = body.wardrobeItems ?? [];
    if (!items.length) {
      return NextResponse.json(
        { error: 'No wardrobe items to analyze.' },
        { status: 400 },
      );
    }
    const list = items.map((i) => `- ${i.name} (${i.category ?? 'uncategorized'})`).join('\n');
    const user = `Current wardrobe:\n${list}`;
    const result = await anthropicJson<{
      items: Array<{ name: string; why: string; unlocksOutfits: number }>;
    }>({ system: SYSTEM, user, maxTokens: 1200 });
    const top = (result.items ?? []).slice(0, 5);
    return NextResponse.json({ items: top });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
