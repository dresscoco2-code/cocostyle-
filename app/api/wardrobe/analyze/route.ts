import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type ParsedAnalysis = {
  name: string;
  color: string;
  style: string;
  occasion: string;
  tip: string;
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
      imageBase64?: string;
      mediaType?: string;
      category?: string;
    };

    if (!body.imageBase64 || !body.mediaType) {
      return NextResponse.json({ error: "imageBase64 and mediaType are required." }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are a fashion wardrobe assistant for CocoStyle.
Analyze this clothing image${body.category ? ` in category ${body.category}` : ""}.
Return ONLY valid JSON with exactly these keys:
{
  "name": "short human-readable item name",
  "color": "primary color",
  "style": "style vibe in 1-3 words",
  "occasion": "best occasion in 2-5 words",
  "tip": "one concise practical styling tip"
}
No markdown. No extra text.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 350,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: body.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: body.imageBase64,
              },
            },
          ],
        },
      ],
    });

    const textBlock = message.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
    const cleaned = textBlock.replace(/```json|```/g, "").trim();

    let parsed: ParsedAnalysis;
    try {
      parsed = JSON.parse(cleaned) as ParsedAnalysis;
    } catch {
      return NextResponse.json(
        { error: "Could not parse Claude response as JSON.", raw: textBlock },
        { status: 500 }
      );
    }

    return NextResponse.json({
      analysis: {
        name: parsed.name,
        color: parsed.color,
        style: parsed.style,
        occasion: parsed.occasion,
        tip: parsed.tip,
        // Backward-compatible aliases for existing UI fields
        itemName: parsed.name,
        stylingTip: parsed.tip,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
