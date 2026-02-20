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
            this.logger.error(`Error creating dataset ${datasetId}:`, error.message);
            throw error;
        }
    }

    async getDataset(datasetId: string): Promise<Dataset> {
        return this.bigquery.dataset(datasetId);
    }

    async query<T = any>(query: string): Promise<T[]> {
        try {
            const [rows] = await this.bigquery.query(query);
            return rows;
        } catch (error) {
            this.logger.error(`Error executing query:`, error.message);
            throw error;
        }
    }

    async insertRows(datasetId: string, tableId: string, rows: any[]) {
        try {
            await this.bigquery.dataset(datasetId).table(tableId).insert(rows);
            this.logger.log(`Inserted ${rows.length} rows into ${tableId}`);
        } catch (error) {
            this.logger.error(`Error inserting rows into ${tableId}:`, error.message);
            throw error;
        }
    }
}
