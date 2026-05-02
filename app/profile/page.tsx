'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  resolveSkinTonePaletteKey,
  skinToneColors,
} from '@/lib/skin-tone-colors';
import type { SkinToneResult } from '@/lib/agents/types';

async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
  return {
    base64: btoa(binary),
    mimeType: file.type?.startsWith('image/') ? file.type : 'image/jpeg',
  };
}

function undertoneSwatchStyle(undertone: string | null | undefined): string {
  const u = undertone?.toLowerCase() ?? '';
  if (u.includes('warm')) {
    return 'linear-gradient(135deg, #fdba74, #ea580c, #9a3412)';
  }
  if (u.includes('cool')) {
    return 'linear-gradient(135deg, #93c5fd, #6366f1, #312e81)';
  }
  return 'linear-gradient(135deg, #d4d4d8, #a78bfa, #52525b)';
}

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [skinTone, setSkinTone] = useState<string | null>(null);
  const [undertone, setUndertone] = useState<string | null>(null);
  const [bestColors, setBestColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [noConfig, setNoConfig] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setNoConfig(true);
      setLoading(false);
      return;
    }
    setNoConfig(false);
    setLoading(true);
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    const u = sessionData.session?.user ?? null;
    setUser(u);
    if (!u) {
      setFirstName(null);
      setSkinTone(null);
      setUndertone(null);
      setBestColors([]);
      setLoading(false);
      return;
    }
    const { data: prof } = await supabase
      .from('profiles')
      .select('first_name,skin_tone,undertone')
      .eq('id', u.id)
      .maybeSingle();
    setFirstName(prof?.first_name ?? null);
    setSkinTone(prof?.skin_tone ?? null);
    setUndertone(prof?.undertone ?? null);
    setBestColors([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const paletteKey = resolveSkinTonePaletteKey(skinTone, undertone);
  const paletteRule = skinToneColors[paletteKey];

  const displayName =
    firstName?.trim() ||
    (typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null) ||
    (user?.email ? user.email.split('@')[0] : null) ||
    '—';

  const handleSelfie = async (file: File) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;
    setAnalyzeLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await fetch('/api/agents/skin-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      const data = (await res.json()) as SkinToneResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');

      const { error: upErr } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          skin_tone: data.skinTone,
          undertone: data.undertone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );
      if (upErr) throw upErr;

      setSkinTone(data.skinTone);
      setUndertone(data.undertone);
      setBestColors(Array.isArray(data.bestColors) ? data.bestColors : []);
      setSuccess('Skin tone saved to your profile.');
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setAnalyzeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070c] pb-20 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">CocoStyle</p>
        <h1 className="mt-2 bg-gradient-to-r from-[#e8a598] via-[#c084fc] to-[#8b5cf6] bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
          Profile
        </h1>
        <p className="mt-3 text-sm text-white/50">
          Your account, coloring, and best shades for outfits across CocoStyle.
        </p>

        {noConfig ? (
          <p className="mt-6 text-sm text-amber-200/90">Supabase is not configured.</p>
        ) : null}

        {loading ? (
          <p className="mt-8 text-sm text-white/40">Loading…</p>
        ) : !user ? (
          <p className="mt-8 text-sm text-white/45">Sign in to manage your profile.</p>
        ) : (
          <div className="mt-10 space-y-8">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold text-white/90">Account</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/35">Name</dt>
                  <dd className="mt-1 text-white">{displayName}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-white/35">Email</dt>
                  <dd className="mt-1 text-white/85">{user.email ?? '—'}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold text-white/90">Selfie · skin tone</h2>
              <p className="mt-2 text-sm text-white/45">
                Upload a clear face/neck photo. We analyze it and save skin tone + undertone to
                your profile for better outfit picks.
              </p>
              <label className="mt-4 block text-xs text-white/45">
                Photo
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  disabled={analyzeLoading}
                  onChange={(ev) => {
                    const f = ev.target.files?.[0];
                    if (f) void handleSelfie(f);
                  }}
                  className="mt-1 w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
                />
              </label>
              {analyzeLoading ? (
                <p className="mt-3 text-sm text-white/50">Analyzing…</p>
              ) : null}
              {error ? (
                <p className="mt-3 text-sm text-rose-300" role="alert">
                  {error}
                </p>
              ) : null}
              {success ? <p className="mt-3 text-sm text-emerald-300/90">{success}</p> : null}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold text-white/90">Detected coloring</h2>
              {!skinTone && !undertone ? (
                <p className="mt-3 text-sm text-white/40">Upload a selfie to detect your tones.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div
                    className="h-24 w-24 shrink-0 rounded-2xl ring-2 ring-white/20 shadow-lg"
                    style={{ background: undertoneSwatchStyle(undertone) }}
                    title="Undertone-inspired swatch"
                  />
                  <div>
                    <p className="text-lg font-medium text-white">{skinTone ?? '—'}</p>
                    {undertone ? (
                      <p className="mt-1 text-sm text-[#c084fc]">
                        Undertone: <span className="capitalize">{undertone}</span>
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-white/40">
                      CocoStyle palette: <span className="text-white/60">{paletteKey}</span>
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-sm font-semibold text-white/90">Best colors for you</h2>
              <p className="mt-2 text-sm text-white/45">
                From your latest analysis plus CocoStyle&apos;s palette for your undertone.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(bestColors.length ? bestColors : paletteRule.best).map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/85"
                  >
                    {c}
                  </span>
                ))}
              </div>
              {paletteRule.avoid.length ? (
                <div className="mt-6 border-t border-white/[0.06] pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/35">
                    Often less flattering
                  </p>
                  <p className="mt-2 text-sm text-white/50">{paletteRule.avoid.join(' · ')}</p>
                </div>
              ) : null}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
