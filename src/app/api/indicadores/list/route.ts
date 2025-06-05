import { listarIndicadores } from '@/lib/analytics/indicadores';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const indicadores = await listarIndicadores();
    return NextResponse.json(indicadores);
  } catch (error) {
    console.error('❌ Erro ao listar indicadores:', error);
    return NextResponse.json(
      { error: 'Erro ao listar indicadores' },
      { status: 500 }
    );
  }
}
