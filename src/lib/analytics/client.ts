// lib/analytics/client.ts
import { BigQuery } from '@google-cloud/bigquery';

export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  keyFilename?: string; // para rodar localmente ou CI/CD, se necessário
}

export class BigQueryClient {
  private client: BigQuery;
  private _projectId: string;
  private _datasetId: string;

  constructor(config: BigQueryConfig) {
    this._projectId = config.projectId;
    this._datasetId = config.datasetId;
    this.client = new BigQuery({
      projectId: this._projectId,
      ...(config.keyFilename ? { keyFilename: config.keyFilename } : {}),
    });
  }

  async executeQuery(query: string, params: any[] = []) {
    const [rows] = await this.client.query({
      query,
      params,
      parameterMode: 'positional',
    });
    return rows;
  }

  // CORREÇÃO: O getter dataset deve retornar apenas o datasetId
  // O projectId já está sendo usado separadamente no QueryBuilder
  get dataset() {
    return this._datasetId; // ✅ Correto: retorna apenas 'dados'
  }

  // Getter para acessar o projectId publicamente
  get projectId() {
    return this._projectId;
  }
}

// Singleton instance
export const bigQueryClient = new BigQueryClient({
  projectId: process.env.BIGQUERY_PROJECT_ID || '',
  datasetId: process.env.BIGQUERY_DATASET_ID || '',
});