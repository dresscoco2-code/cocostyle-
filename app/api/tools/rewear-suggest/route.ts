import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';

type Item = {
  id: string;
  name: string;
  category?: string | null;
  purchase_price: number | null;
  last_worn_at: string | null;
  daysSinceWorn: number | null;
};

const SYSTEM = `You help users rewear forgotten clothes. You receive items with days since last worn and price.
Respond ONLY with JSON:
{"outfitIdeas":[{"title":"...","itemIds":["uuid"],"hook":"You paid $X — wear it!"}],"nudge":"one warm sentence"}
Use itemIds from the list. Prefer items with 30+ days since worn when suggesting. No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items: Item[] };
    const items = body.items ?? [];
    if (!items.length) {
      return NextResponse.json(
        { error: 'No wardrobe items.' },
        { status: 400 },
      );
    }
    const lines = items.map((i) => {
      const price = i.purchase_price != null ? `$${Number(i.purchase_price).toFixed(0)}` : 'unknown price';
      const days = i.daysSinceWorn != null ? `${i.daysSinceWorn}d since worn` : 'never logged';
      return `- id:${i.id} | ${i.name} | ${i.category ?? ''} | paid:${price} | ${days}`;
    });
    const user = `Wardrobe wear stats:\n${lines.join('\n')}`;
    const result = await anthropicJson<{
      outfitIdeas: Array<{ title: string; itemIds: string[]; hook: string }>;
      nudge: string;
    }>({ system: SYSTEM, user, maxTokens: 1200 });
    return NextResponse.json({
      outfitIdeas: result.outfitIdeas ?? [],
      nudge: result.nudge ?? '',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
