// app/api/indicadores/localidade/[municipio_id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLocalidadeFullPorSubeixos } from '@/services/indicadores';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ municipio_id: string }> }
) {
  const { municipio_id } = await params;

  try {
    const body = await req.json();
    const subeixos = body.subeixos; // ✅ Corrigido para 'subeixos'

    if (
      !Array.isArray(subeixos) ||
      !subeixos.every(
        (s) =>
          typeof s === 'object' &&
          typeof s.id === 'string' &&
          typeof s.nome === 'string' &&
          Array.isArray(s.indicadores) &&
          s.indicadores.every((id: unknown) => typeof id === 'string') // ✅ Validação corrigida
      )
    ) {
      return NextResponse.json(
        { error: 'Formato de subeixos inválido' },
        { status: 400 }
      );
    }

    console.log(`📩 POST recebido com ${subeixos.length} subeixos para ${municipio_id}`);
    subeixos.forEach((s) => {
      console.log(`  - ${s.id} (${s.nome}): ${s.indicadores.join(', ')}`);
    });

    const data = await getLocalidadeFullPorSubeixos(municipio_id, subeixos);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Erro ao processar POST /localidade:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}