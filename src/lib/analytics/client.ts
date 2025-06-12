// src/lib/analytics/client.ts
import { BigQuery } from "@google-cloud/bigquery";

export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  keyFilename?: string; // usado localmente
  keyFileJsonBase64?: string; // usado em produção
}

export class BigQueryClient {
  private readonly client: BigQuery;
  private readonly _projectId: string;
  private readonly _datasetId: string;

  constructor(config: BigQueryConfig) {
    this._projectId = config.projectId;
    this._datasetId = config.datasetId;

    let credentials;

    if (config.keyFileJsonBase64) {
      const decoded = Buffer.from(
        config.keyFileJsonBase64,
        "base64"
      ).toString();
      credentials = JSON.parse(decoded);
    }

    this.client = new BigQuery({
      projectId: this._projectId,
      ...(credentials ? { credentials } : {}),
      ...(config.keyFilename ? { keyFilename: config.keyFilename } : {}),
    });
  }

  async executeQuery<T = Record<string, unknown>>(
    query: string,
    params: unknown[] = []
  ): Promise<T[]> {
    const [rows] = await this.client.query({
      query,
      params,
      parameterMode: "positional",
    });
    return rows as T[];
  }

  get dataset() {
    return this._datasetId;
  }

  get projectId() {
    return this._projectId;
  }
}

// Singleton instance
export const bigQueryClient = new BigQueryClient({
  projectId: process.env.BIGQUERY_PROJECT_ID || "",
  datasetId: process.env.BIGQUERY_DATASET_ID || "",
  keyFilename: process.env.BIGQUERY_KEYFILE,
  keyFileJsonBase64: process.env.BIGQUERY_KEYFILE_JSON,
});
