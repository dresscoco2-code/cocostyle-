'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWardrobe } from '@/app/components/useWardrobe';

type GapItem = { name: string; why: string; unlocksOutfits: number };

export default function ShoppingListPage() {
  const { items, loading, userId, noConfig, error: wErr } = useWardrobe();
  const [gaps, setGaps] = useState<GapItem[] | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    if (!items.length) return;
    setLoadingAi(true);
    setErr(null);
    try {
      const res = await fetch('/api/tools/shopping-gaps', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          wardrobeItems: items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
          })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Analysis failed');
      setGaps(j.items ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080f] pb-20 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-2 text-xs uppercase tracking-widest text-amber-300/90">Tools</div>
        <h1 className="text-3xl font-semibold text-white">Smart shopping list</h1>
        <p className="mt-2 text-sm text-zinc-400">
          We read your Supabase wardrobe, find gaps, and rank the top five purchases with unlock
          estimates.
        </p>

        {noConfig ? (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Add Supabase env vars to load wardrobe.
          </div>
        ) : null}

        {!userId && !noConfig ? (
          <p className="mt-6 text-sm text-zinc-500">Sign in to analyze your saved closet.</p>
        ) : null}

        <button
          type="button"
          disabled={loading || !items.length || loadingAi}
          onClick={() => void run()}
          className="mt-8 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 disabled:opacity-40"
        >
          {loadingAi ? 'Analyzing…' : 'Analyze wardrobe gaps'}
        </button>
        <p className="mt-2 text-xs text-zinc-500">
          {loading ? 'Loading…' : `${items.length} items loaded`}
        </p>
        {wErr ? <p className="mt-2 text-sm text-rose-300">{wErr}</p> : null}
        {err ? <p className="mt-2 text-sm text-rose-300">{err}</p> : null}

        {gaps ? (
          <ul className="mt-10 space-y-4">
            {gaps.map((g, i) => (
              <li
                key={i}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-amber-500/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-lg font-medium text-white">{g.name}</p>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
                    Unlocks ~{g.unlocksOutfits} outfits
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{g.why}</p>
                <p className="mt-3 text-xs text-zinc-600">
                  Example: &quot;{g.name}&quot; — unlocks {g.unlocksOutfits} new outfits
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-12 text-center text-xs text-zinc-600">
          <Link href="/wardrobe" className="text-amber-400 hover:underline">
            Wardrobe
          </Link>
        </p>
      </div>
    </div>
  );
}
