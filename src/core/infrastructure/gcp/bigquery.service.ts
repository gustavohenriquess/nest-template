import { Logger } from '@nestjs/common';
import { BigQuery, Dataset } from '@google-cloud/bigquery';

export class BigQueryService {
  private bigquery: BigQuery;
  private readonly logger = new Logger(BigQueryService.name);

  constructor(projectId: string) {
    this.bigquery = new BigQuery({ projectId });
    this.logger.log(`BigQueryService initialized for project: ${projectId}`);
  }

  async createDataset(datasetId: string) {
    try {
      const [dataset] = await this.bigquery.createDataset(datasetId);
      this.logger.log(`Dataset ${dataset.id} created.`);
      return dataset;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error creating dataset ${datasetId}: ${message}`,
        stack,
      );
      throw error;
    }
  }

  async getDataset(datasetId: string): Promise<Dataset> {
    return await Promise.resolve(this.bigquery.dataset(datasetId));
  }

  async query<T = unknown>(query: string): Promise<T[]> {
    try {
      const [rows] = await this.bigquery.query(query);
      return rows as T[];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error executing query: ${message}`, stack);
      throw error;
    }
  }

  async insertRows(
    datasetId: string,
    tableId: string,
    rows: Record<string, unknown>[],
  ) {
    try {
      await this.bigquery.dataset(datasetId).table(tableId).insert(rows);
      this.logger.log(`Inserted ${rows.length} rows into ${tableId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error inserting rows into ${tableId}: ${message}`,
        stack,
      );
      throw error;
    }
  }
}
