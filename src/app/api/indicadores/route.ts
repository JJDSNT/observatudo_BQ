import { getIndicadoresPorRegiao } from '@/services/indicadores';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const regiao = searchParams.get('regiao');
    const inicio = searchParams.get('inicio');
    const fim = searchParams.get('fim');
    
    // Validação simples
    if (!categoria || !regiao || !inicio || !fim) {
      return NextResponse.json({ data: null, error: 'Parâmetros obrigatórios ausentes.' }, { status: 400 });
    }

    const data = await getIndicadoresPorRegiao(categoria, regiao, { inicio, fim });
    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    // Logar o erro se desejar
    return NextResponse.json({ data: null, error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
