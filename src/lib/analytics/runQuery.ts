import { bigQueryClient } from './client';

export interface QueryParams {
  table: string;
  fields?: string[];
  filters?: { [field: string]: any };
  orderBy?: string;
  limit?: number;
  offset?: number;
  groupBy?: string[];
}

export async function runQuery(params: QueryParams) {
  let sql = `SELECT ${params.fields?.join(', ') || '*'} FROM \`${params.table}\``;

  if (params.filters && Object.keys(params.filters).length) {
    const whereClauses = Object.entries(params.filters)
      .map(([field, value]) => `${field} = @${field}`)
      .join(' AND ');
    sql += ` WHERE ${whereClauses}`;
  }

  if (params.groupBy) sql += ` GROUP BY ${params.groupBy.join(', ')}`;
  if (params.orderBy) sql += ` ORDER BY ${params.orderBy}`;
  if (params.limit) sql += ` LIMIT ${params.limit}`;
  if (params.offset) sql += ` OFFSET ${params.offset}`;

  // Monta params para BigQuery
  const queryParams = params.filters
    ? Object.entries(params.filters).map(([name, value]) => ({ name, parameterType: { type: typeof value === 'number' ? 'INT64' : 'STRING' }, parameterValue: { value } }))
    : [];

  return bigQueryClient.executeQuery(sql, queryParams);
}
