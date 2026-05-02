/** Detailed best / avoid palettes per skin tone category (CocoStyle color rules). */
export const skinToneColors = {
  'Warm Deep': {
    best: [
      'rust',
      'olive',
      'mustard',
      'burgundy',
      'burnt orange',
      'camel',
      'forest green',
      'chocolate brown',
      'gold',
      'earth tones',
    ],
    avoid: ['pastels', 'neon', 'pure white', 'cool grey', 'icy blue'],
  },
  'Warm Medium': {
    best: [
      'coral',
      'peach',
      'warm red',
      'terracotta',
      'golden yellow',
      'warm brown',
      'olive',
      'cream',
    ],
    avoid: ['cool pink', 'silver', 'heavy black'],
  },
  'Warm Light': {
    best: ['peach', 'warm pink', 'coral', 'gold', 'warm white', 'camel', 'light olive'],
    avoid: ['cool tones', 'icy colors', 'stark white'],
  },
  'Cool Deep': {
    best: ['royal blue', 'emerald', 'cool red', 'purple', 'black', 'navy', 'jewel tones'],
    avoid: ['orange', 'yellow', 'warm brown'],
  },
  'Cool Medium': {
    best: ['navy', 'cool pink', 'lavender', 'emerald', 'cool white', 'silver'],
    avoid: ['warm orange', 'mustard', 'warm brown'],
  },
  'Cool Light': {
    best: ['pastel blue', 'soft pink', 'lavender', 'mint', 'cool white', 'light grey'],
    avoid: ['bright orange', 'warm yellow', 'earth tones'],
  },
  'Neutral Medium': {
    best: ['most colors work', 'navy', 'white', 'grey', 'blush', 'sage green', 'dusty rose'],
    avoid: ['very bright neons only'],
  },
} as const;

/** @deprecated Use skinToneColors — same object. */
export const SKIN_TONE_COLOR_RULES = skinToneColors;

export type SkinTonePaletteKey = keyof typeof skinToneColors;

const ORDERED_KEYS: SkinTonePaletteKey[] = [
  'Warm Deep',
  'Warm Medium',
  'Warm Light',
  'Cool Deep',
  'Cool Medium',
  'Cool Light',
  'Neutral Medium',
];

/** Map profile / agent strings to a palette bucket for color rules. */
export function resolveSkinTonePaletteKey(
  skinTone?: string | null,
  undertone?: string | null,
): SkinTonePaletteKey {
  const combined = `${skinTone ?? ''} ${undertone ?? ''}`.toLowerCase().replace(/\s+/g, ' ').trim();

  for (const k of ORDERED_KEYS) {
    const kl = k.toLowerCase();
    if (combined === kl || combined.includes(kl)) return k;
  }

  const warm = /\bwarm\b/.test(combined) || undertone?.toLowerCase().trim() === 'warm';
  const cool = /\bcool\b/.test(combined) || undertone?.toLowerCase().trim() === 'cool';
  const neutralU = undertone?.toLowerCase().trim() === 'neutral';
  const neutral = /\bneutral\b/.test(combined) || neutralU;
  const deep = /\bdeep\b/.test(combined);
  const medium = /\bmedium\b/.test(combined);
  const light = /\blight\b/.test(combined);

  if (neutral && medium) return 'Neutral Medium';
  if (warm && deep) return 'Warm Deep';
  if (warm && light) return 'Warm Light';
  if (warm && medium) return 'Warm Medium';
  if (cool && deep) return 'Cool Deep';
  if (cool && light) return 'Cool Light';
  if (cool && medium) return 'Cool Medium';
  if (warm && !cool) return 'Warm Medium';
  if (cool && !warm) return 'Cool Medium';
  return 'Neutral Medium';
}

/**
 * Exact user-facing lines for Claude, plus full `skinToneColors` JSON and workflow steps.
 */
export function formatSkinToneColorRulesPrompt(
  skinTone?: string | null,
  undertone?: string | null,
): string {
  const mappedCategory = resolveSkinTonePaletteKey(skinTone, undertone);
  const rule = skinToneColors[mappedCategory];
  const best = rule.best.join(', ');
  const avoid = rule.avoid.join(', ');
  const skinTonePhrase = skinTone?.trim() || mappedCategory;

  const core = `The user has ${skinTonePhrase} skin tone.
Their best colors are ${best}.
They should avoid ${avoid}.
From their wardrobe, prioritize items in these flattering colors when building outfits.`;

  const fullTable = `\n\nFull skinToneColors reference (all categories):\n${JSON.stringify(skinToneColors, null, 2)}`;

  const workflow = `
When generating outfit suggestions:
1. Get user skin tone from profile (skin_tone / undertone) and map to the closest skinToneColors category (mapped category for this user: "${mappedCategory}").
2. Match wardrobe item names and categories to BEST colors for that category; infer colors from text when needed.
3. Prioritize items that match their skin tone (BEST list); deprioritize items that read as AVOID colors unless unavoidable—then explain.
4. Tell the user (in rationale / reasons) which flattering colors you used and why they suit them.
5. Pick only from the provided wardrobe list; choose items whose implied colors align with BEST and not AVOID.`;

  return `${core}${fullTable}${workflow}`;
}
