'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

type RateResult = {
  score: number;
  compliments: string[];
  improvement: string;
};

export default function OutfitRaterPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<RateResult | null>(null);

  const onFile = (file: File | null) => {
    setResult(null);
    setErr(null);
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const submit = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setErr('Choose a photo first.');
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(new Error('read failed'));
        r.readAsDataURL(file);
      });
      const comma = dataUrl.indexOf(',');
      const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
      const mime = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';
      const res = await fetch('/api/tools/outfit-rate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mimeType: mime }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Rate failed');
      setResult(j as RateResult);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080f] pb-20 text-zinc-100">
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-2 text-xs uppercase tracking-widest text-cyan-300/90">Tools</div>
        <h1 className="text-3xl font-semibold text-white">Outfit rater</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Upload today&apos;s outfit. Claude returns a score, three specific compliments, and one
          improvement.
        </p>

        <div className="mt-10">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.04] py-16 transition hover:border-violet-400/50 hover:bg-violet-950/20"
          >
            <span className="text-4xl">📷</span>
            <span className="mt-3 text-lg font-medium text-white">Upload today&apos;s outfit</span>
            <span className="mt-1 text-xs text-zinc-500">JPEG / PNG / WebP</span>
          </button>
        </div>

        {preview ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="max-h-80 w-full object-contain" />
          </div>
        ) : null}

        <button
          type="button"
          disabled={!preview || loading}
          onClick={() => void submit()}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-violet-600 py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          {loading ? 'Analyzing…' : 'Get AI feedback'}
        </button>
        {err ? <p className="mt-3 text-center text-sm text-rose-300">{err}</p> : null}

        {result ? (
          <section className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-gradient-to-b from-violet-950/30 to-transparent p-8">
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-zinc-500">Your confidence score</p>
              <p className="mt-2 text-5xl font-semibold text-white">
                {result.score.toFixed(1)}
                <span className="text-2xl text-zinc-500">/10</span>{' '}
                <span className="text-3xl">⭐</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-emerald-400/90">Compliments</p>
              <ul className="mt-2 space-y-2 text-sm text-zinc-200">
                {result.compliments.map((c, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
              <p className="text-xs font-medium uppercase text-amber-300/90">One improvement</p>
              <p className="mt-2 text-sm text-amber-100/90">{result.improvement}</p>
            </div>
          </section>
        ) : null}

        <p className="mt-10 text-center text-xs text-zinc-600">
          <Link href="/" className="text-violet-400 hover:underline">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}
