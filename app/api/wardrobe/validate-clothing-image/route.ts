import { NextResponse } from 'next/server';
import { anthropicVisionJson } from '@/lib/anthropic';

type ValidateResult = {
  error?: string;
  valid?: boolean;
  product_only_flat_hanger_or_mannequin?: boolean;
  description?: string;
  color?: string;
  style?: string;
  occasion?: string;
  tip?: string;
};

const SYSTEM = `You validate upload images for a wardrobe inventory app. Reply with ONE JSON object only — no markdown, no prose outside JSON.

NON-NEGOTIABLE — default to REJECT:
- ACCEPT only if the image is SOLELY a clothing/apparel product photo: garment(s) laid flat (clean background), on a hanger, OR on a headless dress form/mannequin (no human identity).
- REJECT if you see ANY human face, hair+face combo, selfie, mirror selfie, portrait, someone wearing the clothes (on-body), visible hands/arms/legs modeling garments as the subject, crowds, or any person as the main subject — even if clothing is visible.
- REJECT shoes/accessories photographed on feet or being worn.
- REJECT if uncertain or if non-clothing dominates the frame.

When rejecting (including selfies/faces/people/on-body/worn items), return EXACTLY: {"error":"not_clothing"}

When accepting (all rules satisfied), return EXACTLY one JSON object with these keys (all string values except the two booleans):
{"valid":true,"product_only_flat_hanger_or_mannequin":true,"description":"brief garment description","color":"main colors or palette (short)","style":"e.g. casual, minimalist, streetwear","occasion":"e.g. office, weekend, formal","tip":"one short practical styling tip for this piece"}

If you cannot set product_only_flat_hanger_or_mannequin to true with confidence, return {"error":"not_clothing"} instead.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
      imageUrl?: string;
    };

    let imageBase64 = body.imageBase64?.replace(/^data:image\/\w+;base64,/, '') ?? '';
    let mime = body.mimeType ?? 'image/jpeg';

    if (!imageBase64 && body.imageUrl?.trim()) {
      const r = await fetch(body.imageUrl.trim());
      if (!r.ok) {
        return NextResponse.json({ error: 'Could not fetch image URL' }, { status: 400 });
      }
      const buf = Buffer.from(await r.arrayBuffer());
      imageBase64 = buf.toString('base64');
      const ct = r.headers.get('content-type');
      if (ct?.startsWith('image/')) {
        mime = ct.split(';')[0]?.trim() ?? mime;
      }
    }

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing image' }, { status: 400 });
    }

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const mediaType = (allowed.has(mime) ? mime : 'image/jpeg') as
      | 'image/jpeg'
      | 'image/png'
      | 'image/webp'
      | 'image/gif';

    const userText = `First check if this image contains clothing/apparel. If it does NOT contain clothing, return this exact JSON: {"error": "not_clothing"}. If it does contain clothing, analyze it normally.

Additionally apply the STRICT RULES in your instructions: only approve pure product-style shots (flat lay, hanger, or mannequin without people/faces). Otherwise return exactly {"error": "not_clothing"}.

Respond with JSON only.`;

    const result = await anthropicVisionJson<ValidateResult>({
      system: SYSTEM,
      userText,
      imageBase64,
      mediaType,
      maxTokens: 500,
      model: 'claude-opus-4-5',
    });

    const errRaw = result.error != null ? String(result.error).trim().toLowerCase() : '';
    const rejectedByError =
      errRaw === 'not_clothing' || errRaw.includes('not_clothing');

    const accepted =
      !rejectedByError &&
      result.valid === true &&
      result.product_only_flat_hanger_or_mannequin === true;

    if (!accepted) {
      return NextResponse.json({ error: 'not_clothing' });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
