import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { accessToken } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const [wardrobeRes, profileRes] = await Promise.all([
    supabase.from("wardrobe_items").select("name, category, wear_count").order("category"),
    supabase.from("profiles").select("skin_tone, undertone").single()
  ]);
  const items = wardrobeRes.data || [];
  const skinTone = profileRes.data?.skin_tone || "unknown";
  const undertone = profileRes.data?.undertone || "unknown";
  if (items.length === 0) {
    return NextResponse.json({ result: "No wardrobe items found. Add some clothes first!" });
  }
  const wardrobeText = items.map((i: {name: string; category: string}) => `- ${i.name} (${i.category})`).join("\n");
  const colorMsg = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 300,
    messages: [{ role: "user", content: `You are a color expert. For someone with skin tone "${skinTone}" and undertone "${undertone}", list the top 8 colors that make them look most attractive. Return ONLY a JSON array like ["ivory","coral","navy"]. No explanation.` }]
  });
  let bestColors: string[] = [];
  try {
    const colorText = colorMsg.content[0].type === "text" ? colorMsg.content[0].text : "[]";
    bestColors = JSON.parse(colorText.replace(/```json|```/g, "").trim());
  } catch {
    bestColors = ["navy", "white", "black", "coral", "beige"];
  }
  const comboMsg = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1500,
    messages: [{ role: "user", content: `You are CocoStyle AI stylist.\nUser skin tone: ${skinTone} (undertone: ${undertone})\nBest colors: ${bestColors.join(", ")}\nWardrobe:\n${wardrobeText}\n\nCreate 5 stunning outfit combos ONLY from their wardrobe. For each:\n\n**Look [1-5]: [Creative Name]**\n👗 **Outfit**: [exact items]\n🎨 **Why it suits you**: [skin tone reason]\n⭐ **Confidence Score**: [X/10]\n🎯 **Best for**: [occasion]\n💄 **Beauty tip**: [makeup/hair tip]\n\nUnder 300 words total.` }]
  });
  const result = comboMsg.content[0].type === "text" ? comboMsg.content[0].text : "";
  return NextResponse.json({ result, skinTone, undertone, bestColors });
}