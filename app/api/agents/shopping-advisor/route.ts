import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';
import type { StyleAnalystResult } from '@/lib/agents/types';

export type ShoppingAdvisorResult = {
  gaps: string[];
  buyNext: string[];
  note: string;
};

const SYSTEM = `You are a shopping advisor. Identify wardrobe gaps and recommend exactly 3 items to buy next.
Use the style analysis of something they often wear AND the occasions they dress for most.
Respond ONLY with JSON:
{"gaps":["2-4 gap themes"],"buyNext":["item 1","item 2","item 3"],"note":"one sentence rationale"}
No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      styleAnalysis?: StyleAnalystResult;
      topOccasions?: string[];
      wardrobeSummary?: string;
    };
    const style = body.styleAnalysis
      ? JSON.stringify(body.styleAnalysis)
      : '{"name":"basics","color":"neutral","style":"minimal","occasion":"everyday","tip":"layer textures"}';
    const occ = (body.topOccasions?.length ? body.topOccasions : ['work', 'weekend', 'social']).join(', ');
    const user = `Style analysis (from Style Analyst): ${style}
Occasions they dress for most: ${occ}
Wardrobe summary: ${body.wardrobeSummary ?? 'unknown'}`;
    const result = await anthropicJson<ShoppingAdvisorResult>({
      system: SYSTEM,
      user,
      maxTokens: 600,
    });
    if (!Array.isArray(result.gaps)) result.gaps = [];
    if (!Array.isArray(result.buyNext)) result.buyNext = [];
    while (result.buyNext.length < 3) {
      result.buyNext.push('versatile layering piece');
    }
    result.buyNext = result.buyNext.slice(0, 3);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
