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

    const body = (await request.json()) as { items?: WardrobeItem[]; occasion?: string };
    const items = body.items ?? [];
    const selectedOccasion = body.occasion?.trim() || "Daily Casual";
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

    const prompt = `Based on these clothes, give me 3 confident outfit combinations specifically for this occasion:
${selectedOccasion}

For each outfit suggest which specific items to combine and why it boosts confidence for this occasion.

Wardrobe:
${wardrobeSummary}

Return ONLY valid JSON in this exact shape:
{
  "outfits": [
    {
      "occasion": "${selectedOccasion}",
      "title": "short title",
      "items": ["item 1", "item 2", "item 3"],
      "whyConfidence": "short confidence explanation"
    },
    {
      "occasion": "${selectedOccasion}",
      "title": "short title",
      "items": ["item 1", "item 2", "item 3"],
      "whyConfidence": "short confidence explanation"
    },
    {
      "occasion": "${selectedOccasion}",
      "title": "short title",
      "items": ["item 1", "item 2", "item 3"],
      "whyConfidence": "short confidence explanation"
    }
  ]
}
No markdown or extra text.`;

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
        { error: "Could not parse Claude response as JSON.", raw: textBlock },
        { status: 500 }
      );
    }

    return NextResponse.json({ outfits: parsed.outfits });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
