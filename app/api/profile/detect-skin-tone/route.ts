import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as { imageBase64?: string; mediaType?: string };
    if (!body.imageBase64 || !body.mediaType) {
      return NextResponse.json({ error: "imageBase64 and mediaType are required." }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey });
    const prompt = `You are a skin tone analysis assistant for CocoStyle.
Analyze this front-face selfie and detect the most likely skin tone label.
Return ONLY valid JSON:
{
  "skinTone": "e.g. Warm Medium"
}
No markdown. No extra text.`;

    const message = await anthropic.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 120,
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

    let parsed: { skinTone?: string };
    try {
      parsed = JSON.parse(cleaned) as { skinTone?: string };
    } catch {
      return NextResponse.json(
        { error: "Could not parse Claude response as JSON.", raw: textBlock },
        { status: 500 }
      );
    }

    const skinTone = (parsed.skinTone ?? "").trim() || "Warm Medium";
    return NextResponse.json({ skinTone });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
