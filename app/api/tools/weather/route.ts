import { NextResponse } from 'next/server';
import { resolveCityHint } from '@/lib/geo';
import { fetchWttrWeather } from '@/lib/wttr';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let city = searchParams.get('city')?.trim();
    if (!city) {
      const hint = await resolveCityHint(req);
      city = hint?.trim() || 'auto';
    }
    const weather = await fetchWttrWeather(city);
    return NextResponse.json({ cityUsed: city, ...weather });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'weather error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
