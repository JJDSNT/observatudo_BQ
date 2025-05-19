// app/api/indicadores/localidade/[municipio_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLocalidadeFullPorCategorias } from '@/services/indicadores';

export async function POST(
  req: NextRequest,
  { params }: { params: { municipio_id: string } }
) {
  const municipio_id = params.municipio_id;

  try {
    const body = await req.json();
    const categorias = body.categorias;

    if (!Array.isArray(categorias)) {
      return NextResponse.json(
        { error: 'Formato de categorias inválido' },
        { status: 400 }
      );
    }

    console.log(`📩 POST recebido com ${categorias.length} categorias para ${municipio_id}`);

    const data = await getLocalidadeFullPorCategorias(municipio_id, categorias);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erro ao processar POST /localidade:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
