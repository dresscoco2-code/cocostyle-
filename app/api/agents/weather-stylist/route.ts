import { NextResponse } from 'next/server';
import { anthropicJson } from '@/lib/anthropic';

export type WeatherStylistResult = {
  city: string;
  condition: string;
  tempC: number;
  wardrobeFit: string[];
  outfitRecommendation: string;
};

async function fetchWeather(city: string) {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
    { next: { revalidate: 3600 } },
  );
  const geo = (await geoRes.json()) as {
    results?: Array<{ latitude: number; longitude: number; name: string }>;
  };
  const hit = geo.results?.[0];
  if (!hit) {
    return {
      city,
      tempC: 18,
      code: 0,
      resolvedName: city,
    };
  }
  const wx = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&current=temperature_2m,weather_code`,
    { next: { revalidate: 1800 } },
  );
  const wxJson = (await wx.json()) as {
    current?: { temperature_2m: number; weather_code: number };
  };
  const temp = wxJson.current?.temperature_2m ?? 18;
  const code = wxJson.current?.weather_code ?? 0;
  return { city: hit.name, tempC: Math.round(temp), code, resolvedName: hit.name };
}

function codeLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67 || code === 80 || code === 81 || code === 82) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  return 'Mixed';
}

const SYSTEM = `You help pick wardrobe items for today's weather. Respond ONLY with JSON:
{"wardrobeFit":["4-6 wardrobe item types that suit the weather"],"outfitRecommendation":"one concrete outfit sentence for today"}
Use the weather summary provided. No markdown.`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      city?: string;
      wardrobeSummary?: string;
    };
    const city = body.city?.trim() || 'New York';
    const w = await fetchWeather(city);
    const condition = codeLabel(w.code);
    const user = `City: ${w.resolvedName}
Approximate temp °C: ${w.tempC}
Condition: ${condition}
User wardrobe (optional): ${body.wardrobeSummary ?? 'general closet'}`;
    const ai = await anthropicJson<Pick<WeatherStylistResult, 'wardrobeFit' | 'outfitRecommendation'>>({
      system: SYSTEM,
      user,
      maxTokens: 600,
    });
    if (!Array.isArray(ai.wardrobeFit)) {
      ai.wardrobeFit = [String(ai.wardrobeFit)];
    }
    const result: WeatherStylistResult = {
      city: w.resolvedName,
      condition,
      tempC: w.tempC,
      wardrobeFit: ai.wardrobeFit,
      outfitRecommendation: ai.outfitRecommendation,
    };
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
