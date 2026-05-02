import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';
import { fetchWttrWeather } from '@/lib/wttr';
import { resolveCityHint } from '@/lib/geo';

type WardrobeLite = {
  id: string;
  name: string;
  category?: string | null;
  image_url?: string | null;
};

const SYSTEM = `You pick the best outfit from the user's wardrobe for today's weather.
Respond ONLY with JSON:
{"headline":"Today is X°C and <condition> — here's your outfit","selectedItemIds":["uuid",...],"why":"one short sentence"}
Pick 2-5 items that work together. selectedItemIds must be exact ids from the wardrobe list. No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      city?: string;
      wardrobeItems: WardrobeLite[];
      weather?: {
        tempC: number;
        description: string;
        bucket: string;
        feelsLikeC?: number;
      };
    };
    const items = Array.isArray(body.wardrobeItems) ? body.wardrobeItems : [];
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Add wardrobe items in Supabase to get picks.' },
        { status: 400 },
      );
    }
    let city = body.city?.trim();
    if (!city) {
      city = (await resolveCityHint(req)) ?? 'auto';
    }
    let w = body.weather;
    if (!w) {
      const x = await fetchWttrWeather(city);
      w = {
        tempC: x.tempC,
        description: x.description,
        bucket: x.bucket,
        feelsLikeC: x.feelsLikeC,
      };
    }
    const list = items
      .map((i) => `- id:${i.id} | ${i.name} | ${i.category ?? 'piece'} | photo:${i.image_url ? 'yes' : 'no'}`)
      .join('\n');
    const user = `Weather: ${w.tempC}°C, feels like ${w.feelsLikeC ?? w.tempC}°C, ${w.description} (${w.bucket}).
Wardrobe:
${list}`;
    const result = await anthropicJson<{
      headline: string;
      selectedItemIds: string[];
      why: string;
    }>({ system: SYSTEM, user, maxTokens: 600, model: 'claude-opus-4-5' });
    const chosen = items.filter((i) => result.selectedItemIds?.includes(i.id));
    return NextResponse.json({
      weather: w,
      cityUsed: city,
      headline: result.headline,
      why: result.why,
      selectedItemIds: result.selectedItemIds ?? [],
      selectedItems: chosen,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
