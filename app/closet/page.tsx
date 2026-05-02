'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { WardrobeItemRow } from '@/lib/wardrobe-types';

const FILTERS = ['All', 'Uppers', 'Lowers', 'Shoes', 'Jackets'] as const;
type FilterKey = (typeof FILTERS)[number];

function categoryBadgeClass(cat: string | null | undefined) {
  const c = (cat ?? '').toLowerCase();
  if (c === 'uppers') return 'bg-rose-500/20 text-rose-200 ring-rose-500/30';
  if (c === 'lowers') return 'bg-sky-500/20 text-sky-200 ring-sky-500/30';
  if (c === 'shoes') return 'bg-amber-500/20 text-amber-100 ring-amber-500/30';
  if (c === 'jackets') return 'bg-violet-500/20 text-violet-200 ring-violet-500/30';
  return 'bg-white/10 text-white/70 ring-white/15';
}

export default function ClosetPage() {
  const [items, setItems] = useState<WardrobeItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [noConfig, setNoConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('All');

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setNoConfig(true);
      setLoading(false);
      setItems([]);
      return;
    }
    setNoConfig(false);
    setLoading(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id ?? null;
    setUserId(uid);
    if (!uid) {
      setItems([]);
      setLoading(false);
      return;
    }
    const { data, error: qErr } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (qErr) {
      setError(qErr.message);
      setItems([]);
    } else {
      setItems((data ?? []) as WardrobeItemRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'All') return items;
    const f = filter.toLowerCase();
    return items.filter((i) => (i.category ?? '').toLowerCase() === f);
  }, [items, filter]);

  return (
    <div className="min-h-screen bg-[#07070c] pb-20 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">CocoStyle</p>
        <h1 className="mt-2 bg-gradient-to-r from-[#e8a598] via-[#c084fc] to-[#8b5cf6] bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
          Your closet
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/50">
          Everything in your wardrobe, in one place. Filter by category to focus on one area.
        </p>

        {noConfig ? (
          <p className="mt-6 text-sm text-amber-200/90">
            Add <code className="text-white/80">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code className="text-white/80">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
          </p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

        {!userId && !loading ? (
          <p className="mt-8 text-sm text-white/45">Sign in to see your closet.</p>
        ) : null}

        {userId ? (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => {
                const on = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      on
                        ? 'bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] text-[#07070c]'
                        : 'border border-white/15 bg-white/[0.04] text-white/75 hover:border-white/25'
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
              <span className="ml-auto text-sm text-white/40">
                {filtered.length} piece{filtered.length === 1 ? '' : 's'}
              </span>
            </div>

            {loading ? (
              <p className="mt-10 text-sm text-white/40">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="mt-10 text-sm text-white/40">
                No items match this filter. Try another or add pieces in{' '}
                <a href="/wardrobe" className="text-[#c084fc] hover:underline">
                  Wardrobe
                </a>
                .
              </p>
            ) : (
              <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((row) => (
                  <li
                    key={row.id}
                    className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                  >
                    <div className="aspect-square w-full bg-[#12121a]">
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
                    <div className="space-y-2 p-3">
                      <p className="truncate text-sm font-semibold text-white">{row.name}</p>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${categoryBadgeClass(row.category)}`}
                      >
                        {row.category ?? 'Piece'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
