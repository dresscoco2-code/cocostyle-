import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { accessToken, type } = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const { data: items } = await supabase
    .from("wardrobe_items")
    .select("name, category, wear_count, last_worn_at")
    .order("wear_count", { ascending: true });

  if (!items || items.length === 0) {
    return NextResponse.json({ result: "No wardrobe items found. Add some clothes first!" });
  }
  const wardrobeText = items.map((i: {name: string; category: string; wear_count: number; last_worn_at: string}) =>
    `- ${i.name} (${i.category}) | worn ${i.wear_count} times | last worn: ${i.last_worn_at || "never"}`
  ).join("\n");

  const prompts: Record<string, string> = {
    rewear: `You are CocoStyle AI. Wardrobe:\n${wardrobeText}\n\nIdentify 5 most neglected items. For each:\n👗 **[Item Name]**\n🔄 **New Style**: [fresh styling idea]\n✨ **Pair with**: [other items from wardrobe]\n💡 **Why now**: [one sentence motivation]\n\nUnder 200 words.`,
    insights: `You are CocoStyle AI. Analyze:\n${wardrobeText}\n\n📊 **Wardrobe Stats**\n- Total items: [count]\n- Most worn category: [category]\n- Least worn: [category]\n\n🎨 **Style Pattern**: [2 sentences]\n\n⭐ **Most Loved**: [top 2]\n\n😴 **Sleeping in closet**: [top 3 least worn]\n\n💡 **Smart Tip**: [one actionable tip]\n\nUnder 150 words.`
  };

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompts[type] || prompts.insights }]
  });
  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ result: text });
}