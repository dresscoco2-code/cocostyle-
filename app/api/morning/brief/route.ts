import { NextResponse } from 'next/server';
import { runMorningBrief } from '@/lib/morning-brief-run';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await runMorningBrief(body);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    const status = message === 'Wardrobe is empty.' ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
