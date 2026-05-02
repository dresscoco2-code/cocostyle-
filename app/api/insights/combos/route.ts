import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const client = new Anthropic();

function bearerToken(req: NextRequest, body: { accessToken?: string }): string {
  const raw = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
  const m = raw.match(/^Bearer\s+(.+)$/i);
  const fromHeader = m?.[1]?.trim() ?? '';
  if (fromHeader) return fromHeader;
  if (typeof body.accessToken === 'string') return body.accessToken.trim();
  return '';
}

/**
 * Wardrobe fetch matches app/closet/page.tsx load():
 * - getSupabaseBrowserClient → here: cookie session via createSupabaseServerClient, else same URL/key + Bearer as browser would send
 * - await supabase.auth.getSession() → uid = session?.user?.id
 * - .from('wardrobe_items').select('*').eq('user_id', uid).order('created_at', { ascending: false })
 */
async function getUidAndSupabaseForCombos(
  req: NextRequest,
  body: { accessToken?: string },
): Promise<{ supabase: SupabaseClient; uid: string } | { error: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return { error: 'Supabase is not configured on the server.' };
  }

  let supabase: SupabaseClient;
  let uid: string | null = null;

  try {
    supabase = createSupabaseServerClient();
  } catch {
    return { error: 'Supabase server client could not be created.' };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  uid = sessionData.session?.user?.id ?? null;

  if (!uid) {
    const token = bearerToken(req, body);
    if (!token) {
      return { error: 'missing_auth' };
    }
    supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data: bearerSession } = await supabase.auth.getSession();
    uid = bearerSession.session?.user?.id ?? null;
    if (!uid) {
      const { data: userData } = await supabase.auth.getUser();
      uid = userData.user?.id ?? null;
    }
  }

  if (!uid) {
    return { error: 'invalid_session' };
  }

  return { supabase, uid };
}

export async function POST(req: NextRequest) {
  let body: { accessToken?: string } = {};
  try {
    body = (await req.json()) as { accessToken?: string };
  } catch {
    body = {};
  }

  const auth = await getUidAndSupabaseForCombos(req, body);

  if ('error' in auth) {
    if (auth.error === 'missing_auth') {
      return NextResponse.json({
        result: 'Sign in to load your wardrobe insights.',
        skinTone: '',
        undertone: '',
        bestColors: [] as string[],
      });
    }
    if (auth.error === 'invalid_session') {
      return NextResponse.json({
        result: 'Could not verify your session. Sign in again and retry.',
        skinTone: '',
        undertone: '',
        bestColors: [] as string[],
      });
    }
    return NextResponse.json({
      result: auth.error,
      skinTone: '',
      undertone: '',
      bestColors: [] as string[],
    });
  }

  const { supabase, uid } = auth;

  const { data, error: qErr } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  if (qErr) {
    return NextResponse.json({
      result: `Could not load wardrobe: ${qErr.message}`,
      skinTone: '',
      undertone: '',
      bestColors: [] as string[],
    });
  }

  const items = data ?? [];

  const { data: profile } = await supabase
    .from('profiles')
    .select('skin_tone, undertone')
    .eq('id', uid)
    .maybeSingle();

  const skinTone = profile?.skin_tone || 'unknown';
  const undertone = profile?.undertone || 'unknown';

  if (items.length === 0) {
    return NextResponse.json({ result: 'No wardrobe items found. Add some clothes first!' });
  }

  const wardrobeText = items
    .map((i) => `- ${i.name} (${i.category ?? 'piece'})`)
    .join('\n');

  const colorMsg = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `You are a color expert. For someone with skin tone "${skinTone}" and undertone "${undertone}", list the top 8 colors that make them look most attractive and radiant. Return ONLY a JSON array of color names like ["ivory", "coral", "navy"]. No explanation.`,
      },
    ],
  });

  let bestColors: string[] = [];
  try {
    const colorText = colorMsg.content[0].type === 'text' ? colorMsg.content[0].text : '[]';
    bestColors = JSON.parse(colorText.replace(/```json|```/g, '').trim());
  } catch {
    bestColors = ['navy', 'white', 'black', 'coral', 'beige'];
  }

  const comboMsg = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: `You are CocoStyle AI stylist. 

User's skin tone: ${skinTone} (undertone: ${undertone})
Best colors for their skin tone: ${bestColors.join(', ')}

Their wardrobe:
${wardrobeText}

Create 5 stunning outfit combinations ONLY from their wardrobe items. Prioritize items in their best colors. For each combo:

**Look [1-5]: [Creative Name]**
👗 **Outfit**: [exact items from wardrobe]
🎨 **Why it suits you**: [specific reason based on their skin tone]
⭐ **Confidence Score**: [X/10]
🎯 **Best for**: [occasion]
💄 **Beauty tip**: [makeup/hair tip that complements skin tone]

Make each look feel luxurious and personalized. Under 300 words total.`,
      },
    ],
  });

  const result = comboMsg.content[0].type === 'text' ? comboMsg.content[0].text : '';

  return NextResponse.json({
    result,
    skinTone,
    undertone,
    bestColors,
  });
}
