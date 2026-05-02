import { NextResponse } from 'next/server';
import { resolveCityHint } from '@/lib/geo';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vercelCity = req.headers.get('x-vercel-ip-city');
    if (vercelCity) {
      return NextResponse.json({
        city: decodeURIComponent(vercelCity),
        source: 'vercel',
      });
    }
    const ipParam = searchParams.get('ip');
    if (ipParam) {
      const res = await fetch(`https://ipwho.is/${encodeURIComponent(ipParam.trim())}`, {
        next: { revalidate: 3600 },
      });
      const data = (await res.json()) as {
        success?: boolean;
        city?: string;
        country?: string;
        region?: string;
        message?: string;
      };
      if (!data.success) {
        return NextResponse.json({ city: null, error: data.message });
      }
      return NextResponse.json({
        city: data.city ?? null,
        region: data.region ?? null,
        country: data.country ?? null,
        source: 'ipwho',
      });
    }
    const city = await resolveCityHint(req);
    return NextResponse.json({
      city,
      source: city ? 'ipwho' : 'none',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'geo error';
    return NextResponse.json({ city: null, error: message }, { status: 200 });
  }
}
