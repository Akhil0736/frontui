import { NextResponse } from 'next/server';

const DEFAULT_LUNA_URL = 'https://web-production-0c1b9.up.railway.app';

function getLunaBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  const base = fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_LUNA_URL;
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => null);
    const rawInput =
      typeof body?.query === 'string' && body.query.trim().length > 0
        ? body.query
        : typeof body?.message === 'string' && body.message.trim().length > 0
        ? body.message
        : '';

    if (!rawInput) {
      return NextResponse.json(
        { error: 'Missing "query" in request body.' },
        { status: 400 }
      );
    }

    const response = await fetch(`${getLunaBaseUrl()}/luna/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: rawInput }),
    });

    const textPayload = await response.text();
    const payload = textPayload ? JSON.parse(textPayload) : null;

    if (!response.ok) {
      const message =
        payload?.error || payload?.message || `Luna backend returned ${response.status}`;
      throw new Error(message);
    }

    if (!payload || typeof payload.response !== 'string') {
      throw new Error('Unexpected response from Luna backend.');
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Luna proxy error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error connecting to Luna.';
    return NextResponse.json(
      {
        response:
          "I'm having trouble reaching Luna right now, but I'm still here for you. Let's try again in a moment.",
        error: message,
        isFallback: true,
      },
      { status: 200 }
    );
  }
}
