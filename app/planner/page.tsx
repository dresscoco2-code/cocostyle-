'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useWardrobe } from '@/app/components/useWardrobe';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { WardrobeItemRow } from '@/lib/wardrobe-types';

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

type DayPlan = WardrobeItemRow[];

export default function PlannerPage() {
  const { items, loading: wLoading, userId, noConfig, error: wErr, refresh } = useWardrobe();
  const supabase = getSupabaseBrowserClient();

  const weekDates = useMemo(() => {
    const start = new Date();
    start.setHours(12, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => fmt(addDays(start, i)));
  }, []);

  const [plan, setPlan] = useState<Record<string, DayPlan>>({});
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    if (!supabase || !userId) return;
    const start = weekDates[0];
    const end = weekDates[6];
    const { data, error } = await supabase
      .from('outfit_planner')
      .select('date,outfit_items')
      .eq('user_id', userId)
      .gte('date', start)
      .lte('date', end);
    if (error) {
      setMsg(error.message);
      return;
    }
    const next: Record<string, DayPlan> = {};
    for (const row of data ?? []) {
      const raw = row.outfit_items;
      const arr = Array.isArray(raw) ? raw : [];
      const ids = new Set(items.map((i) => i.id));
      next[row.date] = arr
        .map((x: { id?: string }) => items.find((i) => i.id === x.id))
        .filter(Boolean) as WardrobeItemRow[];
      next[row.date] = next[row.date].filter((i) => ids.has(i.id));
    }
    setPlan((p) => ({ ...p, ...next }));
  }, [supabase, userId, weekDates, items]);

  useEffect(() => {
    if (userId) void loadPlan();
  }, [userId, loadPlan]);

  const toggleItemOnDay = (date: string, item: WardrobeItemRow) => {
    setPlan((p) => {
      const cur = p[date] ?? [];
      const has = cur.some((x) => x.id === item.id);
      const nextList = has ? cur.filter((x) => x.id !== item.id) : [...cur, item].slice(0, 8);
      return { ...p, [date]: nextList };
    });
  };

  const runAiWeek = async () => {
    if (!items.length) return;
    setAiLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/tools/planner-week', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          dates: weekDates,
          wardrobeItems: items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
          })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'AI failed');
      const days = j.days as Record<string, { itemIds?: string[] }>;
      const next: Record<string, DayPlan> = { ...plan };
      for (const d of weekDates) {
        const ids = days[d]?.itemIds ?? [];
        next[d] = ids.map((id) => items.find((i) => i.id === id)).filter(Boolean) as WardrobeItemRow[];
      }
      setPlan(next);
      setMsg('AI filled the week — review and save.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Error');
    } finally {
      setAiLoading(false);
    }
  };

  const saveWeek = async () => {
    if (!supabase || !userId) {
      setMsg('Sign in to save.');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const rows = weekDates.map((date) => ({
        user_id: userId,
        date,
        outfit_items: (plan[date] ?? []).map((i) => ({
          id: i.id,
          name: i.name,
          image_url: i.image_url,
        })),
      }));
      const { error } = await supabase.from('outfit_planner').upsert(rows, {
        onConflict: 'user_id,date',
      });
      if (error) throw new Error(error.message);
      setMsg('Plan saved to Supabase.');
      void refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080f] pb-20 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-2 text-xs uppercase tracking-widest text-fuchsia-300/90">Tools</div>
        <h1 className="text-3xl font-semibold text-white">Week outfit planner</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Plan seven days, let AI draft looks from your wardrobe, then save to the{' '}
          <code className="text-zinc-300">outfit_planner</code> table.
        </p>

        {noConfig ? (
          <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Configure Supabase env vars to enable saves.
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={aiLoading || !items.length}
            onClick={() => void runAiWeek()}
            className="rounded-xl border border-violet-500/40 bg-violet-600/30 px-4 py-2 text-sm font-medium text-violet-100 hover:bg-violet-600/50 disabled:opacity-40"
          >
            {aiLoading ? 'AI planning…' : 'AI suggest whole week'}
          </button>
          <button
            type="button"
            disabled={saving || !userId}
            onClick={() => void saveWeek()}
            className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save week to Supabase'}
          </button>
        </div>
        {msg ? <p className="mt-3 text-sm text-emerald-300/90">{msg}</p> : null}
        {wErr ? <p className="mt-2 text-sm text-rose-300">{wErr}</p> : null}

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {weekDates.map((date) => {
            const d = new Date(date + 'T12:00:00');
            const label = d.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const chosen = plan[date] ?? [];
            return (
              <div
                key={date}
                className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
                    <p className="font-mono text-xs text-zinc-600">{date}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDay(activeDay === date ? null : date)}
                    className="rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
                  >
                    {activeDay === date ? 'Close picker' : 'Pick items'}
                  </button>
                </div>
                <div className="mt-3 flex min-h-[72px] flex-wrap gap-1">
                  {chosen.length === 0 ? (
                    <span className="text-xs text-zinc-600">No items yet</span>
                  ) : (
                    chosen.map((it) => (
                      <button
                        key={it.id}
                        type="button"
                        title="Remove"
                        onClick={() => toggleItemOnDay(date, it)}
                        className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/10"
                      >
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[10px] text-zinc-500">
                            {it.name.slice(0, 2)}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
                {activeDay === date ? (
                  <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-black/40 p-2">
                    {wLoading ? (
                      <p className="text-xs text-zinc-500">Loading…</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-1">
                        {items.map((it) => {
                          const on = chosen.some((x) => x.id === it.id);
                          return (
                            <button
                              key={it.id}
                              type="button"
                              onClick={() => toggleItemOnDay(date, it)}
                              className={`relative aspect-square overflow-hidden rounded-md border text-left ${
                                on ? 'border-violet-400 ring-1 ring-violet-400' : 'border-transparent'
                              }`}
                            >
                              {it.image_url ? (
                                <img src={it.image_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="flex h-full items-center justify-center bg-zinc-800 p-1 text-[8px] text-zinc-400">
                                  {it.name}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs text-zinc-600">
          <Link href="/wardrobe" className="text-violet-400 hover:underline">
            Wardrobe
          </Link>
        </p>
      </div>
    </div>
  );
}
