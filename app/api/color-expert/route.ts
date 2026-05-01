import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type WardrobeItem = {
  name: string;
  color: string;
  style: string;
  category: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY environment variable." }, { status: 500 });
    }

    const body = (await request.json()) as {
      skinTone?: string;
      items?: WardrobeItem[];
    };
    const skinTone = body.skinTone?.trim() || "not provided";
    const items = body.items ?? [];

    if (!items.length) {
      return NextResponse.json({ error: "No wardrobe items provided." }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });
    const wardrobeSummary = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} | color: ${item.color} | style: ${item.style} | category: ${item.category}`
      )
      .join("\n");

    const prompt = `You are CocoStyle's Color Expert.
Skin tone: ${skinTone}

From this wardrobe, identify colors that suit this skin tone best and which items to prioritize.

Wardrobe:
${wardrobeSummary}

Return ONLY valid JSON in this shape:
{
  "bestColors": ["color1", "color2", "color3", "color4"],
  "recommendedItems": ["item name 1", "item name 2", "item name 3"],
  "reason": "short explanation why these colors work for this skin tone"
}
No markdown, no extra text.`;

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

    let parsed: { bestColors?: string[]; recommendedItems?: string[]; reason?: string };
    try {
      parsed = JSON.parse(cleaned) as { bestColors?: string[]; recommendedItems?: string[]; reason?: string };
    } catch {
      return NextResponse.json({ error: "Could not parse Claude response.", raw: textBlock }, { status: 500 });
    }

    return NextResponse.json({
      bestColors: parsed.bestColors ?? [],
      recommendedItems: parsed.recommendedItems ?? [],
      reason: parsed.reason ?? "These shades balance your undertone and improve visual contrast.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
