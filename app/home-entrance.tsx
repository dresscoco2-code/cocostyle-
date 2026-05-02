'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function HomeEntrance() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setChecking(false);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/morning');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-[#06060a] text-zinc-400">
        <p className="text-sm">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center text-zinc-200">
      <h1 className="text-3xl font-semibold text-white">CocoStyle</h1>
      <p className="mt-4 text-zinc-400">
        Your personal stylist — start with your morning screen after you sign in.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/morning"
          className="inline-flex rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-3 text-sm font-medium text-white hover:brightness-110"
        >
          🌅 Good morning
        </Link>
        <Link
          href="/agents"
          className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm text-zinc-200 hover:bg-white/10"
        >
          🤖 AI Agents
        </Link>
      </div>
    </main>
  );
}
