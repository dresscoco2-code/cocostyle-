'use client';

import Link from 'next/link';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { WardrobeItemRow } from '@/lib/wardrobe-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORY_SLUGS = ['uppers', 'lowers', 'shoes', 'jackets'] as const;
type CategorySlug = (typeof CATEGORY_SLUGS)[number];

const CATEGORY_META: Record<CategorySlug, { label: string; emoji: string }> = {
  uppers: { label: 'Uppers', emoji: '👕' },
  lowers: { label: 'Lowers', emoji: '👖' },
  shoes: { label: 'Shoes', emoji: '👟' },
  jackets: { label: 'Jackets', emoji: '🧥' },
};

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

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

async function removeBackgroundImageBase64(imageBase64: string): Promise<string> {
  const stripped = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  const res = await fetch('/api/wardrobe/remove-background', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: stripped }),
  });
  let data: { imageBase64?: string; error?: string };
  try {
    data = (await res.json()) as { imageBase64?: string; error?: string };
  } catch {
    throw new Error('Bad response from background removal');
  }
  if (!res.ok || typeof data.imageBase64 !== 'string') {
    throw new Error(typeof data.error === 'string' ? data.error : 'Background removal failed');
  }
  return data.imageBase64.replace(/^data:image\/\w+;base64,/, '');
}

function dash(v: string | null | undefined) {
  const t = v?.trim();
  return t ? t : '—';
}

type ValidateResponse =
  | { ok: true; color?: string; style?: string; occasion?: string; tip?: string; description?: string }
  | { ok?: false; error?: string };

function strOrNull(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t : null;
}

export default function WardrobeCategoryPage() {
  const params = useParams();
  const raw =
    typeof params.category === 'string'
      ? params.category.toLowerCase()
      : Array.isArray(params.category)
        ? params.category[0]?.toLowerCase() ?? ''
        : '';
  const slug = CATEGORY_SLUGS.includes(raw as CategorySlug) ? (raw as CategorySlug) : null;

  useEffect(() => {
    console.log('Component mounted, slug:', slug);
  }, [slug]);

  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uploadBusy = useRef(false);

  const [items, setItems] = useState<WardrobeItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [noConfig, setNoConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [itemName, setItemName] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [rejectToast, setRejectToast] = useState(false);

  const title = slug ? CATEGORY_META[slug].label : 'Wardrobe';

  const loadItems = useCallback(async () => {
    if (!slug) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) {
      setUserId(null);
      setItems([]);
      setLoading(false);
      return;
    }

    setUserId(uid);

    console.log('[wardrobe-category] slug', slug, 'params.category', params.category, 'uid', uid);

    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    console.log('[wardrobe-category] Supabase response', {
      rowCount: data?.length ?? 0,
      error,
      data,
    });

    if (error) {
      console.log('[wardrobe-category] query error', error.message);
      setError(error.message);
      setItems([]);
    } else {
      const filtered =
        data?.filter(
          (item) => item.category?.toLowerCase() === slug.toLowerCase()
        ) ?? [];

      console.log('[wardrobe-category] filtered for category', {
        slug,
        filteredCount: filtered.length,
        filtered,
      });

      setItems(filtered as WardrobeItemRow[]);
    }

    setLoading(false);
  }, [slug]);

  useEffect(() => {
    if (!rejectToast) return;
    const id = window.setTimeout(() => setRejectToast(false), 3500);
    return () => window.clearTimeout(id);
  }, [rejectToast]);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setNoConfig(true);
      setLoading(false);
      return;
    }
    setNoConfig(false);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => void loadItems());
    void loadItems();
    return () => subscription.unsubscribe();
  }, [loadItems]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!userId || !slug) return;

    const files = Array.from(fileRef.current?.files ?? []);
    const urlField = imageUrlInput.trim();
    if (files.length === 0 && !urlField) {
      setUploadError('Choose one or more photos or paste an image URL.');
      return;
    }

    if (uploadBusy.current) return;
    uploadBusy.current = true;

    setUploading(true);
    setUploadError(null);
    setRejectToast(false);
    setUploadProgress(null);

    const bucket = process.env.NEXT_PUBLIC_WARDROBE_BUCKET ?? 'wardrobe';

    const parseValidateBody = async (res: Response): Promise<ValidateResponse> => {
      try {
        return (await res.json()) as ValidateResponse;
      } catch {
        throw new Error('Bad response from validation');
      }
    };

    const insertRow = async (args: {
      name: string;
      image_url: string;
      meta: ValidateResponse & { ok?: boolean };
    }) => {
      const m = args.meta;
      const color = m && 'ok' in m && m.ok === true ? strOrNull(m.color) : null;
      const style = m && 'ok' in m && m.ok === true ? strOrNull(m.style) : null;
      const occasion = m && 'ok' in m && m.ok === true ? strOrNull(m.occasion) : null;
      const tip = m && 'ok' in m && m.ok === true ? strOrNull(m.tip) : null;

      const { data: inserted, error: insErr } = await supabase
        .from('wardrobe_items')
        .insert({
          user_id: userId,
          name: args.name,
          category: slug,
          image_url: args.image_url,
          wear_count: 0,
          color,
          style,
          occasion,
          tip,
        })
        .select()
        .single();

      if (insErr) throw insErr;
      if (inserted) {
        setItems((prev) => [inserted as WardrobeItemRow, ...prev]);
      }
    };

    try {
      if (files.length > 0) {
        let rejected = 0;
        let failed = 0;

        for (let i = 0; i < files.length; i++) {
          const file = files[i]!;
          setUploadProgress({ current: i + 1, total: files.length });

          const validatePayload = await fileToBase64(file).then(({ base64, mimeType }) => ({
            imageBase64: base64,
            mimeType,
          }));

          const res = await fetch('/api/wardrobe/validate-clothing-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validatePayload),
          });

          const body = await parseValidateBody(res);
          const errLow = String('error' in body ? body.error : '').toLowerCase();

          if (errLow.includes('not_clothing')) {
            rejected += 1;
            setRejectToast(true);
            continue;
          }

          if (!res.ok || !('ok' in body) || body.ok !== true) {
            failed += 1;
            continue;
          }

          const cleanedB64 = await removeBackgroundImageBase64(validatePayload.imageBase64);
          const cleanedBlob = base64ToBlob(cleanedB64, 'image/png');
          const path = `${userId}/${crypto.randomUUID()}.png`;
          const { error: upErr } = await supabase.storage.from(bucket).upload(path, cleanedBlob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/png',
          });
          if (upErr) throw upErr;
          const image_url = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

          const name =
            itemName.trim() || file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Wardrobe piece';

          await insertRow({ name, image_url, meta: body });
        }

        const parts: string[] = [];
        if (rejected) parts.push(`${rejected} skipped (not valid clothing photos)`);
        if (failed) parts.push(`${failed} failed validation`);
        if (parts.length) setUploadError(parts.join(' · '));

        setItemName('');
        if (fileRef.current) fileRef.current.value = '';
      } else {
        const res = await fetch('/api/wardrobe/validate-clothing-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: urlField }),
        });

        const body = await parseValidateBody(res);
        const errLow = String('error' in body ? body.error : '').toLowerCase();

        if (errLow.includes('not_clothing')) {
          setRejectToast(true);
          return;
        }

        if (!res.ok || !('ok' in body) || body.ok !== true) {
          throw new Error(
            'error' in body && typeof body.error === 'string' ? body.error : 'Image validation failed'
          );
        }

        const urlImgRes = await fetch(urlField);
        if (!urlImgRes.ok) {
          throw new Error('Could not fetch image URL for background removal');
        }
        const urlB64 = arrayBufferToBase64(await urlImgRes.arrayBuffer());
        const cleanedUrlB64 = await removeBackgroundImageBase64(urlB64);
        const cleanedUrlBlob = base64ToBlob(cleanedUrlB64, 'image/png');
        const urlPath = `${userId}/${crypto.randomUUID()}.png`;
        const { error: urlUpErr } = await supabase.storage.from(bucket).upload(urlPath, cleanedUrlBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/png',
        });
        if (urlUpErr) throw urlUpErr;
        const image_url = supabase.storage.from(bucket).getPublicUrl(urlPath).data.publicUrl;

        const name = itemName.trim() || 'Wardrobe piece';
        await insertRow({ name, image_url, meta: body });

        setItemName('');
        setImageUrlInput('');
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadProgress(null);
      setUploading(false);
      uploadBusy.current = false;
    }
  };

  const activeSlug =
    (typeof params.category === 'string'
      ? params.category
      : Array.isArray(params.category)
        ? params.category[0]
        : ''
    )?.toLowerCase() ?? '';

  return (
    <div className="min-h-screen bg-[#07070c] text-zinc-100">
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '12px 20px',
          background: '#0d0d18',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <a
          href="/wardrobe"
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.85rem',
            marginRight: '8px',
            textDecoration: 'none',
          }}
        >
          ← Back
        </a>
        {CATEGORY_SLUGS.map((s) => {
          const active = activeSlug === s;
          const { emoji, label } = CATEGORY_META[s];
          return (
            <a
              key={s}
              href={`/wardrobe/${s}`}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                ...(active
                  ? {
                      background: 'linear-gradient(135deg, #e8a598, #8b5cf6)',
                      color: '#ffffff',
                      border: '1px solid transparent',
                    }
                  : {
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.72)',
                      background: 'rgba(255,255,255,0.04)',
                    }),
              }}
            >
              {emoji} {label}
            </a>
          );
        })}
      </div>

      {rejectToast ? (
        <div
          role="alert"
          className="fixed left-1/2 top-20 z-[70] w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border border-rose-500/45 bg-rose-950/95 px-4 py-3 text-center text-sm text-rose-50 shadow-xl backdrop-blur-md"
        >
          ⚠️ Only clothing items can be uploaded. Use a flat lay, hanger, or mannequin photo — no
          selfies or people.
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        {!slug ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-white/55">Unknown category.</p>
            <Link
              href="/wardrobe/uppers"
              className="mt-4 inline-block text-sm font-medium text-[#c084fc] hover:text-[#e8a598]"
            >
              Go to Uppers
            </Link>
          </div>
        ) : (
          <>
            <header className="border-b border-white/[0.08] pb-6">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                <span className="bg-gradient-to-r from-[#e8a598] via-[#c084fc] to-[#8b5cf6] bg-clip-text text-transparent">
                  {title}
                </span>
              </h1>
              <p className="mt-2 text-sm text-white/45">
                {loading ? 'Loading…' : `${items.length} piece${items.length === 1 ? '' : 's'}`}
              </p>
            </header>

            {noConfig ? (
              <p className="mt-6 text-sm text-amber-200/90">
                Add <code className="text-white/80">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
                <code className="text-white/80">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
              </p>
            ) : null}
            {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

            {!userId && !loading ? (
              <p className="mt-6 text-sm text-white/45">Sign in to manage your wardrobe.</p>
            ) : null}

            <section className="mt-10">
              <h2 className="text-sm font-semibold text-white/90">Add item</h2>
              <form
                ref={formRef}
                onSubmit={(ev) => void handleUpload(ev)}
                className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-end">
                  <label className="block flex-1 text-xs text-white/45">
                    Name (optional)
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="e.g. Olive linen shirt"
                      className="mt-1 w-full rounded-xl border border-white/10 bg-[#07070c] px-3 py-2 text-sm text-white placeholder:text-white/25"
                    />
                  </label>
                  <label className="block flex-1 text-xs text-white/45">
                    Photo
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={() => {
                        setRejectToast(false);
                        const n = fileRef.current?.files?.length ?? 0;
                        if (n === 0 || !userId || !slug || uploadBusy.current) return;
                        queueMicrotask(() => formRef.current?.requestSubmit());
                      }}
                      className="mt-1 w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white"
                    />
                  </label>
                </div>
                <label className="block text-xs text-white/45">
                  Or image URL
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      setRejectToast(false);
                    }}
                    placeholder="https://…"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-[#07070c] px-3 py-2 text-sm text-white placeholder:text-white/25"
                  />
                </label>
                <button
                  type="submit"
                  disabled={uploading || !userId}
                  className="rounded-xl bg-gradient-to-r from-[#e8a598] to-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-[#07070c] disabled:opacity-40"
                >
                  {uploading ? 'Working…' : 'Upload'}
                </button>
                {uploadProgress ? (
                  <p className="text-sm text-white/60">
                    Uploading {uploadProgress.current} of {uploadProgress.total}…
                  </p>
                ) : null}
                {uploadError ? <p className="text-sm text-rose-300">{uploadError}</p> : null}
              </form>
            </section>

            <section className="mt-12">
              <h2 className="mb-4 text-sm font-semibold text-white/90">Your pieces</h2>
              {loading ? (
                <p className="text-sm text-white/40">Loading wardrobe…</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-white/40">
                  Nothing in {title} yet. Upload a validated clothing photo above.
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((row) => (
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
                      <div className="space-y-2 p-4 text-sm">
                        <p className="truncate font-semibold text-white">{dash(row.name)}</p>
                        <dl className="grid gap-1.5 text-xs text-white/55">
                          <div className="flex justify-between gap-2">
                            <dt className="text-white/35">Color</dt>
                            <dd className="text-right text-white/80">{dash(row.color)}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-white/35">Style</dt>
                            <dd className="text-right text-white/80">{dash(row.style)}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-white/35">Occasion</dt>
                            <dd className="text-right text-white/80">{dash(row.occasion)}</dd>
                          </div>
                          <div className="flex justify-between gap-2 border-t border-white/[0.06] pt-2">
                            <dt className="text-white/35">Tip</dt>
                            <dd className="max-w-[65%] text-right text-white/80">{dash(row.tip)}</dd>
                          </div>
                        </dl>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
