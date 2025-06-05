// src/app/api/healthz/route.ts
import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery();

export async function GET() {
  const inicio = Date.now();

  const result = {
    status: 'ok' as 'ok' | 'error',
    bigquery: 'pending',
    latencyMs: 0,
    timestamp: new Date().toISOString(),
  };

  try {
    const [rows] = await bigquery.query('SELECT 1 AS alive');
    result.bigquery = (rows[0]?.alive === 1) ? 'connected' : 'unexpected result';
  } catch {
    result.bigquery = 'connection failed';
    result.status = 'error';
  }

  result.latencyMs = Date.now() - inicio;

  const statusCode = result.status === 'ok' ? 200 : 500;
  return NextResponse.json(result, { status: statusCode });
}
