// lib/analytics/client.ts
import { BigQuery } from '@google-cloud/bigquery';

export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  keyFilename?: string; // para rodar localmente ou CI/CD, se necessário
}

export class BigQueryClient {
  private client: BigQuery;
  private projectId: string;
  private datasetId: string;

  constructor(config: BigQueryConfig) {
    this.projectId = config.projectId;
    this.datasetId = config.datasetId;
    this.client = new BigQuery({
      projectId: this.projectId,
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

  get dataset() {
    return `${this.projectId}.${this.datasetId}`;
  }
}

// Singleton instance
export const bigQueryClient = new BigQueryClient({
  projectId: process.env.BIGQUERY_PROJECT_ID || '',
  datasetId: process.env.BIGQUERY_DATASET_ID || '',
});