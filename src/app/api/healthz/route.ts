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
    await bigquery.createQueryJob({
      query: 'SELECT 1',
      dryRun: true,
    });
    result.bigquery = 'connected';
  } catch {
    result.bigquery = 'connection failed';
    result.status = 'error';
  }

  result.latencyMs = Date.now() - inicio;

  const statusCode = result.status === 'ok' ? 200 : 500;
  return NextResponse.json(result, { status: statusCode });
}
