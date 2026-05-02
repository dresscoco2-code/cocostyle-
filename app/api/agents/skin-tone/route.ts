import { NextResponse } from 'next/server';
import { anthropicJson, anthropicVisionJson } from '@/lib/anthropic';
import type { SkinToneResult } from '@/lib/agents/types';

export type { SkinToneResult };

const SYSTEM = `You are a color analyst. Infer skin tone category, undertone, and best clothing colors.
Respond ONLY with JSON:
{"skinTone":"e.g. medium deep warm","undertone":"warm|cool|neutral","bestColors":["3-6 color names suitable for clothing"]}
No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
      notes?: string;
    };

    const hasImage = Boolean(body.imageBase64?.replace(/^data:image\/\w+;base64,/, '').trim());

    let result: SkinToneResult;

    if (hasImage) {
      const imageBase64 = body.imageBase64!.replace(/^data:image\/\w+;base64,/, '');
      const mimeRaw = body.mimeType?.startsWith('image/') ? body.mimeType : 'image/jpeg';
      const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
      const mediaType = (allowed.has(mimeRaw) ? mimeRaw : 'image/jpeg') as
        | 'image/jpeg'
        | 'image/png'
        | 'image/webp'
        | 'image/gif';

      result = await anthropicVisionJson<SkinToneResult>({
        system: SYSTEM,
        userText:
          body.notes?.trim() ||
          'Analyze this selfie: face/neck visible skin. Return skinTone (descriptive), undertone (warm, cool, or neutral), and bestColors for clothing.',
        imageBase64,
        mediaType,
        maxTokens: 600,
        model: 'claude-opus-4-5',
      });
    } else {
      const user =
        body.notes?.trim() ||
        'No selfie provided; return balanced neutral assumptions for skinTone, undertone, and bestColors.';
      result = await anthropicJson<SkinToneResult>({
        system: SYSTEM,
        user,
        maxTokens: 500,
        model: 'claude-opus-4-5',
      });
    }

    if (!Array.isArray(result.bestColors)) {
      result.bestColors = [String(result.bestColors)];
    }
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
