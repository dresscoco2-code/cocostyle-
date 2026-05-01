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
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      items?: WardrobeItem[];
      date?: string;
      regenerate?: boolean;
    };

    const items = body.items ?? [];

    const anthropic = new Anthropic({ apiKey });
    const dateString = body.date ?? new Date().toISOString().slice(0, 10);
    const wardrobeSummary = items.length
      ? items
          .map(
            (item, index) =>
              `${index + 1}. ${item.name} | category: ${item.category} | color: ${item.color} | style: ${item.style}${item.occasion ? ` | occasion: ${item.occasion}` : ""}`
          )
          .join("\n")
      : "No wardrobe items available yet.";

    const prompt = `You are CocoStyle's uplifting confidence coach.
Create one beautiful daily affirmation based on this user's style and confidence journey.

Date: ${dateString}
${body.regenerate ? "User asked for a fresh variation for today." : "Generate the default daily affirmation for this date."}

Wardrobe context:
${wardrobeSummary}

Return ONLY valid JSON in this exact shape:
{
  "quote": "a short poetic motivational quote (1-2 sentences)",
  "confidenceMessage": "a practical uplifting confidence reminder (1 sentence)"
}
No markdown. No extra text.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 300,
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
    });

    const textBlock = message.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
    const cleaned = textBlock.replace(/```json|```/g, "").trim();

    let parsed: { quote?: string; confidenceMessage?: string };
    try {
      parsed = JSON.parse(cleaned) as { quote?: string; confidenceMessage?: string };
    } catch {
      // Fallback: if Claude returned plain text, use it as quote.
      parsed = {
        quote: cleaned || textBlock,
        confidenceMessage: "You are already enough. Your style is your strength today.",
      };
    }

    const quote =
      (parsed.quote ?? "").trim() ||
      "You carry your confidence before you wear your outfit, and that is your real glow.";
    const confidenceMessage =
      (parsed.confidenceMessage ?? "").trim() ||
      "Take one bold step today. Your style and self-belief will do the rest.";

    return NextResponse.json({ quote, confidenceMessage });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
