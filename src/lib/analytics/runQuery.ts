// lib/analytics/runQuery.ts
import { bigQueryClient } from './client';

export interface QueryParams {
  table: string;
  fields?: string[];
  filters?: Record<string, string | number>;
  orderBy?: string;
  limit?: number;
  offset?: number;
  groupBy?: string[];
}

export async function runQuery(params: QueryParams): Promise<Record<string, unknown>[]> {
  let sql = `SELECT ${params.fields?.join(', ') || '*'} FROM \`${params.table}\``;

  if (params.filters && Object.keys(params.filters).length > 0) {
    const whereClauses = Object.keys(params.filters)
      .map((field) => `${field} = @${field}`)
      .join(' AND ');
    sql += ` WHERE ${whereClauses}`;
  }

  if (params.groupBy) {
    sql += ` GROUP BY ${params.groupBy.join(', ')}`;
  }

  if (params.orderBy) {
    sql += ` ORDER BY ${params.orderBy}`;
  }

  if (params.limit) {
    sql += ` LIMIT ${params.limit}`;
  }

  if (params.offset) {
    sql += ` OFFSET ${params.offset}`;
  }

  const queryParams =
    params.filters && Object.keys(params.filters).length > 0
      ? Object.entries(params.filters).map(([name, value]) => ({
          name,
          parameterType: { type: typeof value === 'number' ? 'INT64' : 'STRING' },
          parameterValue: { value },
        }))
      : [];

  return bigQueryClient.executeQuery(sql, queryParams);
}
