import { BigQueryService } from './bigquery.service';
import { BigQuery } from '@google-cloud/bigquery';

jest.mock('@google-cloud/bigquery', () => {
  return {
    BigQuery: jest.fn().mockImplementation(() => ({
      createDataset: jest.fn(),
      dataset: jest.fn().mockReturnValue({
        table: jest.fn().mockReturnValue({
          insert: jest.fn(),
        }),
      }),
      query: jest.fn(),
    })),
  };
});

describe('BigQueryService', () => {
  let service: BigQueryService;
  let bigqueryMock: any;
  const projectId = 'test-project';

  beforeEach(() => {
    service = new BigQueryService(projectId);
    bigqueryMock = (service as any).bigquery;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDataset', () => {
    it('should create a dataset', async () => {
      const datasetId = 'test-dataset';
      const datasetMock = { id: datasetId };
      bigqueryMock.createDataset.mockResolvedValue([datasetMock]);

      const result = await service.createDataset(datasetId);

      expect(result).toBe(datasetMock);
      expect(bigqueryMock.createDataset).toHaveBeenCalledWith(datasetId);
    });

    it('should throw error if creation fails', async () => {
      const datasetId = 'test-dataset';
      const error = new Error('Creation failed');
      bigqueryMock.createDataset.mockRejectedValue(error);

      await expect(service.createDataset(datasetId)).rejects.toThrow(error);
    });
  });

  describe('getDataset', () => {
    it('should return a dataset instance', async () => {
      const datasetId = 'test-dataset';
      const datasetMock = { id: datasetId };
      bigqueryMock.dataset.mockReturnValue(datasetMock);

      const result = await service.getDataset(datasetId);

      expect(result).toBe(datasetMock);
      expect(bigqueryMock.dataset).toHaveBeenCalledWith(datasetId);
    });
  });

  describe('query', () => {
    it('should execute a query and return rows', async () => {
      const sql = 'SELECT * FROM table';
      const rows = [{ id: 1 }];
      bigqueryMock.query.mockResolvedValue([rows]);

      const result = await service.query(sql);

      expect(result).toBe(rows);
      expect(bigqueryMock.query).toHaveBeenCalledWith(sql);
    });

    it('should throw error if query fails', async () => {
      const sql = 'SELECT * FROM table';
      const error = new Error('Query failed');
      bigqueryMock.query.mockRejectedValue(error);

      await expect(service.query(sql)).rejects.toThrow(error);
    });
  });

  describe('insertRows', () => {
    it('should insert rows into a table', async () => {
      const datasetId = 'test-dataset';
      const tableId = 'test-table';
      const rows = [{ id: 1 }];
      const tableMock = { insert: jest.fn().mockResolvedValue([{}]) };
      const datasetMock = { table: jest.fn().mockReturnValue(tableMock) };
      bigqueryMock.dataset.mockReturnValue(datasetMock);

      await service.insertRows(datasetId, tableId, rows);

      expect(bigqueryMock.dataset).toHaveBeenCalledWith(datasetId);
      expect(datasetMock.table).toHaveBeenCalledWith(tableId);
      expect(tableMock.insert).toHaveBeenCalledWith(rows);
    });

    it('should throw error if insertion fails', async () => {
      const datasetId = 'test-dataset';
      const tableId = 'test-table';
      const rows = [{ id: 1 }];
      const error = new Error('Insertion failed');
      const tableMock = { insert: jest.fn().mockRejectedValue(error) };
      const datasetMock = { table: jest.fn().mockReturnValue(tableMock) };
      bigqueryMock.dataset.mockReturnValue(datasetMock);

      await expect(
        service.insertRows(datasetId, tableId, rows),
      ).rejects.toThrow(error);
    });
  });
});
