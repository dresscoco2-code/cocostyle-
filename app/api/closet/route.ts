import { NextRequest, NextResponse } from 'next/server';
import { loadWardrobeFromRequest } from '@/lib/wardrobe-from-request';

/**
 * Server-side wardrobe list — same auth + query as the /closet page
 * (getSession user id + wardrobe_items for that user).
 */
export async function GET(req: NextRequest) {
  const r = await loadWardrobeFromRequest(req);

  if (!r.accessToken || r.authError === 'missing_token') {
    return NextResponse.json({ error: 'Sign in required', items: [] }, { status: 401 });
  }
  if (r.authError || !r.userId) {
    return NextResponse.json({ error: 'Could not verify session', items: [] }, { status: 401 });
  }
  if (r.wardrobeError) {
    return NextResponse.json({ error: r.wardrobeError.message, items: [] }, { status: 500 });
  }

  return NextResponse.json({ items: r.items, userId: r.userId });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
