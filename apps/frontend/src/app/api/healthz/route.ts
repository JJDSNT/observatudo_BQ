// src/app/api/healthz/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const inicio = Date.now();

  const result = {
    status: 'ok' as 'ok' | 'error',
    cubejs: 'pending',
    latencyMs: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    const apiUrl = process.env.CUBEJS_API_URL ?? '';
    const res = await fetch(`${apiUrl}/readyz`, { cache: 'no-store' });
    if (res.ok) {
      result.cubejs = 'connected';
    } else {
      result.cubejs = 'connection failed';
      result.status = 'error';
    }
  } catch {
    result.cubejs = 'connection failed';
    result.status = 'error';
  }

  result.latencyMs = Date.now() - inicio;

  const statusCode = result.status === 'ok' ? 200 : 500;
  return NextResponse.json(result, { status: statusCode });
}
