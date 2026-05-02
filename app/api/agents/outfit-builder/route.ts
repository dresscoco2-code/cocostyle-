import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';
import type { SkinToneResult, OutfitBuilderResult } from '@/lib/agents/types';
import { formatSkinToneColorRulesPrompt } from '@/lib/skin-tone-colors';

export type { OutfitBuilderResult };

const SYSTEM = `You are a personal stylist. Build ONE cohesive outfit using the user's skin tone (from analysis + profile), age, gender, occasion, and wardrobe hints.
Respond ONLY with JSON:
{"title":"short outfit name","items":["4-6 specific garment/accessory pieces — name real pieces from wardrobe when listed"],"rationale":"one sentence why it works, mentioning color harmony if relevant"}
Rules:
- Follow the SKIN TONE COLOR RULES block in the user message strictly: prioritize garments whose described or implied colors match BEST colors; avoid leaning into AVOID colors unless practical weather needs override (say so in rationale).
- When wardrobe pieces are listed with names/categories, infer each piece's colors from those strings and prefer items that align with BEST colors.
- Use bestColors from the skin tone JSON together with the explicit BEST/AVOID lists (they should agree when mapping is correct).
No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      skinTone?: SkinToneResult;
      profileSkinTone?: string | null;
      profileUndertone?: string | null;
      age?: number | string;
      gender?: string;
      occasion?: string;
      wardrobeSummary?: string;
      wardrobeItems?: Array<{ name: string; category?: string | null }>;
    };
    const skin = body.skinTone
      ? JSON.stringify(body.skinTone)
      : '{"skinTone":"unknown","undertone":"neutral","bestColors":["navy","white","camel"]}';

    const skinToneLabel = body.profileSkinTone ?? body.skinTone?.skinTone;
    const undertoneLabel = body.profileUndertone ?? body.skinTone?.undertone;
    const skinToneBlock = formatSkinToneColorRulesPrompt(skinToneLabel, undertoneLabel);

    let wardrobeLines = '';
    if (body.wardrobeItems?.length) {
      wardrobeLines =
        '\nWARDROBE PIECES (infer color from each name/category — prioritize items matching BEST colors):\n' +
        body.wardrobeItems.map((i) => `- ${i.name} | ${i.category ?? 'piece'}`).join('\n');
    }

    const user = `Skin tone analysis (JSON): ${skin}

SKIN TONE COLOR RULES (apply when choosing pieces):
${skinToneBlock}

Age: ${body.age ?? 'not given'}
Gender: ${body.gender ?? 'not given'}
Occasion: ${body.occasion ?? 'everyday'}
Wardrobe hints (free text): ${body.wardrobeSummary ?? 'none'}${wardrobeLines}`;

    const result = await anthropicJson<OutfitBuilderResult>({
      system: SYSTEM,
      user,
      maxTokens: 900,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
