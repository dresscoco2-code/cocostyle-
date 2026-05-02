import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';

export type ConfidenceCoachResult = {
  affirmations: string[];
  microTip: string;
};

const SYSTEM = `You are a supportive confidence coach for fashion and self-image.
Respond ONLY with JSON:
{"affirmations":["2-3 short personalized affirmations"],"microTip":"one practical confidence tip for dressing"}
Use the user's name, gender, age, and style personality. No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string;
      gender?: string;
      age?: number | string;
      stylePersonality?: string;
    };
    const user = `Name: ${body.name ?? 'friend'}
Gender: ${body.gender ?? 'not specified'}
Age: ${body.age ?? 'not specified'}
Style personality: ${body.stylePersonality ?? 'developing their personal style'}`;
    const result = await anthropicJson<ConfidenceCoachResult>({
      system: SYSTEM,
      user,
      maxTokens: 500,
    });
    if (!Array.isArray(result.affirmations)) {
      result.affirmations = [String(result.affirmations)];
    }
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
