import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type WardrobeItem = {
  name: string;
  category: string;
  color: string;
  style: string;
  occasion?: string;
  tip?: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY environment variable." },
        { status: 500 }
      );
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
          `${index + 1}. ${item.name} | category: ${item.category} | color: ${item.color} | style: ${item.style}${item.occasion ? ` | best occasion: ${item.occasion}` : ""}`
      )
      .join("\n");

    const prompt = `You are CocoStyle confidence stylist AI.
Based on this wardrobe, suggest exactly 3 outfit combinations for:
1) Daily casual
2) Work/formal
3) Party/special occasion

Wardrobe:
${wardrobeSummary}

Return ONLY valid JSON in this exact format:
{
  "outfits": [
    {
      "occasion": "Daily casual",
      "title": "short outfit title",
      "items": ["specific item names from wardrobe"],
      "whyConfidence": "2-3 sentence explanation of why this boosts confidence"
    },
    {
      "occasion": "Work/formal",
      "title": "short outfit title",
      "items": ["specific item names from wardrobe"],
      "whyConfidence": "2-3 sentence explanation of why this boosts confidence"
    },
    {
      "occasion": "Party/special occasion",
      "title": "short outfit title",
      "items": ["specific item names from wardrobe"],
      "whyConfidence": "2-3 sentence explanation of why this boosts confidence"
    }
  ]
}

No markdown. No extra text.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 900,
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
    });

    const textBlock = message.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
    const cleaned = textBlock.replace(/```json|```/g, "").trim();

    let parsed: {
      outfits: Array<{
        occasion: string;
        title: string;
        items: string[];
        whyConfidence: string;
      }>;
    };
    try {
      parsed = JSON.parse(cleaned) as typeof parsed;
    } catch {
      return NextResponse.json(
        { error: "Could not parse Claude response.", raw: textBlock },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected server error.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
