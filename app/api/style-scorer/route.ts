import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY environment variable." }, { status: 500 });
    }

    const body = (await request.json()) as { outfit?: { title?: string; occasion?: string; items?: string[] } };
    const outfit = body.outfit;
    if (!outfit?.items?.length) {
      return NextResponse.json({ error: "Outfit items are required." }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });
    const prompt = `You are CocoStyle's Style Scorer.
Evaluate this outfit and score it out of 10.

Outfit title: ${outfit.title ?? "Untitled"}
Occasion: ${outfit.occasion ?? "Not specified"}
Items:
${outfit.items.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Return ONLY valid JSON:
{
  "score": 8.5,
  "summary": "short verdict",
  "reasons": ["reason 1", "reason 2", "reason 3"],
  "improvementTip": "one practical improvement tip"
}
No markdown.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 500,
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
    });

    const textBlock = message.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
    const cleaned = textBlock.replace(/```json|```/g, "").trim();

    let parsed: {
      score?: number;
      summary?: string;
      reasons?: string[];
      improvementTip?: string;
    };
    try {
      parsed = JSON.parse(cleaned) as typeof parsed;
    } catch {
      return NextResponse.json({ error: "Could not parse Claude response.", raw: textBlock }, { status: 500 });
    }

    return NextResponse.json({
      score: parsed.score ?? 7,
      summary: parsed.summary ?? "Balanced outfit with confidence potential.",
      reasons: parsed.reasons ?? [],
      improvementTip: parsed.improvementTip ?? "Add one contrasting accent for stronger impact.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
