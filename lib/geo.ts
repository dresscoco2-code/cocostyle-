export async function resolveCityHint(req: Request): Promise<string | null> {
  const vercelCity = req.headers.get('x-vercel-ip-city');
  if (vercelCity) {
    return decodeURIComponent(vercelCity);
  }
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || req.headers.get('x-real-ip')?.trim() || '';
  const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}` : 'https://ipwho.is/';
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { success?: boolean; city?: string };
    if (!data.success || !data.city) return null;
    return data.city;
  } catch {
    return null;
  }
}
