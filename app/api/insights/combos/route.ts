import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { loadWardrobeFromRequest } from '@/lib/wardrobe-from-request';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const r = await loadWardrobeFromRequest(req);

  if (!r.accessToken || r.authError === 'missing_token') {
    return NextResponse.json({
      result: 'Sign in to load your wardrobe insights.',
      skinTone: '',
      undertone: '',
      bestColors: [] as string[],
    });
  }

  if (r.authError || !r.userId || !r.supabase) {
    return NextResponse.json({
      result: 'Could not verify your session. Sign in again and retry.',
      skinTone: '',
      undertone: '',
      bestColors: [] as string[],
    });
  }

  if (r.wardrobeError) {
    return NextResponse.json({
      result: `Could not load wardrobe: ${r.wardrobeError.message}`,
      skinTone: '',
      undertone: '',
      bestColors: [] as string[],
    });
  }

  const items = r.items as Array<{ name?: string; category?: string | null }>;

  const { data: profile } = await r.supabase
    .from('profiles')
    .select('skin_tone, undertone')
    .eq('id', r.userId)
    .maybeSingle();

  const skinTone = profile?.skin_tone || 'unknown';
  const undertone = profile?.undertone || 'unknown';

  if (items.length === 0) {
    return NextResponse.json({ result: 'No wardrobe items found. Add some clothes first!' });
  }

  const wardrobeText = items
    .map((i) => `- ${i.name ?? 'Item'} (${i.category ?? 'piece'})`)
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
