import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';
import type { StyleAnalystResult } from '@/lib/agents/types';

export type { StyleAnalystResult };

const SYSTEM = `You are a fashion style analyst. Given a description of a clothing photo (or the photo as base64 in the message), respond with ONLY valid JSON matching this shape:
{"name":"short garment name","color":"dominant colors","style":"style keywords","occasion":"best occasions","tip":"one styling tip"}
No markdown, no extra keys.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
      description?: string;
    };
    const desc =
      body.description ||
      (body.imageBase64
        ? `Image attached (${body.mimeType || 'image/jpeg'}), base64 length ${body.imageBase64.length}. Infer from typical visible garment cues.`
        : 'No image or description provided.');
    const user = `Analyze this clothing for the user.\n${desc}`;
    const result = await anthropicJson<StyleAnalystResult>({
      system: SYSTEM,
      user,
      maxTokens: 600,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
