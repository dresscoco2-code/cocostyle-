'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useWardrobe } from '@/app/components/useWardrobe';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { WardrobeItemRow } from '@/lib/wardrobe-types';

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso + 'T12:00:00').getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86400000);
}

function priceNum(p: number | null | undefined) {
  if (p == null || Number.isNaN(Number(p))) return null;
  return Number(p);
}

export default function RewearPage() {
  const { items, loading, userId, noConfig, error: wErr, refresh } = useWardrobe();
  const supabase = getSupabaseBrowserClient();
  const [aiLoading, setAiLoading] = useState(false);
  const [ideas, setIdeas] = useState<
    Array<{ title: string; itemIds: string[]; hook: string }>
  >([]);
  const [nudge, setNudge] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const enriched = useMemo(() => {
    return items.map((i) => {
      const days = daysSince(i.last_worn_at);
      const price = priceNum(i.purchase_price as unknown as number);
      const wears = Math.max(i.wear_count ?? 0, 1);
      const cpw = price != null ? price / wears : null;
      return { ...i, days, cpw };
    });
  }, [items]);

  const forgotten = useMemo(() => enriched.filter((i) => (i.days ?? 999) >= 30), [enriched]);

  const markWorn = async (row: WardrobeItemRow) => {
    if (!supabase || !userId) return;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from('wardrobe_items')
      .update({
        last_worn_at: today,
        wear_count: (row.wear_count ?? 0) + 1,
      })
      .eq('id', row.id)
      .eq('user_id', userId);
    if (error) setErr(error.message);
    else void refresh();
  };

  const suggest = async () => {
    if (!items.length) return;
    setAiLoading(true);
    setErr(null);
    try {
      const payload = enriched.map((i) => ({
        id: i.id,
        name: i.name,
        category: i.category,
        purchase_price: i.purchase_price,
        last_worn_at: i.last_worn_at,
        daysSinceWorn: i.days,
      }));
      const res = await fetch('/api/tools/rewear-suggest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items: payload }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'AI failed');
      setIdeas(j.outfitIdeas ?? []);
      setNudge(j.nudge ?? '');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080f] pb-20 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-2 text-xs uppercase tracking-widest text-lime-300/90">Tools</div>
        <h1 className="text-3xl font-semibold text-white">Rewear forgotten pieces</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Track last worn dates, cost per wear, and nudge yourself with AI-built outfits from items
          idle 30+ days.
        </p>

        {noConfig ? (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Configure Supabase + run the SQL migration for <code>wardrobe_items</code> columns.
          </div>
        ) : null}

        <button
          type="button"
          disabled={!items.length || aiLoading}
          onClick={() => void suggest()}
          className="mt-8 rounded-xl border border-lime-500/40 bg-lime-600/20 px-5 py-2 text-sm font-medium text-lime-100 hover:bg-lime-600/30 disabled:opacity-40"
        >
          {aiLoading ? 'Thinking…' : 'Suggest outfits with forgotten items'}
        </button>
        {nudge ? <p className="mt-4 text-sm text-lime-200/90">{nudge}</p> : null}
        {err ? <p className="mt-2 text-sm text-rose-300">{err}</p> : null}
        {wErr ? <p className="mt-2 text-sm text-rose-300">{wErr}</p> : null}

        {ideas.length > 0 ? (
          <section className="mt-10 space-y-4">
            <h2 className="text-sm font-medium text-zinc-400">AI outfit ideas</h2>
            {ideas.map((idea, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-lime-500/20 bg-lime-950/10 p-5"
              >
                <p className="font-medium text-white">{idea.title}</p>
                <p className="mt-2 text-sm text-lime-100/80">{idea.hook}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {idea.itemIds.map((id) => {
                    const it = items.find((x) => x.id === id);
                    if (!it) return null;
                    return (
                      <span
                        key={id}
                        className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-zinc-300"
                      >
                        {it.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        ) : null}

        <section className="mt-12">
          <h2 className="text-lg font-medium text-white">Not worn in 30+ days</h2>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-500">Loading…</p>
          ) : forgotten.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Nothing in that bucket — nice rotation.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {forgotten.map((row) => {
                const p = priceNum(row.purchase_price as unknown as number);
                const cpw = row.cpw;
                return (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                        {row.image_url ? (
                          <img src={row.image_url} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{row.name}</p>
                        <p className="text-xs text-zinc-500">
                          {row.days != null ? `${row.days} days since worn` : 'Never logged'} ·{' '}
                          {p != null ? (
                            <>
                              Paid ${p.toFixed(0)}
                              {cpw != null ? ` · $${cpw.toFixed(2)} / wear` : ''}
                            </>
                          ) : (
                            'Price unknown'
                          )}
                        </p>
                        {p != null ? (
                          <p className="mt-1 text-xs text-amber-200/90">
                            You paid ${p.toFixed(0)} for this — wear it!
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!userId}
                      onClick={() => void markWorn(row)}
                      className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20 disabled:opacity-40"
                    >
                      I wore this today
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-medium text-white">All items · cost per wear</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Last worn</th>
                  <th className="px-3 py-2">Wears</th>
                  <th className="px-3 py-2">$/wear</th>
                </tr>
              </thead>
              <tbody>
                {enriched.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 text-zinc-300">
                    <td className="px-3 py-2 text-white">{row.name}</td>
                    <td className="px-3 py-2">
                      {row.last_worn_at ?? '—'}
                      {row.days != null ? ` (${row.days}d)` : ''}
                    </td>
                    <td className="px-3 py-2">{row.wear_count ?? 0}</td>
                    <td className="px-3 py-2">
                      {row.cpw != null ? `$${row.cpw.toFixed(2)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-10 text-center text-xs text-zinc-600">
          <Link href="/wardrobe" className="text-lime-400 hover:underline">
            Wardrobe
          </Link>
        </p>
      </div>
    </div>
  );
}
