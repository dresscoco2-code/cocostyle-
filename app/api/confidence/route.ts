import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';
import { formatSkinToneColorRulesPrompt } from '@/lib/skin-tone-colors';

type WardrobeLite = {
  id: string;
  name: string;
  category?: string | null;
  image_url?: string | null;
  color?: string | null;
};

const SYSTEM = `You are a CocoStyle personal stylist. Build ONE cohesive outfit for the user's OCCASION using ONLY pieces from their wardrobe list (by id).
Use their skin-tone color guidance to favor flattering colors.

Respond ONLY with JSON:
{"headline":"short exciting title for this occasion","selectedItemIds":["uuid",...],"why":"1-2 sentences: why this combo works + color harmony","confidenceScore":82}

Rules:
- confidenceScore: integer 0-100 = how confident you are this outfit suits the occasion, their coloring, and what they own.
- Pick 2-6 items that work together; every selectedItemIds entry must be an exact id from the wardrobe lines.
- No markdown, no extra keys.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return NextResponse.json(
      {
        error:
          'AI outfit generation is not configured. Add ANTHROPIC_API_KEY in your project environment (e.g. Vercel → Settings → Environment Variables).',
      },
      { status: 503 },
    );
  }

  try {
    const body = (await req.json()) as {
      occasion?: string;
      wardrobeItems?: WardrobeLite[];
      profileSkinTone?: string | null;
      profileUndertone?: string | null;
    };

    const occasion = body.occasion?.trim() || 'Everyday';
    const items = Array.isArray(body.wardrobeItems) ? body.wardrobeItems : [];
    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Add wardrobe items first to get outfit ideas.' },
        { status: 400 },
      );
    }

    const skinBlock = formatSkinToneColorRulesPrompt(
      body.profileSkinTone ?? null,
      body.profileUndertone ?? null,
    );

    const list = items
      .map(
        (i) =>
          `- id:${i.id} | ${i.name} | ${i.category ?? 'piece'} | color_hint:${i.color ?? 'unknown'} | photo:${i.image_url ? 'yes' : 'no'}`,
      )
      .join('\n');

    const user = `OCCASION: ${occasion}

${skinBlock}

WARDROBE (choose only from these ids):
${list}`;

    const result = await anthropicJson<{
      headline: string;
      selectedItemIds: string[];
      why: string;
      confidenceScore: number;
    }>({
      system: SYSTEM,
      user,
      maxTokens: 900,
      model: 'claude-opus-4-5',
    });

    const rawScore = Number(result.confidenceScore);
    const confidenceScore = Number.isFinite(rawScore)
      ? Math.min(100, Math.max(0, Math.round(rawScore)))
      : 70;

    const chosen = items.filter((i) => result.selectedItemIds?.includes(i.id));

    return NextResponse.json({
      occasion,
      headline: result.headline ?? `Your ${occasion} look`,
      why: result.why ?? '',
      confidenceScore,
      selectedItemIds: result.selectedItemIds ?? [],
      selectedItems: chosen,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    const isKey =
      message.includes('ANTHROPIC_API_KEY') ||
      message.toLowerCase().includes('api key') ||
      message.includes('401');
    return NextResponse.json(
      {
        error: isKey
          ? 'Anthropic request failed. Confirm ANTHROPIC_API_KEY is set for Production in Vercel and redeploy.'
          : message,
      },
      { status: 500 },
    );
  }
}
