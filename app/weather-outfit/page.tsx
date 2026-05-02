'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useWardrobe } from '@/app/components/useWardrobe';

type Weather = {
  tempC: number;
  feelsLikeC: number;
  description: string;
  bucket: string;
  areaName: string | null;
  cityUsed?: string;
};

type PickResult = {
  headline: string;
  why: string;
  selectedItems: Array<{
    id: string;
    name: string;
    category?: string | null;
    image_url?: string | null;
  }>;
};

export default function WeatherOutfitPage() {
  const { items, loading: wLoading, userId, noConfig, error: wErr } = useWardrobe();
  const [geoCity, setGeoCity] = useState<string | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [manualCity, setManualCity] = useState('');
  const [wxLoading, setWxLoading] = useState(true);
  const [pick, setPick] = useState<PickResult | null>(null);
  const [pickLoading, setPickLoading] = useState(false);
  const [pickErr, setPickErr] = useState<string | null>(null);

  const loadWeather = useCallback(async (city?: string) => {
    setWxLoading(true);
    try {
      const q = city?.trim() ? `?city=${encodeURIComponent(city.trim())}` : '';
      const res = await fetch(`/api/tools/weather${q}`);
      const j = (await res.json()) as Weather & { error?: string };
      if (!res.ok || j.error) throw new Error(j.error ?? 'Weather failed');
      setWeather(j);
    } catch {
      setWeather(null);
    } finally {
      setWxLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const g = await fetch('/api/tools/geo');
      const gj = (await g.json()) as { city?: string | null };
      setGeoCity(gj.city ?? null);
      await loadWeather(gj.city ?? undefined);
    })();
  }, [loadWeather]);

  const runPick = async () => {
    if (!items.length) return;
    setPickLoading(true);
    setPickErr(null);
    try {
      const city = manualCity.trim() || geoCity || weather?.areaName || undefined;
      const res = await fetch('/api/tools/weather-outfit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          city,
          wardrobeItems: items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            image_url: i.image_url,
          })),
          weather: weather
            ? {
                tempC: weather.tempC,
                feelsLikeC: weather.feelsLikeC,
                description: weather.description,
                bucket: weather.bucket,
              }
            : undefined,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Pick failed');
      setPick({
        headline: j.headline,
        why: j.why,
        selectedItems: j.selectedItems ?? [],
      });
    } catch (e) {
      setPickErr(e instanceof Error ? e.message : 'Error');
    } finally {
      setPickLoading(false);
    }
  };

  const bucketEmoji =
    weather?.bucket === 'rainy'
      ? '🌧️'
      : weather?.bucket === 'sunny'
        ? '☀️'
        : weather?.bucket === 'cold'
          ? '❄️'
          : weather?.bucket === 'hot'
            ? '🔥'
            : '☁️';

  return (
    <div className="min-h-screen bg-[#08080f] pb-16 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-2 text-xs uppercase tracking-widest text-violet-300/90">Tools</div>
        <h1 className="text-3xl font-semibold text-white">Weather outfit</h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          We detect your city, pull live conditions from wttr.in, then match the best look from your
          Supabase wardrobe.
        </p>

        {noConfig ? (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Add <code className="text-amber-200">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-amber-200">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to use wardrobe
            picks.
          </div>
        ) : null}

        {!userId && !noConfig ? (
          <p className="mt-6 text-sm text-zinc-500">
            Sign in with Supabase Auth to load your closet — or browse weather below.
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-950/40 to-transparent p-6">
            <h2 className="text-sm font-medium text-violet-200">Live weather</h2>
            {wxLoading ? (
              <p className="mt-4 text-zinc-500">Loading wttr.in…</p>
            ) : weather ? (
              <div className="mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-light text-white">{weather.tempC}°C</span>
                  <span className="text-2xl text-zinc-500">{bucketEmoji}</span>
                </div>
                <p className="mt-2 text-lg capitalize text-zinc-200">{weather.description}</p>
                <p className="text-sm text-zinc-500">
                  Feels like {weather.feelsLikeC}°C · {weather.areaName ?? geoCity ?? 'Your area'}
                </p>
                <label className="mt-6 block text-xs text-zinc-500">
                  Override city
                  <div className="mt-1 flex gap-2">
                    <input
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      placeholder="e.g. Tokyo"
                      className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                    />
                    <button
                      type="button"
                      onClick={() => void loadWeather(manualCity)}
                      className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                    >
                      Refresh
                    </button>
                  </div>
                </label>
              </div>
            ) : (
              <p className="mt-4 text-rose-300">Could not load weather.</p>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-sm font-medium text-zinc-300">Your pick</h2>
            <p className="mt-2 text-xs text-zinc-500">
              {wLoading ? 'Loading wardrobe…' : `${items.length} pieces in closet`}
            </p>
            {wErr ? <p className="mt-2 text-sm text-rose-300">{wErr}</p> : null}
            <button
              type="button"
              disabled={!items.length || pickLoading || wxLoading}
              onClick={() => void runPick()}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-medium text-white shadow-lg shadow-violet-900/40 disabled:opacity-40"
            >
              {pickLoading ? 'Styling…' : 'Pick best outfit for this weather'}
            </button>
            {pickErr ? <p className="mt-3 text-sm text-rose-300">{pickErr}</p> : null}
          </section>
        </div>

        {pick ? (
          <section className="mt-10 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-8">
            <p className="text-lg font-medium leading-relaxed text-emerald-100">{pick.headline}</p>
            <p className="mt-2 text-sm text-emerald-200/70">{pick.why}</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pick.selectedItems.map((it) => (
                <figure
                  key={it.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-black/40"
                >
                  <div className="aspect-[3/4] w-full bg-zinc-900">
                    {it.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.image_url}
                        alt={it.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                        No photo
                      </div>
                    )}
                  </div>
                  <figcaption className="p-3">
                    <p className="font-medium text-white">{it.name}</p>
                    <p className="text-xs text-zinc-500">{it.category}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <p className="mt-10 text-center text-xs text-zinc-600">
          <Link href="/wardrobe" className="text-violet-400 hover:underline">
            Manage wardrobe
          </Link>
        </p>
      </div>
    </div>
  );
}
