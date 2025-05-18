
// app/api/indicadores/localidade/[municipio_id]/route.ts
import { NextResponse } from 'next/server';
import { getLocalidadeFull } from '@/services/indicadores';

export async function GET(
  req: Request,
  { params }: { params: { municipio_id: string } }
) {
  // Aguarda o params antes de acessar suas propriedades
  const resolvedParams = await params;
  const municipio_id = resolvedParams.municipio_id;
  
  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get('categoria') || '';

  try {
    const data = await getLocalidadeFull(municipio_id, categoria);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao buscar dados da localidade:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}