import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const bigquery = new BigQuery({
  projectId: 'observatudo-infra',
  // Adicione outras configurações se precisar
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const indicador_id = searchParams.get('indicador_id');
  const localidade_id = searchParams.get('localidade_id');

  if (!indicador_id || !localidade_id) {
    return NextResponse.json(
      { error: 'Parâmetros indicador_id e localidade_id são obrigatórios' },
      { status: 400 }
    );
  }

  const query = `
    SELECT
      indicador_id,
      localidade_id,
      data_referencia,
      valor,
      justificativa,
      fonte,
      data_insercao
    FROM \`observatudo-infra.dados.fact_indicadores\`
    WHERE indicador_id = @indicador_id AND localidade_id = @localidade_id
    ORDER BY data_referencia DESC
    LIMIT 10
  `;

  try {
    const [job] = await bigquery.createQueryJob({
      query,
      params: { indicador_id, localidade_id },
    });

    const [rows] = await job.getQueryResults();

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Erro na consulta BigQuery:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar BigQuery' },
      { status: 500 }
    );
  }
}
