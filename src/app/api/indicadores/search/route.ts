// src/api/indicadores/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buscarIndicadores } from '@/lib/analytics/indicadores';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const resultados = await buscarIndicadores(query);
    return NextResponse.json(resultados);
  } catch (error) {
    console.error('Erro ao buscar indicadores:', error);
    return NextResponse.json({ error: 'Erro ao buscar indicadores' }, { status: 500 });
  }
}
