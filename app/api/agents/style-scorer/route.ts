import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';
import type { OutfitBuilderResult } from '@/lib/agents/types';

export type StyleScorerResult = {
  score: number;
  reasons: string[];
  improvement: string;
};

const SYSTEM = `You are a fair fashion critic. Score an outfit combination from 0-10 (number only, can use half points).
Give 3-5 concise reasons and ONE improvement suggestion.
Respond ONLY with JSON:
{"score":7.5,"reasons":["..."],"improvement":"..."}
No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      outfit?: OutfitBuilderResult;
      context?: string;
    };
    const outfitJson = body.outfit
      ? JSON.stringify(body.outfit)
      : '{"title":"casual","items":["jeans","tee","sneakers"],"rationale":"simple"}';
    const user = `Outfit to score (from Outfit Builder):\n${outfitJson}\nExtra context: ${body.context ?? 'none'}`;
    const result = await anthropicJson<StyleScorerResult>({
      system: SYSTEM,
      user,
      maxTokens: 700,
    });
    const score = Number(result.score);
    result.score = Number.isFinite(score) ? Math.min(10, Math.max(0, score)) : 7;
    if (!Array.isArray(result.reasons)) {
      result.reasons = [String(result.reasons)];
    }
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
