'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWardrobe } from '@/app/components/useWardrobe';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const OCCASIONS = [
  { label: 'Work', emoji: '💼' },
  { label: 'Date Night', emoji: '✨' },
  { label: 'Wedding', emoji: '💒' },
  { label: 'Party', emoji: '🎉' },
  { label: 'Gym', emoji: '🏋️' },
  { label: 'Beach', emoji: '🏖️' },
  { label: 'Travel', emoji: '✈️' },
  { label: 'Formal', emoji: '🎩' },
  { label: 'Brunch', emoji: '🥂' },
  { label: 'Casual', emoji: '👟' },
  { label: 'Interview', emoji: '📋' },
  { label: 'Graduation', emoji: '🎓' },
  { label: 'Concert', emoji: '🎤' },
  { label: 'Festival', emoji: '🎪' },
  { label: 'Airport', emoji: '🛫' },
  { label: 'Dinner with friends', emoji: '🍽️' },
  { label: 'Coffee date', emoji: '☕' },
  { label: 'Holiday party', emoji: '🎄' },
  { label: "New Year's Eve", emoji: '🎆' },
  { label: 'Picnic', emoji: '🧺' },
  { label: 'Hiking', emoji: '🥾' },
  { label: 'Yoga class', emoji: '🧘' },
  { label: 'Shopping day', emoji: '🛍️' },
  { label: 'Client meeting', emoji: '🤝' },
  { label: 'Presentation', emoji: '📊' },
  { label: 'Family gathering', emoji: '👨‍👩‍👧' },
  { label: 'Romantic dinner', emoji: '🕯️' },
  { label: 'Club night', emoji: '🪩' },
  { label: 'Sports event', emoji: '🏟️' },
  { label: 'Weekend getaway', emoji: '🧳' },
] as const;

type OutfitPick = {
  headline: string;
  why: string;
  confidenceScore: number;
  selectedItems: Array<{
    id: string;
    name: string;
    category?: string | null;
    image_url?: string | null;
  }>;
};

export default function ConfidencePage() {
  const { items, loading: wLoading, userId, noConfig, error: wErr, refresh } = useWardrobe();
  const [skinTone, setSkinTone] = useState<string | null>(null);
  const [undertone, setUndertone] = useState<string | null>(null);
  const [activeOccasion, setActiveOccasion] = useState<string | null>(null);
  const [pick, setPick] = useState<OutfitPick | null>(null);
  const [pickLoading, setPickLoading] = useState(false);
  const [pickErr, setPickErr] = useState<string | null>(null);

  const loadProfileSkin = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !userId) {
      setSkinTone(null);
      setUndertone(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('skin_tone,undertone')
      .eq('id', userId)
      .maybeSingle();
    setSkinTone(data?.skin_tone ?? null);
    setUndertone(data?.undertone ?? null);
  }, [userId]);

  useEffect(() => {
    void loadProfileSkin();
  }, [loadProfileSkin]);

  const runOccasion = async (occasion: string) => {
    if (!items.length) {
      setPickErr('Add pieces to your wardrobe first.');
      return;
    }
    setActiveOccasion(occasion);
    setPickLoading(true);
    setPickErr(null);
    setPick(null);
    try {
      const res = await fetch('/api/confidence', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          occasion,
          profileSkinTone: skinTone,
          profileUndertone: undertone,
          wardrobeItems: items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            image_url: i.image_url,
            color: i.color ?? null,
          })),
        }),
      });
      const j = (await res.json()) as OutfitPick & { error?: string };
      if (!res.ok) throw new Error(j.error ?? 'Could not build outfit');
      setPick({
        headline: j.headline,
        why: j.why,
        confidenceScore: j.confidenceScore,
        selectedItems: j.selectedItems ?? [],
      });
    } catch (e) {
      setPickErr(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setPickLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070c] pb-20 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">CocoStyle</p>
        <h1 className="mt-2 bg-gradient-to-r from-[#e8a598] via-[#c084fc] to-[#8b5cf6] bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
          Confidence looks
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/50">
          Pick an occasion — we&apos;ll build an outfit from your wardrobe and score how well it
          suits you (including your skin tone from your profile when set).
        </p>

        {noConfig ? (
          <p className="mt-6 text-sm text-amber-200/90">
            Configure Supabase env vars to load your wardrobe.
          </p>
        ) : null}
        {wErr ? <p className="mt-4 text-sm text-rose-300">{wErr}</p> : null}

        {!userId && !wLoading ? (
          <p className="mt-8 text-sm text-white/45">Sign in to use Confidence with your wardrobe.</p>
        ) : null}

        {(skinTone || undertone) && userId ? (
          <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
            Profile coloring:{' '}
            <span className="font-medium text-white">{skinTone ?? '—'}</span>
            {undertone ? (
              <>
                {' '}
                · undertone <span className="text-[#c084fc]">{undertone}</span>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => void loadProfileSkin()}
              className="ml-3 text-xs text-[#e8a598] underline-offset-2 hover:underline"
            >
              Refresh
            </button>
          </p>
        ) : userId ? (
          <p className="mt-6 text-sm text-white/40">
            Add your skin tone on the{' '}
            <a href="/profile" className="text-[#c084fc] hover:underline">
              Profile
            </a>{' '}
            page for more tailored color picks.
          </p>
        ) : null}

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white/90">Occasions</h2>
            <button
              type="button"
              onClick={() => void refresh()}
              className="text-xs text-white/45 hover:text-white"
            >
              Refresh wardrobe
            </button>
          </div>
          {wLoading ? (
            <p className="text-sm text-white/40">Loading wardrobe…</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {OCCASIONS.map(({ label, emoji }) => {
                const active = activeOccasion === label;
                return (
                  <li key={label}>
                    <button
                      type="button"
                      disabled={pickLoading || !userId || !items.length}
                      onClick={() => void runOccasion(label)}
                      className={`flex w-full flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left text-sm transition ${
                        active
                          ? 'border-[#c084fc]/60 bg-gradient-to-br from-[#e8a598]/20 to-[#8b5cf6]/20 text-white'
                          : 'border-white/[0.08] bg-white/[0.02] text-white/85 hover:border-white/20 hover:bg-white/[0.04]'
                      } disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="font-medium leading-snug">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {pickErr ? (
          <p className="mt-6 text-sm text-rose-300" role="alert">
            {pickErr}
          </p>
        ) : null}

        {pickLoading ? (
          <p className="mt-8 text-sm text-white/50">
            Styling{activeOccasion ? ` for ${activeOccasion}` : ''}…
          </p>
        ) : null}

        {pick && !pickLoading ? (
          <section className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">Your outfit</p>
                <h3 className="mt-1 text-xl font-semibold text-white">{pick.headline}</h3>
                <p className="mt-2 max-w-xl text-sm text-white/60">{pick.why}</p>
              </div>
              <div className="flex shrink-0 flex-col items-center rounded-2xl border border-white/10 bg-[#0d0d18] px-6 py-4">
                <span className="text-xs text-white/45">Confidence</span>
                <span
                  className="mt-1 text-4xl font-bold tabular-nums"
                  style={{
                    background: 'linear-gradient(135deg, #e8a598, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {pick.confidenceScore}
                </span>
                <span className="text-xs text-white/35">out of 100</span>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/40">
                Pieces
              </p>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {pick.selectedItems.map((row) => (
                  <li
                    key={row.id}
                    className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#12121a]"
                  >
                    <div className="aspect-square w-full bg-[#1a1a24]">
                      {row.image_url ? (
                        <img
                          src={row.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-white/25">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-white">{row.name}</p>
                      {row.category ? (
                        <p className="truncate text-[10px] uppercase tracking-wide text-white/40">
                          {row.category}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
