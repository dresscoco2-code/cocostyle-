import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { occasion, weather, greeting } = await req.json();
  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: `You are CocoStyle AI stylist. Give a confident outfit suggestion for:
- Occasion: ${occasion}
- Weather: ${weather}
- Time: ${greeting}

Format:
🎯 **Outfit**: [specific outfit with colors]
👟 **Shoes**: [recommendation]
💍 **Accessories**: [2-3 accessories]
💄 **Beauty tip**: [quick tip]
✨ **Why it works**: [one sentence]

Under 120 words. Be specific and encouraging.`
    }]
  });
  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return NextResponse.json({ result: text });
}