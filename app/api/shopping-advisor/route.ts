import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type WardrobeItem = {
  name: string;
  category: string;
  color: string;
  style: string;
  occasion?: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY environment variable." }, { status: 500 });
    }

    const body = (await request.json()) as { items?: WardrobeItem[] };
    const items = body.items ?? [];
    if (!items.length) {
      return NextResponse.json({ error: "No wardrobe items provided." }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });
    const wardrobeSummary = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} | category: ${item.category} | color: ${item.color} | style: ${item.style}${item.occasion ? ` | occasion: ${item.occasion}` : ""}`
      )
      .join("\n");

    const prompt = `You are CocoStyle's Shopping Advisor.
Find wardrobe gaps and suggest 3 smart purchases that complete more looks.

Wardrobe:
${wardrobeSummary}

Return ONLY valid JSON:
{
  "suggestions": [
    { "item": "item to buy", "why": "short reason", "priority": "high|medium|low" },
    { "item": "item to buy", "why": "short reason", "priority": "high|medium|low" },
    { "item": "item to buy", "why": "short reason", "priority": "high|medium|low" }
  ]
}
No markdown.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
    });

    const textBlock = message.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
    const cleaned = textBlock.replace(/```json|```/g, "").trim();

    let parsed: { suggestions?: Array<{ item: string; why: string; priority: string }> };
    try {
      parsed = JSON.parse(cleaned) as { suggestions?: Array<{ item: string; why: string; priority: string }> };
    } catch {
      return NextResponse.json({ error: "Could not parse Claude response.", raw: textBlock }, { status: 500 });
    }

    return NextResponse.json({ suggestions: parsed.suggestions ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
