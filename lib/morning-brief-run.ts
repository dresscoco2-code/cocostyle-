import { anthropicJson } from '@/lib/anthropic';
import { formatSkinToneColorRulesPrompt } from '@/lib/skin-tone-colors';

export type WardrobeLite = {
  id: string;
  name: string;
  category?: string | null;
  image_url?: string | null;
};

export type ProfileLite = {
  first_name?: string | null;
  skin_tone?: string | null;
  undertone?: string | null;
  gender?: string | null;
  age_group?: string | null;
  body_type?: string | null;
  style_personality?: string | null;
};

export type MorningBriefBody = {
  profile?: ProfileLite;
  wardrobeItems?: WardrobeLite[];
  weather?: { tempC: number; description: string; bucket: string; feelsLikeC?: number };
  dayOfWeek?: number;
  dayName?: string;
};

const SYSTEM = `You are CocoStyle's personal morning stylist. Output ONLY valid JSON (no markdown) with this exact shape:
{
  "outfitItemIds": ["uuid", ...],
  "itemReasons": [{"id":"uuid","why":"one sentence tied to weather/profile"}],
  "whyOutfitWorks": "2-4 sentences: why this complete outfit works TODAY for THIS person",
  "affirmation": "Warm, specific paragraph like a best friend — use their name and reference their real style words; never generic platitudes",
  "styleTip": "One practical styling tip they can do today using their existing wardrobe angle",
  "occasion": "short label e.g. Morning commute"
}
Rules:
- Pick ONE cohesive outfit: 3-5 items from the wardrobe list only. outfitItemIds must be subset of given ids.
- Consider: today's weather, gender, age group, body type for silhouette, day-of-week vibe (Monday skews polished/work-ready, Friday skews relaxed/casual, weekend social/relaxed unless wardrobe suggests otherwise).
- COLOR / SKIN TONE: Follow the SKIN TONE COLOR RULES block in the user message exactly. Infer each garment's colors from its name and category. Prioritize outfitItemIds whose colors align with the user's BEST colors and avoid leaning into their AVOID list unless weather forces a practical exception (then mention it in whyOutfitWorks).
- itemReasons must include every chosen id with a distinct "why" (mention color harmony where relevant).
- Be encouraging and concrete.`;

function dayVibe(dow: number): string {
  const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const n = names[dow] ?? 'Today';
  if (dow === 1) return `${n} — bias toward work-ready, polished layers.`;
  if (dow === 5) return `${n} — bias toward relaxed, weekend-anticipation casual.`;
  if (dow === 0 || dow === 6) return `${n} — weekend ease; comfort + personality.`;
  return `${n} — midweek balance: professional but approachable.`;
}

export async function runMorningBrief(body: MorningBriefBody) {
  const items = body.wardrobeItems ?? [];
  if (!items.length) {
    throw new Error('Wardrobe is empty.');
  }
  const w = body.weather ?? {
    tempC: 20,
    description: 'pleasant',
    bucket: 'mild',
    feelsLikeC: 20,
  };
  const dow = typeof body.dayOfWeek === 'number' ? body.dayOfWeek : new Date().getDay();
  const dayName = body.dayName ?? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dow];
  const p = body.profile ?? {};
  const wardrobeLines = items
    .map((i) => `- ${i.id} | ${i.name} | ${i.category ?? 'piece'}`)
    .join('\n');

  const skinToneBlock = formatSkinToneColorRulesPrompt(p.skin_tone, p.undertone);

  const user = `PROFILE:
first_name: ${p.first_name ?? 'friend'}
skin_tone: ${p.skin_tone ?? 'not set'}
undertone: ${p.undertone ?? 'not set'}
gender: ${p.gender ?? 'not set'}
age_group: ${p.age_group ?? 'not set'}
body_type: ${p.body_type ?? 'not set'}
style_personality: ${p.style_personality ?? 'developing personal style'}

SKIN TONE COLOR RULES (apply when picking items):
${skinToneBlock}

TODAY WEATHER: ${w.tempC}°C (feels ${w.feelsLikeC ?? w.tempC}°C), ${w.description}, mood: ${w.bucket}

DAY: ${dayName} (${dow}). ${dayVibe(dow)}

WARDROBE (pick only from these ids — prioritize pieces whose colors suit them per rules above):
${wardrobeLines}`;

  const result = await anthropicJson<{
    outfitItemIds: string[];
    itemReasons: Array<{ id: string; why: string }>;
    whyOutfitWorks: string;
    affirmation: string;
    styleTip: string;
    occasion: string;
  }>({ system: SYSTEM, user, maxTokens: 2200 });

  const idSet = new Set(items.map((i) => i.id));
  const ids = (result.outfitItemIds ?? []).filter((id) => idSet.has(id));
  const reasons = (result.itemReasons ?? []).filter((r) => idSet.has(r.id));

  return {
    outfitItemIds: ids,
    itemReasons: reasons,
    whyOutfitWorks: result.whyOutfitWorks ?? '',
    affirmation: result.affirmation ?? '',
    styleTip: result.styleTip ?? '',
    occasion: result.occasion ?? 'Good morning',
  };
}
