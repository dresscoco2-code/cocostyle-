const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

const DEFAULT_MODEL =
  process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022';

export async function anthropicJson<T>(options: {
  system: string;
  user: string;
  maxTokens?: number;
  /** When set, overrides ANTHROPIC_MODEL / default for this call only */
  model?: string;
}): Promise<T> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  const model = options.model ?? DEFAULT_MODEL;
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 2048,
      system: options.system,
      messages: [{ role: 'user', content: options.user }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((b) => b.type === 'text')?.text?.trim() ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Model did not return JSON');
  }
  return JSON.parse(jsonMatch[0]) as T;
}

type VisionMedia = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

export async function anthropicVisionJson<T>(options: {
  system: string;
  userText: string;
  imageBase64: string;
  mediaType: VisionMedia;
  maxTokens?: number;
  /** When set, overrides ANTHROPIC_MODEL / default for this call only */
  model?: string;
}): Promise<T> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  const model =
    options.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-20241022';
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 2048,
      system: options.system,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: options.mediaType,
                data: options.imageBase64,
              },
            },
            { type: 'text', text: options.userText },
          ],
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((b) => b.type === 'text')?.text?.trim() ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Model did not return JSON');
  }
  return JSON.parse(jsonMatch[0]) as T;
}
