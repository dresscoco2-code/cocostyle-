import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { occasion, weather, greeting, accessToken } = await req.json();

  // Fetch user's wardrobe from Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );

  const { data: wardrobeItems } = await supabase
    .from("wardrobe_items")
    .select("name, category, image_url")
    .order("category");

  const wardrobeText = wardrobeItems && wardrobeItems.length > 0
    ? wardrobeItems.map(item => `- ${item.name} (${item.category})`).join("\n")
    : "No wardrobe items found.";

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are CocoStyle AI stylist. The user has these clothes in their wardrobe:

${wardrobeText}

Create an outfit ONLY using items from their wardrobe above for:
- Occasion: ${occasion}
- Weather: ${weather}
- Time: ${greeting}

Format:
🎯 **Outfit**: [specific items from their wardrobe]
👟 **Shoes**: [from their wardrobe if available]
💍 **Accessories**: [suggestions]
💄 **Beauty tip**: [quick tip]
✨ **Why it works**: [one sentence]

If they don't have enough items, suggest what's missing. Under 150 words.`
    }]
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ result: text });
}
