// src/app/api/healthz/route.ts
import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';
// import { Storage } from '@google-cloud/storage';

const bigquery = new BigQuery();
// const storage = new Storage();

export async function GET() {
  const result = {
    status: 'ok' as 'ok' | 'error',
    bigquery: 'pending',
    // storage: 'skipped',
    timestamp: new Date().toISOString(),
  };

  // Verificação do BigQuery
  try {
    const [rows] = await bigquery.query('SELECT 1 AS alive');
    result.bigquery = (rows[0]?.alive === 1) ? 'connected' : 'unexpected result';
  } catch {
    result.bigquery = 'connection failed';
    result.status = 'error';
  }

  // Verificação do Google Cloud Storage
  /*
  try {
    await storage.getBuckets({ maxResults: 1 });
    result.storage = 'accessible';
  } catch {
    result.storage = 'inaccessible';
    result.status = 'error';
  }
  */

  const statusCode = result.status === 'ok' ? 200 : 500;
  return NextResponse.json(result, { status: statusCode });
}
