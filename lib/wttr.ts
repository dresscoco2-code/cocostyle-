import { parseWttrJ1Json, type NormalizedWeather } from './wttr-parse';

export type { NormalizedWeather };

export async function fetchWttrWeather(city: string): Promise<NormalizedWeather> {
  const trimmed = city.trim() || 'auto';
  const url = `https://wttr.in/${encodeURIComponent(trimmed)}?format=j1`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'CocoStyle/1.0 (https://github.com/)' },
    next: { revalidate: 900 },
  });
  if (!res.ok) {
    throw new Error(`Weather service returned ${res.status}`);
  }
  const j = await res.json();
  const parsed = parseWttrJ1Json(j);
  if (trimmed !== 'auto' && !parsed.areaName) {
    return { ...parsed, areaName: trimmed };
  }
  return parsed;
}

/** Same payload as opening https://wttr.in/?format=j1 in the browser (uses viewer IP). */
export async function fetchWttrBareJ1(): Promise<NormalizedWeather> {
  const res = await fetch('https://wttr.in/?format=j1', {
    headers: { 'User-Agent': 'CocoStyle/1.0' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Weather service returned ${res.status}`);
  }
  return parseWttrJ1Json(await res.json());
}
