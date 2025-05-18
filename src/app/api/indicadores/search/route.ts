//src/api/indicadores/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { bigQueryClient } from '@/lib/analytics/client';

export async function GET(req: NextRequest) {
  const queryParam = req.nextUrl.searchParams.get('query')?.trim();

  if (!queryParam || queryParam.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  const query = `
    SELECT
      indicador_id AS id,
      nome,
      descricao
    FROM \`${bigQueryClient.projectId}.${bigQueryClient.dataset}.dim_indicadores\`
    WHERE LOWER(nome) LIKE ? OR LOWER(descricao) LIKE ?
    LIMIT 20
  `;

  try {
    const searchTerm = `%${queryParam.toLowerCase()}%`;
    const rows = await bigQueryClient.executeQuery(query, [searchTerm, searchTerm]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Erro ao buscar indicadores:', error);
    return NextResponse.json({ error: 'Erro ao buscar indicadores' }, { status: 500 });
  }
}
