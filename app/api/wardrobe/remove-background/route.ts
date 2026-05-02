import { NextResponse } from 'next/server';

const REMOVE_BG_URL = 'https://api.remove.bg/v1.0/removebg';

export async function POST(req: Request) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json({ error: 'REMOVE_BG_API_KEY is not configured' }, { status: 500 });
  }

  let imageBase64 = '';
  try {
    const body = (await req.json()) as { imageBase64?: string };
    imageBase64 = body.imageBase64?.replace(/^data:image\/\w+;base64,/, '').trim() ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!imageBase64) {
    return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
  }

  let inputBytes: Buffer;
  try {
    inputBytes = Buffer.from(imageBase64, 'base64');
  } catch {
    return NextResponse.json({ error: 'Invalid base64 image' }, { status: 400 });
  }

  if (inputBytes.length === 0) {
    return NextResponse.json({ error: 'Empty image data' }, { status: 400 });
  }

  const mime =
    inputBytes[0] === 0xff && inputBytes[1] === 0xd8
      ? 'image/jpeg'
      : inputBytes[0] === 0x89 && inputBytes[1] === 0x50 && inputBytes[2] === 0x4e && inputBytes[3] === 0x47
        ? 'image/png'
        : inputBytes.length >= 12 &&
            inputBytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
            inputBytes.subarray(8, 12).toString('ascii') === 'WEBP'
          ? 'image/webp'
          : 'image/jpeg';
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';

  const form = new FormData();
  form.append('size', 'auto');
  form.append(
    'image_file',
    new Blob([new Uint8Array(inputBytes)], { type: mime }),
    `image.${ext}`
  );

  const r = await fetch(REMOVE_BG_URL, {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: form,
  });

  if (!r.ok) {
    const text = await r.text();
    return NextResponse.json(
      { error: text || `remove.bg error (${r.status})` },
      { status: r.status >= 400 && r.status < 600 ? r.status : 502 }
    );
  }

  const outBuf = Buffer.from(await r.arrayBuffer());
  return NextResponse.json({ imageBase64: outBuf.toString('base64') });
}
