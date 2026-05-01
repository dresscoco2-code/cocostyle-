import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

type WardrobeItem = {
  name: string;
  category: string;
  color: string;
  style: string;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY environment variable." }, { status: 500 });
    }

    const body = (await request.json()) as {
      latitude?: number;
      longitude?: number;
      items?: WardrobeItem[];
    };
    const items = body.items ?? [];
    if (!items.length) {
      return NextResponse.json({ error: "No wardrobe items provided." }, { status: 400 });
    }

    const latitude = Number.isFinite(body.latitude) ? body.latitude : 12.9716;
    const longitude = Number.isFinite(body.longitude) ? body.longitude : 77.5946;

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`,
      { cache: "no-store" }
    );
    if (!weatherRes.ok) {
      return NextResponse.json({ error: "Could not fetch weather." }, { status: 502 });
    }
    const weatherJson = (await weatherRes.json()) as {
      current?: { temperature_2m?: number; weather_code?: number; wind_speed_10m?: number };
    };
    const current = weatherJson.current ?? {};

    const anthropic = new Anthropic({ apiKey });
    const wardrobeSummary = items
      .map((item, index) => `${index + 1}. ${item.name} | ${item.category} | ${item.color} | ${item.style}`)
      .join("\n");

    const prompt = `You are CocoStyle's Weather Stylist.
Today's weather:
- temperature C: ${current.temperature_2m ?? "unknown"}
- weather code: ${current.weather_code ?? "unknown"}
- wind speed: ${current.wind_speed_10m ?? "unknown"} km/h

Choose wardrobe pieces best suited for this weather.

Wardrobe:
${wardrobeSummary}

Return ONLY valid JSON:
{
  "weatherSummary": "short plain weather summary",
  "recommendedItems": ["item 1", "item 2", "item 3"],
  "whyItWorks": "short styling reason for weather suitability"
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

    let parsed: { weatherSummary?: string; recommendedItems?: string[]; whyItWorks?: string };
    try {
      parsed = JSON.parse(cleaned) as { weatherSummary?: string; recommendedItems?: string[]; whyItWorks?: string };
    } catch {
      return NextResponse.json({ error: "Could not parse Claude response.", raw: textBlock }, { status: 500 });
    }

    return NextResponse.json({
      weather: current,
      weatherSummary: parsed.weatherSummary ?? "Weather-based styling suggestions ready.",
      recommendedItems: parsed.recommendedItems ?? [],
      whyItWorks: parsed.whyItWorks ?? "These choices balance comfort, layering, and confidence.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
