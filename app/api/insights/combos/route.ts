import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const client = new Anthropic();

function bearerFromRequest(req: NextRequest): string {
  const raw = req.headers.get("authorization") ?? req.headers.get("Authorization") ?? "";
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() ?? "";
}

export async function POST(req: NextRequest) {
  let body: { accessToken?: string } = {};
  try {
    body = (await req.json()) as { accessToken?: string };
  } catch {
    body = {};
  }

  const accessToken = bearerFromRequest(req) || String(body.accessToken ?? "").trim();

  if (!accessToken) {
    return NextResponse.json({
      result: "Sign in to load your wardrobe insights.",
      skinTone: "",
      undertone: "",
      bestColors: [] as string[],
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({
      result: "Could not verify your session. Sign in again and retry.",
      skinTone: "",
      undertone: "",
      bestColors: [] as string[],
    });
  }

  const uid = user.id;

  const [wardrobeRes, profileRes] = await Promise.all([
    supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("skin_tone, undertone")
      .eq("id", uid)
      .maybeSingle(),
  ]);

  if (wardrobeRes.error) {
    return NextResponse.json({
      result: `Could not load wardrobe: ${wardrobeRes.error.message}`,
      skinTone: "",
      undertone: "",
      bestColors: [] as string[],
    });
  }

  const items = wardrobeRes.data || [];
  const skinTone = profileRes.data?.skin_tone || "unknown";
  const undertone = profileRes.data?.undertone || "unknown";

  if (items.length === 0) {
    return NextResponse.json({ result: "No wardrobe items found. Add some clothes first!" });
  }

  const wardrobeText = items
    .map((i) => `- ${i.name} (${i.category ?? "piece"})`)
    .join("\n");

  // AI 1 - Color Expert: find best colors for skin tone
  const colorMsg = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `You are a color expert. For someone with skin tone "${skinTone}" and undertone "${undertone}", list the top 8 colors that make them look most attractive and radiant. Return ONLY a JSON array of color names like ["ivory", "coral", "navy"]. No explanation.`
    }]
  });

  let bestColors: string[] = [];
  try {
    const colorText = colorMsg.content[0].type === "text" ? colorMsg.content[0].text : "[]";
    bestColors = JSON.parse(colorText.replace(/```json|```/g, "").trim());
  } catch {
    bestColors = ["navy", "white", "black", "coral", "beige"];
  }

  // AI 2 - Outfit Combo Builder: create 5 combos using wardrobe + best colors
  const comboMsg = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: `You are CocoStyle AI stylist. 

User's skin tone: ${skinTone} (undertone: ${undertone})
Best colors for their skin tone: ${bestColors.join(", ")}

Their wardrobe:
${wardrobeText}

Create 5 stunning outfit combinations ONLY from their wardrobe items. Prioritize items in their best colors. For each combo:

**Look [1-5]: [Creative Name]**
👗 **Outfit**: [exact items from wardrobe]
🎨 **Why it suits you**: [specific reason based on their skin tone]
⭐ **Confidence Score**: [X/10]
🎯 **Best for**: [occasion]
💄 **Beauty tip**: [makeup/hair tip that complements skin tone]

Make each look feel luxurious and personalized. Under 300 words total.`
    }]
  });

  const result = comboMsg.content[0].type === "text" ? comboMsg.content[0].text : "";
  
  return NextResponse.json({ 
    result,
    skinTone,
    undertone,
    bestColors 
  });
}
