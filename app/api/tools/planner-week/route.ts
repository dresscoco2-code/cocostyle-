import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';

type WardrobeLite = {
  id: string;
  name: string;
  category?: string | null;
};

const SYSTEM = `You are a weekly outfit planner. For each calendar date, suggest one cohesive outfit using ONLY wardrobe item ids provided.
Respond ONLY with JSON:
{"days":{"YYYY-MM-DD":{"itemIds":["uuid"],"label":"short day theme","note":"optional"}}}
Include every date in the user list. 2-4 items per day. No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      dates: string[];
      wardrobeItems: WardrobeLite[];
    };
    const dates = body.dates ?? [];
    const items = body.wardrobeItems ?? [];
    if (!dates.length || !items.length) {
      return NextResponse.json(
        { error: 'Need dates and at least one wardrobe item.' },
        { status: 400 },
      );
    }
    const list = items
      .map((i) => `- ${i.id} | ${i.name} | ${i.category ?? ''}`)
      .join('\n');
    const user = `Dates (one outfit each):\n${dates.join('\n')}\n\nWardrobe:\n${list}`;
    const result = await anthropicJson<{ days: Record<string, { itemIds: string[]; label?: string; note?: string }> }>(
      { system: SYSTEM, user, maxTokens: 2500 },
    );
    return NextResponse.json({ days: result.days ?? {} });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
