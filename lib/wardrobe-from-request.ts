import type { NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Same pattern as client closet: session user + wardrobe_items for that user only. */
export type WardrobeFromRequestResult = {
  accessToken: string | null;
  supabase: SupabaseClient | null;
  userId: string | null;
  items: Record<string, unknown>[];
  wardrobeError: { message: string } | null;
  authError: string | null;
};

export async function loadWardrobeFromRequest(req: NextRequest): Promise<WardrobeFromRequestResult> {
  const raw = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
  const m = raw.match(/^Bearer\s+(.+)$/i);
  let accessToken = m?.[1]?.trim() ?? '';

  if (!accessToken) {
    try {
      const body = (await req.clone().json()) as { accessToken?: string };
      if (typeof body.accessToken === 'string') accessToken = body.accessToken.trim();
    } catch {
      /* no JSON body */
    }
  }

  if (!accessToken) {
    return {
      accessToken: null,
      supabase: null,
      userId: null,
      items: [],
      wardrobeError: null,
      authError: 'missing_token',
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return {
      accessToken,
      supabase: null,
      userId: null,
      items: [],
      wardrobeError: { message: 'Supabase URL or anon key is not configured' },
      authError: null,
    };
  }

  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return {
      accessToken,
      supabase,
      userId: null,
      items: [],
      wardrobeError: null,
      authError: userErr?.message ?? 'invalid_session',
    };
  }

  const uid = user.id;

  const { data, error: qErr } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  if (qErr) {
    return {
      accessToken,
      supabase,
      userId: uid,
      items: [],
      wardrobeError: { message: qErr.message },
      authError: null,
    };
  }

  return {
    accessToken,
    supabase,
    userId: uid,
    items: (data ?? []) as Record<string, unknown>[],
    wardrobeError: null,
    authError: null,
  };
}
